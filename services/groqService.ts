// Groq AI Service Implementation
// Fast inference with Llama models

import { DocumentItem } from '../types';
import { AnalysisResult, SearchResult } from './aiService';

const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1';

// Groq no longer supports vision models in free tier
// Using fast text model for analysis
const TEXT_MODEL = 'llama-3.1-70b-versatile';

/**
 * Helper to convert File to Base64 data URL
 */
const fileToBase64DataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyze document using filename-based heuristics
 * Note: Groq no longer supports vision models in free tier
 * For AI-powered analysis, use Gemini instead
 */
export const analyzeDocumentWithGroq = async (file: File): Promise<AnalysisResult> => {
  // Simple client-side analysis based on filename
  const fileName = file.name.toLowerCase();
  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

  let category = 'Other';
  let tags: string[] = ['document'];
  let summary = `${file.type || 'Document'} uploaded successfully`;

  // Categorize based on filename keywords
  if (fileName.includes('id') || fileName.includes('passport') || fileName.includes('license') || fileName.includes('card')) {
    category = 'Identity';
    tags = ['identity', 'id', 'verification'];
    summary = 'Identity document';
  } else if (fileName.includes('receipt') || fileName.includes('invoice') || fileName.includes('bill') || fileName.includes('payment')) {
    category = 'Receipt';
    tags = ['receipt', 'finance', 'payment'];
    summary = 'Financial receipt or invoice';
  } else if (fileName.includes('medical') || fileName.includes('prescription') || fileName.includes('health') || fileName.includes('doctor')) {
    category = 'Medical';
    tags = ['medical', 'health', 'records'];
    summary = 'Medical document or health record';
  } else if (fileName.includes('certificate') || fileName.includes('diploma') || fileName.includes('degree') || fileName.includes('transcript')) {
    category = 'Education';
    tags = ['education', 'certificate', 'academic'];
    summary = 'Educational certificate or document';
  } else if (fileName.includes('ticket') || fileName.includes('boarding') || fileName.includes('flight') || fileName.includes('hotel')) {
    category = 'Travel';
    tags = ['travel', 'ticket', 'booking'];
    summary = 'Travel document or booking';
  } else if (fileName.includes('contract') || fileName.includes('agreement') || fileName.includes('legal') || fileName.includes('terms')) {
    category = 'Legal';
    tags = ['legal', 'contract', 'agreement'];
    summary = 'Legal document or contract';
  } else if (fileName.includes('note') || fileName.includes('memo') || fileName.includes('draft')) {
    category = 'Notes';
    tags = ['notes', 'memo', 'draft'];
    summary = 'Note or memo document';
  } else if (file.type.includes('pdf')) {
    category = 'Other';
    tags = ['pdf', 'document'];
    summary = 'PDF document';
  } else if (file.type.includes('image')) {
    category = 'Other';
    tags = ['image', 'photo'];
    summary = 'Image file';
  }

  return {
    title: fileNameWithoutExt,
    category: category,
    summary: summary,
    tags: tags
  };
};

/**
 * Search documents using Groq Llama
 */
export const searchDocumentsWithGroq = async (
  query: string,
  documents: DocumentItem[]
): Promise<SearchResult> => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  if (documents.length === 0) {
    return { relevantDocIds: [], answer: 'No documents found in your library.' };
  }

  // Prepare document context
  const docContext = documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    summary: doc.summary,
    tags: doc.tags.join(', '),
    date: new Date(doc.createdAt).toLocaleDateString(),
    importantDate: doc.importantDate ? `${doc.dateLabel}: ${doc.importantDate}` : undefined,
    extractedContent: doc.ocrText ? doc.ocrText.substring(0, 500) : undefined
  }));

  try {
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful document search assistant. Search through documents and provide relevant answers based on their content.'
          },
          {
            role: 'user',
            content: `User Query: "${query}"

Document Library:
${JSON.stringify(docContext, null, 2)}

Task:
1. Search for exact matches of numbers, names, or keywords in the documents
2. Identify which documents are most relevant to the query
3. Provide a natural language answer
4. If no documents match, say so politely

Return ONLY valid JSON with this structure (no markdown, no extra text):
{
  "relevantDocIds": ["id1", "id2"],
  "answer": "your helpful answer here"
}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('Groq API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        relevantDocIds: Array.isArray(parsed.relevantDocIds) ? parsed.relevantDocIds : [],
        answer: parsed.answer || 'Found some relevant documents.'
      };
    }

    throw new Error('Could not parse JSON response');
  } catch (error) {
    console.error('Groq Search Failed:', error);

    // Fallback to simple keyword search
    const queryLower = query.toLowerCase();
    const relevantDocs = documents.filter(doc =>
      doc.title.toLowerCase().includes(queryLower) ||
      doc.summary.toLowerCase().includes(queryLower) ||
      doc.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      doc.ocrText?.toLowerCase().includes(queryLower)
    );

    return {
      relevantDocIds: relevantDocs.slice(0, 10).map(d => d.id),
      answer: relevantDocs.length > 0
        ? `I found ${relevantDocs.length} document(s) matching "${query}".`
        : `No documents found matching "${query}".`
    };
  }
};
