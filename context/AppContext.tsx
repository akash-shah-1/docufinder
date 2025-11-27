import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DocumentItem, Folder, User, AuthState } from '../types';
import * as api from '../api/services';

interface AppContextType {
  auth: AuthState;
  login: (email?: string, name?: string, avatar?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  documents: DocumentItem[];
  folders: Folder[];
  isLoading: boolean;
  addDocument: (doc: DocumentItem) => Promise<void>;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  addFolder: (name: string, color?: string) => Promise<Folder | null>;
  removeFolder: (id: string) => Promise<void>;
  shareFolder: (folderId: string, email: string) => Promise<void>;
  getFolderById: (id: string) => Folder | undefined;
  getDocumentsByFolder: (folderId: string) => DocumentItem[];
  syncGallery: (items: Partial<DocumentItem>[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  // Data State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('documind_token');
      const userStr = localStorage.getItem('documind_user');
      
      if (token && userStr) {
        setAuth({ user: JSON.parse(userStr), isAuthenticated: true });
        await loadData();
      }
    };
    initApp();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedFolders, fetchedDocs] = await Promise.all([
        api.fetchFolders(),
        api.fetchDocuments()
      ]);
      setFolders(fetchedFolders);
      setDocuments(fetchedDocs);
    } catch (error) {
      console.error("Failed to load data", error);
      // If 401, logout
      if ((error as any)?.response?.status === 401) {
          logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email = "alex@example.com", name = "Alex Doe", avatar?: string) => {
    try {
      setIsLoading(true);
      const data = await api.loginUser(email, name, avatar);
      
      localStorage.setItem('documind_token', data.token);
      localStorage.setItem('documind_user', JSON.stringify(data.user));
      
      setAuth({ user: data.user, isAuthenticated: true });
      await loadData();
    } catch (error) {
      console.error("Login failed", error);
      alert("Could not connect to server. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('documind_token');
    localStorage.removeItem('documind_user');
    setAuth({ user: null, isAuthenticated: false });
    setDocuments([]);
    setFolders([]);
  };

  const updateProfile = async (name: string) => {
    try {
      const updatedUser = await api.updateUserProfile({ name });
      setAuth(prev => ({ ...prev, user: updatedUser as User }));
      localStorage.setItem('documind_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update profile failed", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteUserAccount();
      logout();
    } catch (error) {
      console.error("Delete account failed", error);
      throw error;
    }
  };

  const addFolder = async (name: string, color = 'bg-indigo-500'): Promise<Folder | null> => {
    try {
      const newFolder = await api.createFolder(name, color);
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (error) {
      console.error("Failed to create folder", error);
      return null;
    }
  };

  const removeFolder = async (id: string) => {
    try {
      await api.deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
      // Also update local docs to root to reflect backend change immediately
      setDocuments(prev => prev.map(d => d.folderId === id ? { ...d, folderId: 'root' } : d));
    } catch (error) {
      console.error("Failed to delete folder", error);
    }
  };

  const addDocument = async (doc: DocumentItem) => {
    try {
      const newDoc = await api.createDocument(doc);
      setDocuments(prev => [newDoc, ...prev]);
    } catch (error) {
      console.error("Failed to add document", error);
    }
  };

  const syncGallery = async (items: Partial<DocumentItem>[]) => {
    try {
      const newDocs = await api.syncGalleryItems(items);
      setDocuments(prev => [...newDocs, ...prev]);
    } catch (error) {
      console.error("Sync failed", error);
    }
  };

  const updateDocument = async (id: string, updates: Partial<DocumentItem>) => {
    try {
      const updatedDoc = await api.updateDocumentDetails(id, updates);
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDoc : doc));
    } catch (error) {
      console.error("Failed to update document", error);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await api.removeDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  const shareFolder = async (folderId: string, email: string) => {
    try {
      await api.shareFolderWithUser(folderId, email);
      setFolders(prev => prev.map(f => {
        if (f.id === folderId && !f.sharedWith.includes(email)) {
          return { ...f, sharedWith: [...f.sharedWith, email] };
        }
        return f;
      }));
    } catch (error) {
      console.error("Failed to share folder", error);
    }
  };

  const getFolderById = (id: string) => folders.find(f => f.id === id);
  
  const getDocumentsByFolder = (folderId: string) => documents.filter(d => d.folderId === folderId);

  return (
    <AppContext.Provider value={{ 
      auth, 
      login, 
      logout, 
      updateProfile,
      deleteAccount,
      documents, 
      folders, 
      isLoading,
      addDocument, 
      updateDocument,
      deleteDocument,
      addFolder,
      removeFolder,
      shareFolder,
      getFolderById,
      getDocumentsByFolder,
      syncGallery
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};