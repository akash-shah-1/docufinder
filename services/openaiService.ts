// OpenAI Service Implementation

import { DocumentItem } from '../types';
import { AnalysisResult, SearchResult } from './aiService';

const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Helper to convert File to Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
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
 * Analyze document using OpenAI GPT-4 Vision
 */
export const analyzeDocumentWithOpenAI = async (file: File): Promise<AnalysisResult> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const base64Image = await fileToBase64(file);

  const prompt = `Analyze this document/image. 
1. Identify the document type/category (e.g., Identity, Finance, Medical, Education, Notes, Receipts, Travel). 
2. Extract a short, descriptive title.
3. Write a 1-sentence summary.
4. Suggest 3-5 search tags.
5. EXTRACT IMPORTANT DATES: If this is an ID, look for Expiry Date. If a Bill, look for Due Date. If an Event, look for Event Date. Return the date in YYYY-MM-DD format if possible, or a short string. Label it "Expires", "Due", etc.
6. OCR EXTRACTION: Read and extract ALL visible text from the document into the 'ocrText' field. Be accurate with numbers, IDs, and phone numbers.

Return ONLY valid JSON with this structure:
{
  "title": "string",
  "category": "string",
  "summary": "string",
  "tags": ["string"],
  "importantDate": "string (optional)",
  "dateLabel": "string (optional)",
  "ocrText": "string (optional)"
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return result as AnalysisResult;
  } catch (error) {
    console.error('OpenAI Analysis Failed:', error);
    return {
      title: file.name,
      category: 'Uncategorized',
      summary: 'Could not analyze document.',
      tags: []
    };
  }
};

/**
 * Search documents using OpenAI
 */
export const searchDocumentsWithOpenAI = async (
  query: string,
  documents: DocumentItem[]
): Promise<SearchResult> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  if (documents.length === 0) {
    return { relevantDocIds: [], answer: 'No documents found.' };
  }

  const docContext = documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    summary: doc.summary,
    tags: doc.tags.join(', '),
    date: new Date(doc.createdAt).toLocaleDateString(),
    importantDate: doc.importantDate ? `${doc.dateLabel}: ${doc.importantDate}` : undefined,
    extractedContent: doc.ocrText ? doc.ocrText.substring(0, 1500) : 'No text extracted'
  }));

  const prompt = `You are a helpful document assistant.
User Query: "${query}"

Here is the user's document library metadata and extracted text (OCR):
${JSON.stringify(docContext)}

Task:
1. SEARCH RIGOROUSLY: Look for exact matches of numbers (e.g. "0958"), names, or keywords in the 'extractedContent' field.
2. Identify which documents are most relevant to the query based on their text content.
3. Formulate a natural language answer addressing the user's request based on the relevant documents found.
4. If the user asks for a specific document, mention its title and summary.
5. If no documents match, say so politely.

Return ONLY valid JSON with this structure:
{
  "relevantDocIds": ["string"],
  "answer": "string"
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return result as SearchResult;
  } catch (error) {
    console.error('OpenAI Search Failed:', error);
    return { relevantDocIds: [], answer: 'Sorry, I couldn\'t perform the search right now.' };
  }
};
