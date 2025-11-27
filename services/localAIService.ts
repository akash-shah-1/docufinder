// Local AI Service - 100% Free, No API needed!
// Uses Tesseract.js for OCR and smart algorithms for categorization

import { DocumentItem } from '../types';
import { AnalysisResult, SearchResult } from './aiService';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from PDF
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from all pages (limit to first 10 pages for performance)
    const numPages = Math.min(pdf.numPages, 10);

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    return '';
  }
};

/**
 * Extract text from image using Tesseract OCR
 */
const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    // Create an image element to verify the file is a valid image
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    console.log('🖼️ Image loaded, starting OCR...');

    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    // Clean up
    URL.revokeObjectURL(imageUrl);

    return result.data.text;
  } catch (error) {
    console.error('OCR failed:', error);
    return '';
  }
};

/**
 * Extract text from file (handles both images and PDFs)
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();

  if (fileType === 'application/pdf') {
    console.log('📄 Extracting text from PDF...');
    return extractTextFromPDF(file);
  } else if (fileType.startsWith('image/')) {
    console.log('🖼️ Extracting text from image using OCR...');
    return extractTextFromImage(file);
  } else {
    console.warn('Unsupported file type:', fileType);
    return '';
  }
};

/**
 * Smart categorization based on keywords
 */
const categorizeDocument = (text: string, fileName: string): { category: string; tags: string[] } => {
  const combined = (text + ' ' + fileName).toLowerCase();

  // Identity documents
  if (
    /\b(passport|driver|license|id card|identity|national id|voter|aadhar|pan card)\b/i.test(combined) ||
    /\b(dob|date of birth|issued|expires)\b/i.test(combined)
  ) {
    return { category: 'Identity', tags: ['identity', 'id', 'verification', 'official'] };
  }

  // Financial documents
  if (
    /\b(receipt|invoice|bill|payment|transaction|amount|total|paid|due)\b/i.test(combined) ||
    /\$|₹|€|£|\d+\.\d{2}/.test(combined)
  ) {
    return { category: 'Receipt', tags: ['receipt', 'finance', 'payment', 'transaction'] };
  }

  // Medical documents
  if (
    /\b(medical|prescription|doctor|patient|hospital|clinic|diagnosis|medicine|pharmacy|health)\b/i.test(combined)
  ) {
    return { category: 'Medical', tags: ['medical', 'health', 'prescription', 'healthcare'] };
  }

  // Education documents
  if (
    /\b(certificate|diploma|degree|transcript|university|college|school|grade|marks|student)\b/i.test(combined)
  ) {
    return { category: 'Education', tags: ['education', 'certificate', 'academic', 'school'] };
  }

  // Travel documents
  if (
    /\b(ticket|boarding|flight|hotel|reservation|booking|travel|airport|destination)\b/i.test(combined)
  ) {
    return { category: 'Travel', tags: ['travel', 'ticket', 'booking', 'trip'] };
  }

  // Legal documents
  if (
    /\b(contract|agreement|legal|terms|conditions|clause|party|signed|witness)\b/i.test(combined)
  ) {
    return { category: 'Legal', tags: ['legal', 'contract', 'agreement', 'official'] };
  }

  // Notes/Documents
  if (
    /\b(note|memo|draft|reminder|todo|list)\b/i.test(combined)
  ) {
    return { category: 'Notes', tags: ['notes', 'memo', 'personal', 'draft'] };
  }

  // Default
  return { category: 'Other', tags: ['document', 'file'] };
};

/**
 * Extract important dates from text
 */
const extractDates = (text: string): { date?: string; label?: string } => {
  // Common date patterns
  const datePatterns = [
    // Expiry dates
    { pattern: /expir(?:y|es|ed)?\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i, label: 'Expiry Date' },
    { pattern: /valid\s+until\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i, label: 'Valid Until' },
    // Due dates
    { pattern: /due\s+date\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i, label: 'Due Date' },
    { pattern: /payment\s+due\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i, label: 'Payment Due' },
    // Issue dates
    { pattern: /issue(?:d)?\s+date\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i, label: 'Issue Date' },
    { pattern: /date\s+of\s+issue\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i, label: 'Issue Date' },
  ];

  for (const { pattern, label } of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return { date: match[1], label };
    }
  }

  return {};
};

/**
 * Generate smart title from text
 */
const generateTitle = (text: string, fileName: string, category: string): string => {
  // Try to find document-specific titles
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  // Look for title-like patterns
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    // Skip very short or very long lines
    if (trimmed.length > 10 && trimmed.length < 60) {
      // Check if it looks like a title (mostly uppercase or title case)
      const uppercaseRatio = (trimmed.match(/[A-Z]/g) || []).length / trimmed.length;
      if (uppercaseRatio > 0.5 || /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*/.test(trimmed)) {
        return trimmed.substring(0, 50);
      }
    }
  }

  // Fallback: use category + filename
  const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  return `${category} - ${cleanFileName}`.substring(0, 50);
};

/**
 * Generate summary from text
 */
const generateSummary = (text: string, category: string): string => {
  const wordCount = text.split(/\s+/).length;

  if (wordCount < 10) {
    return `${category} document with minimal text content`;
  }

  // Extract first meaningful sentence
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim().substring(0, 100);
    return firstSentence + (firstSentence.length === 100 ? '...' : '');
  }

  return `${category} document containing ${wordCount} words`;
};

/**
 * Analyze document using local OCR and smart algorithms
 */
export const analyzeDocumentWithLocalAI = async (file: File): Promise<AnalysisResult> => {
  try {
    console.log('🔍 Starting local AI analysis...');

    // Step 1: Extract text (from PDF or image)
    const ocrText = await extractTextFromFile(file);
    console.log('✅ Text extraction completed, extracted', ocrText.length, 'characters');

    // Step 2: Categorize based on content
    const { category, tags } = categorizeDocument(ocrText, file.name);

    // Step 3: Extract dates
    const { date: importantDate, label: dateLabel } = extractDates(ocrText);

    // Step 4: Generate title
    const title = generateTitle(ocrText, file.name, category);

    // Step 5: Generate summary
    const summary = generateSummary(ocrText, category);

    console.log('✅ Local AI analysis complete!');

    return {
      title,
      category,
      summary,
      tags,
      importantDate,
      dateLabel,
      ocrText: ocrText || undefined
    };
  } catch (error) {
    console.error('Local AI analysis failed:', error);

    // Fallback to filename-based analysis
    const fileName = file.name.toLowerCase();
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const { category, tags } = categorizeDocument(fileName, fileName);

    return {
      title: fileNameWithoutExt,
      category,
      summary: `${category} document`,
      tags
    };
  }
};

/**
 * Search documents using local algorithms
 */
export const searchDocumentsWithLocalAI = async (
  query: string,
  documents: DocumentItem[]
): Promise<SearchResult> => {
  if (documents.length === 0) {
    return { relevantDocIds: [], answer: 'No documents found in your library.' };
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  // Score each document based on relevance
  const scoredDocs = documents.map(doc => {
    let score = 0;
    const searchableText = `
      ${doc.title} 
      ${doc.summary} 
      ${doc.tags.join(' ')} 
      ${doc.category} 
      ${doc.ocrText || ''}
    `.toLowerCase();

    // Exact phrase match (highest score)
    if (searchableText.includes(queryLower)) {
      score += 100;
    }

    // Individual word matches
    queryWords.forEach(word => {
      const wordCount = (searchableText.match(new RegExp(word, 'g')) || []).length;
      score += wordCount * 10;
    });

    // Title match bonus
    if (doc.title.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Category match bonus
    if (doc.category.toLowerCase().includes(queryLower)) {
      score += 30;
    }

    // Tag match bonus
    if (doc.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 40;
    }

    // Date search
    if (doc.importantDate && queryLower.includes(doc.importantDate)) {
      score += 60;
    }

    return { doc, score };
  });

  // Filter and sort by score
  const relevantDocs = scoredDocs
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Generate answer
  let answer = '';
  if (relevantDocs.length === 0) {
    answer = `No documents found matching "${query}". Try different keywords or check your document library.`;
  } else if (relevantDocs.length === 1) {
    const doc = relevantDocs[0].doc;
    answer = `Found 1 document: "${doc.title}" (${doc.category}). ${doc.summary}`;
  } else {
    const topDocs = relevantDocs.slice(0, 3).map(({ doc }) => doc.title).join('", "');
    answer = `Found ${relevantDocs.length} documents matching "${query}". Top results: "${topDocs}".`;
  }

  return {
    relevantDocIds: relevantDocs.map(({ doc }) => doc.id),
    answer
  };
};
