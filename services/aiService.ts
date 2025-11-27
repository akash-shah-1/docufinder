// AI Service Abstraction Layer
// Supports switching between Gemini and OpenAI

import { DocumentItem } from '../types';

export type AIProvider = 'gemini' | 'openai' | 'huggingface' | 'groq' | 'local' | 'perplexity' | 'transformers';

export interface AnalysisResult {
  title: string;
  category: string;
  summary: string;
  tags: string[];
  importantDate?: string;
  dateLabel?: string;
  ocrText?: string;
}

export interface SearchResult {
  relevantDocIds: string[];
  answer: string;
}

// Get current AI provider from localStorage or default to Gemini
export const getAIProvider = (): AIProvider => {
  return (localStorage.getItem('ai_provider') as AIProvider) || 'gemini';
};

// Set AI provider
export const setAIProvider = (provider: AIProvider) => {
  localStorage.setItem('ai_provider', provider);
};

// Import provider-specific services
import * as geminiService from './geminiService';
import * as openaiService from './openaiService';
import * as huggingfaceService from './huggingfaceService';
import * as groqService from './groqService';
import * as localAIService from './localAIService';
import * as perplexityService from './perplexityService';
import * as transformersService from './transformersService';

/**
 * Analyze document using the selected AI provider
 */
export const analyzeDocument = async (file: File): Promise<AnalysisResult> => {
  const provider = getAIProvider();

  switch (provider) {
    case 'gemini':
      return geminiService.analyzeDocumentWithGemini(file);
    case 'openai':
      return openaiService.analyzeDocumentWithOpenAI(file);
    case 'huggingface':
      return huggingfaceService.analyzeDocumentWithHuggingFace(file);
    case 'groq':
      return groqService.analyzeDocumentWithGroq(file);
    case 'local':
      return localAIService.analyzeDocumentWithLocalAI(file);
    case 'perplexity':
      return perplexityService.analyzeDocumentWithPerplexity(file);
    case 'transformers':
      return transformersService.analyzeDocumentWithTransformers(file);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
};

/**
 * Search documents using the selected AI provider
 */
export const searchDocuments = async (
  query: string,
  documents: DocumentItem[]
): Promise<SearchResult> => {
  const provider = getAIProvider();

  switch (provider) {
    case 'gemini':
      return geminiService.searchDocumentsWithGemini(query, documents);
    case 'openai':
      return openaiService.searchDocumentsWithOpenAI(query, documents);
    case 'huggingface':
      return huggingfaceService.searchDocumentsWithHuggingFace(query, documents);
    case 'groq':
      return groqService.searchDocumentsWithGroq(query, documents);
    case 'local':
      return localAIService.searchDocumentsWithLocalAI(query, documents);
    case 'perplexity':
      return perplexityService.searchDocumentsWithPerplexity(query, documents);
    case 'transformers':
      return transformersService.searchDocumentsWithTransformers(query, documents);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
};
