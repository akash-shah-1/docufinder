// Perplexity AI Service Implementation
// Fast and accurate text-based AI

import { DocumentItem } from '../types';
import { AnalysisResult, SearchResult } from './aiService';

const PERPLEXITY_API_KEY = (import.meta as any).env?.VITE_PERPLEXITY_API_KEY;
// Use backend proxy to avoid CORS issues
const PERPLEXITY_PROXY_URL = 'http://localhost:5000/api/ai/perplexity';

// Using Perplexity's Llama model
const MODEL = 'llama-3.1-sonar-large-128k-online';

/**
 * Analyze document using filename-based heuristics
 * Note: Perplexity doesn't support vision/image analysis
 * For AI-powered vision analysis, use Gemini or Local AI
 */
export const analyzeDocumentWithPerplexity = async (file: File): Promise<AnalysisResult> => {
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
 * Search documents using Perplexity AI
 */
export const searchDocumentsWithPerplexity = async (
  query: string,
  documents: DocumentItem[]
): Promise<SearchResult> => {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured');
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
    tags: doc.tags.join(', '),
    extractedText: doc.ocrText ? doc.ocrText.substring(0, 300) : undefined
  }));

  try {
    const response = await fetch(PERPLEXITY_PROXY_URL, {
      method: 'POST',
      headers: {
        'x-perplexity-api-key': PERPLEXITY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful document search assistant. Analyze the user\'s document library and provide relevant answers.'
          },
          {
            role: 'user',
            content: `User Query: "${query}"

Available Documents:
${JSON.stringify(docContext, null, 2)}

Task: Find documents relevant to the query and provide a helpful answer.

Respond in JSON format (no markdown):
{
  "relevantDocIds": ["id1", "id2"],
  "answer": "your helpful answer here"
}`
          }
        ],
        temperature: 0.4,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Perplexity API request failed');
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

    // Fallback: simple keyword matching
    const queryLower = query.toLowerCase();
    const relevantDocs = documents.filter(doc => 
      doc.title.toLowerCase().includes(queryLower) ||
      doc.summary.toLowerCase().includes(queryLower) ||
      doc.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      doc.category.toLowerCase().includes(queryLower) ||
      doc.ocrText?.toLowerCase().includes(queryLower)
    );

    return {
      relevantDocIds: relevantDocs.slice(0, 5).map(d => d.id),
      answer: relevantDocs.length > 0 
        ? `I found ${relevantDocs.length} document(s) matching "${query}".`
        : `No documents found matching "${query}".`
    };

  } catch (error) {
    console.error('Perplexity Search Failed:', error);
    
    // Fallback to simple search
    const queryLower = query.toLowerCase();
    const relevantDocs = documents.filter(doc => 
      doc.title.toLowerCase().includes(queryLower) ||
      doc.summary.toLowerCase().includes(queryLower)
    );

    return { 
      relevantDocIds: relevantDocs.slice(0, 5).map(d => d.id),
      answer: relevantDocs.length > 0 
        ? `Found ${relevantDocs.length} document(s) related to your query.`
        : 'Sorry, I couldn\'t find any matching documents.'
    };
  }
};
