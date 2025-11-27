
import { GoogleGenAI, Type } from "@google/genai";
import { DocumentItem } from "../types";
import { AnalysisResult } from "./aiService";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to convert File to Base64
 */
export const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyze an uploaded image to auto-categorize and summarize it.
 * Uses gemini-3-pro-preview for high-level reasoning.
 */
export const analyzeDocumentWithGemini = async (file: File): Promise<AnalysisResult> => {
  const base64Data = await fileToGenerativePart(file);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Analyze this document/image. 
            1. Identify the document type/category (e.g., Identity, Finance, Medical, Education, Notes, Receipts, Travel). 
            2. Extract a short, descriptive title.
            3. Write a 1-sentence summary.
            4. Suggest 3-5 search tags.
            5. EXTRACT IMPORTANT DATES: If this is an ID, look for Expiry Date. If a Bill, look for Due Date. If an Event, look for Event Date. Return the date in YYYY-MM-DD format if possible, or a short string. Label it "Expires", "Due", etc.
            6. OCR EXTRACTION: Read and extract ALL visible text from the document into the 'ocrText' field. Be accurate with numbers, IDs, and phone numbers.
            
            Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            importantDate: { type: Type.STRING, description: "YYYY-MM-DD or short string" },
            dateLabel: { type: Type.STRING, description: "Expires, Due, Date, etc." },
            ocrText: { type: Type.STRING, description: "Full text extracted from the document"}
          },
          required: ["title", "category", "summary", "tags"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback
    return {
      title: file.name,
      category: "Uncategorized",
      summary: "Could not analyze document.",
      tags: []
    };
  }
};

/**
 * Chat with documents using natural language.
 * Uses gemini-3-pro-preview to understand the query and filter the list.
 */
export const searchDocumentsWithGemini = async (query: string, documents: DocumentItem[]): Promise<{ relevantDocIds: string[]; answer: string; }> => {
  if (documents.length === 0) return { relevantDocIds: [], answer: "No documents found." };

  // Create a lightweight representation of the docs for the prompt
  // We include OCR text here so the LLM can search inside the file content
  const docContext = documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    summary: doc.summary,
    tags: doc.tags.join(", "),
    date: new Date(doc.createdAt).toLocaleDateString(),
    importantDate: doc.importantDate ? `${doc.dateLabel}: ${doc.importantDate}` : undefined,
    extractedContent: doc.ocrText ? doc.ocrText.substring(0, 1500) : "No text extracted" // Limit context window if needed
  }));

  const prompt = `
    You are a helpful document assistant.
    User Query: "${query}"
    
    Here is the user's document library metadata and extracted text (OCR):
    ${JSON.stringify(docContext)}

    Task:
    1. SEARCH RIGOROUSLY: Look for exact matches of numbers (e.g. "0958"), names, or keywords in the 'extractedContent' field.
       - If the query contains a sequence of digits, verify if that sequence appears in any 'extractedContent'.
    2. Identify which documents are most relevant to the query based on their text content.
    3. Formulate a natural language answer addressing the user's request based on the relevant documents found.
    4. If the user asks for a specific document, mention its title and summary.
    5. If no documents match, say so politely.

    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevantDocIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            answer: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No search response");

  } catch (error) {
    console.error("Gemini Search Failed:", error);
    return { relevantDocIds: [], answer: "Sorry, I couldn't perform the search right now." };
  }
};
