
import { pipeline, env } from '@huggingface/transformers';
import { AnalysisResult, SearchResult } from './aiService';
import { extractTextFromFile } from './localAIService';
import { DocumentItem } from '../types';

// Configuration for WebGPU
// @ts-ignore
env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Helper to convert File to URL
 */
const fileToUrl = (file: File): string => {
    return URL.createObjectURL(file);
};

/**
 * Analyze document using Transformers.js (Vision + NLP + LLM)
 */
export const analyzeDocumentWithTransformers = async (file: File): Promise<AnalysisResult> => {
    try {
        console.log('🤖 Starting Transformers.js (WebGPU) analysis...');

        // 1. Extract Text (OCR)
        console.log('📄 Extracting text...');
        const ocrText = await extractTextFromFile(file);

        // 2. Vision Analysis (if image)
        let visionSummary = '';
        let visionCategory = '';

        if (file.type.startsWith('image/')) {
            const imageUrl = fileToUrl(file);
            try {
                // Image Captioning
                console.log('👁️ Generating image caption...');
                // @ts-ignore
                const captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning', { device: 'webgpu' });
                const captionResult = await captioner(imageUrl);
                // @ts-ignore
                visionSummary = captionResult[0]?.generated_text || '';
                console.log('👁️ Caption:', visionSummary);

                // Zero-Shot Image Classification
                console.log('🏷️ Classifying image...');
                // @ts-ignore
                const classifier = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', { device: 'webgpu' });
                const candidateLabels = ['receipt', 'invoice', 'passport', 'id card', 'contract', 'form', 'letter', 'notes', 'medical report', 'prescription'];
                const classResult = await classifier(imageUrl, candidateLabels);
                // @ts-ignore
                visionCategory = classResult[0]?.label || 'Uncategorized';
                console.log('🏷️ Category:', visionCategory);

            } catch (visionError) {
                console.error('Vision analysis failed:', visionError);
            } finally {
                URL.revokeObjectURL(imageUrl);
            }
        }

        // 3. LLM Reasoning (The "Gemini-like" part)
        // We use a small instruction-tuned model to synthesize the info
        let finalSummary = visionSummary;
        let finalCategory = visionCategory;

        // FALLBACK: If vision failed to categorize, use regex-based categorization
        if (!finalCategory || finalCategory === 'Uncategorized') {
            const combined = (ocrText + ' ' + file.name).toLowerCase();
            if (/\b(passport|driver|license|id card)\b/i.test(combined)) finalCategory = 'Identity';
            else if (/\b(receipt|invoice|bill)\b/i.test(combined)) finalCategory = 'Finance';
            else if (/\b(medical|prescription)\b/i.test(combined)) finalCategory = 'Medical';
            else if (/\b(contract|agreement)\b/i.test(combined)) finalCategory = 'Legal';
        }

        if (ocrText && ocrText.length > 20) {
            try {
                console.log('🧠 Running Local LLM for reasoning...');
                // Using Qwen1.5-0.5B-Chat
                // @ts-ignore
                const generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', { device: 'webgpu' });

                const prompt = `<|im_start|>system
Analyze this document.
1. Category (e.g. Finance, Identity, Medical).
2. Summary (1 sentence).
<|im_end|>
<|im_start|>user
${visionSummary ? `Image: ${visionSummary}` : ''}
Text: ${ocrText.substring(0, 300)}
<|im_end|>
<|im_start|>assistant
Category:`;

                const output = await generator(prompt, { max_new_tokens: 60, do_sample: false });
                // @ts-ignore
                let generatedText = output[0]?.generated_text || '';

                // Clean up
                generatedText = generatedText.replace(prompt, '').trim();

                // Parse output
                const lines = generatedText.split('\n');
                const llmCategory = lines[0].replace('Category:', '').trim();

                if (llmCategory && llmCategory.length < 20) {
                    finalCategory = llmCategory;
                }

                const summaryPart = generatedText.match(/Summary:\s*(.+)/is);
                if (summaryPart) {
                    finalSummary = summaryPart[1].trim();
                } else if (lines.length > 1) {
                    finalSummary = lines.slice(1).join(' ').replace('Summary:', '').trim();
                }

                console.log('🧠 LLM Output:', { finalCategory, finalSummary, raw: generatedText });

            } catch (llmError) {
                console.error('LLM Reasoning failed:', llmError);
                // Fallback to basic concatenation
                if (!finalSummary) finalSummary = `${visionSummary}. ${ocrText.substring(0, 100)}...`;
            }
        }

        // Final fallback
        if (!finalCategory || finalCategory === 'Uncategorized') {
            finalCategory = 'Document';
        }
        if (!finalSummary) {
            finalSummary = 'Analyzed document.';
        }

        return {
            title: finalCategory + ' - ' + file.name,
            category: finalCategory,
            summary: finalSummary,
            tags: [finalCategory, 'local-ai', 'webgpu'].filter(Boolean),
            ocrText: ocrText
        };

    } catch (error) {
        console.error('Transformers Analysis Failed:', error);
        // CRITICAL FALLBACK: Return safe result
        return {
            title: file.name,
            category: 'Uncategorized',
            summary: 'AI Analysis Failed. Please check console.',
            tags: ['error'],
            ocrText: ''
        };
    }
};

/**
 * Search documents using Transformers.js (Embeddings + LLM Expansion)
 */
export const searchDocumentsWithTransformers = async (
    query: string,
    documents: DocumentItem[]
): Promise<SearchResult> => {
    if (documents.length === 0) return { relevantDocIds: [], answer: 'No documents.' };

    try {
        console.log('🧠 Loading embedding model...');
        // @ts-ignore
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { device: 'webgpu' });

        // Generate embedding for query
        const queryOutput = await extractor(query, { pooling: 'mean', normalize: true });
        const queryEmbedding = queryOutput.data;

        // Score documents
        const scoredDocs = await Promise.all(documents.map(async (doc) => {
            const textToEmbed = `${doc.title} ${doc.summary} ${doc.category} ${doc.ocrText || ''}`.substring(0, 512);

            const docOutput = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
            const docEmbedding = docOutput.data;

            let dotProduct = 0;
            for (let i = 0; i < queryEmbedding.length; i++) {
                dotProduct += queryEmbedding[i] * docEmbedding[i];
            }

            if (dotProduct > 0.1) console.log(`Search score for "${doc.title}": ${dotProduct}`);

            return { doc, score: dotProduct };
        }));

        const relevantDocs = scoredDocs
            .filter(d => d.score > 0.15)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        const answer = relevantDocs.length > 0
            ? `Found ${relevantDocs.length} relevant documents.`
            : 'No relevant documents found.';

        return {
            relevantDocIds: relevantDocs.map(d => d.doc.id),
            answer
        };

    } catch (error) {
        console.error('Transformers Search Failed:', error);
        return { relevantDocIds: [], answer: 'Search failed.' };
    }
};
