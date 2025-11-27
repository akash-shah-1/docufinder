// Hugging Face Inference API Service Implementation

import { DocumentItem } from '../types';
import { AnalysisResult, SearchResult } from './aiService';

const HF_API_KEY = (import.meta as any).env?.VITE_HUGGINGFACE_API_KEY;
// Use backend proxy to avoid CORS issues
const HF_PROXY_URL = 'http://localhost:5000/api/ai/huggingface';

// Using free models available on Hugging Face
// Simpler approach: Use ViT for image classification and GPT-2 for text
const IMAGE_MODEL = 'nlpconnect/vit-gpt2-image-captioning';
const TEXT_MODEL = 'gpt2';

/**
 * Helper to convert File to Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Query Hugging Face Inference API via backend proxy
 */
const queryHuggingFace = async (model: string, payload: any, retries = 3): Promise<any> => {
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${HF_PROXY_URL}/${model}`, {
        method: 'POST',
        headers: {
          'x-hf-api-key': HF_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 503) {
        // Model is loading, wait and retry
        const data = await response.json();
        const waitTime = data.estimated_time || 20;
        console.log(`Model loading, waiting ${waitTime}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        continue;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Hugging Face API error: ${error}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

/**
 * Analyze document using simple heuristics
 * Note: Hugging Face free Inference API has limitations
 * For better results, use Gemini or OpenAI
 */
export const analyzeDocumentWithHuggingFace = async (file: File): Promise<AnalysisResult> => {
  // Simple client-side analysis based on filename and file type
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
 * Search documents using Hugging Face Mistral
 */
export const searchDocumentsWithHuggingFace = async (
  query: string,
  documents: DocumentItem[]
): Promise<SearchResult> => {
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  if (documents.length === 0) {
    return { relevantDocIds: [], answer: 'No documents found in your library.' };
  }

  // Prepare document context (limit to prevent token overflow)
  const docContext = documents.slice(0, 20).map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    summary: doc.summary,
    tags: doc.tags.join(', ')
  }));

  // Use simple keyword-based search (more reliable than AI for this use case)
  const queryLower = query.toLowerCase();
  const relevantDocs = documents.filter(doc => {
    const titleMatch = doc.title.toLowerCase().includes(queryLower);
    const summaryMatch = doc.summary.toLowerCase().includes(queryLower);
    const tagMatch = doc.tags.some(tag => tag.toLowerCase().includes(queryLower));
    const categoryMatch = doc.category.toLowerCase().includes(queryLower);
    const ocrMatch = doc.ocrText?.toLowerCase().includes(queryLower);
    
    return titleMatch || summaryMatch || tagMatch || categoryMatch || ocrMatch;
  });

  const answer = relevantDocs.length > 0 
    ? `I found ${relevantDocs.length} document(s) matching "${query}". ${relevantDocs.slice(0, 3).map(d => d.title).join(', ')}.`
    : `No documents found matching "${query}". Try searching with different keywords.`;

  return {
    relevantDocIds: relevantDocs.slice(0, 10).map(d => d.id),
    answer: answer
  };
};
