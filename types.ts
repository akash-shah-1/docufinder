
export enum DocType {
  IMAGE = 'IMAGE',
  PDF = 'PDF', 
  OTHER = 'OTHER'
}

export interface User {
  email: string;
  name: string;
  avatar: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  summary: string;
  category: string; // Suggested by AI
  tags: string[];
  imageUrl: string;
  mimeType?: string; // e.g., 'application/pdf', 'image/jpeg'
  folderId: string; // 'root' or specific folder ID
  createdAt: number;
  contentAnalysis: string; // Full AI analysis text
  // New fields for reminders and storage
  importantDate?: string; // e.g. "2024-12-31"
  dateLabel?: string; // e.g. "Expires", "Due", "Event"
  fileSize?: number; // in bytes
  ocrText?: string; // Full extracted text from the document
}

export interface Folder {
  id: string;
  name: string;
  color: string; // Tailwind color class
  sharedWith: string[]; // Emails
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
