import client from './client';
import { DocumentItem, Folder } from '../types';

// --- Auth API ---
export const loginUser = async (email: string, name: string, avatar?: string) => {
  const response = await client.post('/auth/login', { email, name, avatar });
  return response.data;
};

// --- Folder API ---
export const fetchFolders = async (): Promise<Folder[]> => {
  const response = await client.get('/folders');
  return response.data;
};

export const createFolder = async (name: string, color: string): Promise<Folder> => {
  const response = await client.post('/folders', { name, color });
  return response.data;
};

export const shareFolderWithUser = async (folderId: string, email: string) => {
  const response = await client.post(`/folders/${folderId}/share`, { email });
  return response.data;
};

// --- Document API ---
export const fetchDocuments = async (): Promise<DocumentItem[]> => {
  const response = await client.get('/documents');
  return response.data;
};

export const fetchDocumentsByFolder = async (folderId: string): Promise<DocumentItem[]> => {
  const response = await client.get(`/documents?folderId=${folderId}`);
  return response.data;
};

export const createDocument = async (doc: Partial<DocumentItem>): Promise<DocumentItem> => {
  // The doc object contains imageUrl which is a base64 string.
  // The backend controller will handle uploading this to ImageKit.
  const response = await client.post('/documents', doc);
  return response.data;
};

export const syncGalleryItems = async (items: Partial<DocumentItem>[]): Promise<DocumentItem[]> => {
  const response = await client.post('/documents/sync', { items });
  return response.data;
};

export const updateDocumentDetails = async (id: string, updates: Partial<DocumentItem>): Promise<DocumentItem> => {
  const response = await client.put(`/documents/${id}`, updates);
  return response.data;
};

export const removeDocument = async (id: string): Promise<void> => {
  await client.delete(`/documents/${id}`);
};