
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import { searchDocumentsWithGemini } from '../services/geminiService';
import { Send, Bot, Sparkles, ScanLine, AlertTriangle, FileText } from 'lucide-react';
import { DocumentCard } from '../components/DocumentCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  relatedDocIds?: string[];
}

// Common stop words to filter/validate
const STOP_WORDS = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'that', 'this', 'to', 'in', 'for', 'of', 'with', 'as', 'those', 'these', 'there', 'are', 'it', 'if', 'be', 'by']);

export const AiSearch = () => {
  const { documents, folders, auth } = useApp();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'assistant', 
      text: `Hi ${auth.user?.name.split(' ')[0] || 'there'}! I can read the text inside your files. Try searching for a specific phone number, invoice code, or details like "Expiry date of my ID".`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scan Animation State
  const [scanProgress, setScanProgress] = useState(0);

  // Check for incoming query from "Get Insights"
  useEffect(() => {
    const state = location.state as { query?: string } | null;
    if (state?.query) {
      // Skip validation for auto-generated queries
      executeSearch(state.query, true);
      window.history.replaceState({}, document.title); 
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scanProgress]);

  // Animation loop for "Scanning"
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 5;
        });
      }, 150);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const validateQuery = (text: string): boolean => {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return false;
    
    // Check if ALL words are stop words
    const allStopWords = words.every(w => STOP_WORDS.has(w));
    
    if (allStopWords) {
      setValidationError("Please enter specific keywords (e.g., 'Invoice 123', 'Passport') instead of just common words.");
      return false;
    }

    // Check length
    if (text.length < 2) {
      setValidationError("Please enter a longer search term.");
      return false;
    }

    setValidationError('');
    return true;
  };

  const executeSearch = async (searchText: string, skipValidation = false) => {
    if (!searchText.trim() || isLoading) return;
    if (!skipValidation && !validateQuery(searchText)) return;

    setIsLoading(true);
    setValidationError('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: searchText };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await searchDocumentsWithGemini(searchText, documents);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: result.answer,
        relatedDocIds: result.relevantDocIds
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: "I had trouble reading your documents. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = query;
    setQuery('');
    executeSearch(text);
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={18} />
          AI Search (OCR Enabled)
        </h1>
        <div className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700">
          Deep Scan
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Avatar/Name */}
              <div className="flex items-center mb-1">
                {msg.role === 'assistant' ? (
                  <span className="flex items-center text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
                    <Bot size={10} className="mr-1" /> DocuMind
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    You
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                 {msg.text}
              </div>

              {/* Referenced Documents */}
              {msg.relatedDocIds && msg.relatedDocIds.length > 0 && (
                <div className="mt-3 w-full space-y-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 pl-1 mb-1 uppercase font-semibold">Evidence found in:</p>
                  {documents
                    .filter(doc => msg.relatedDocIds?.includes(doc.id))
                    .map(doc => (
                      <DocumentCard 
                        key={doc.id} 
                        doc={doc} 
                        showFolderBadge 
                        folderName={folders.find(f => f.id === doc.folderId)?.name}
                      />
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Scanning Animation UI */}
        {isLoading && (
          <div className="flex justify-start w-full">
             <div className="bg-slate-800/80 border border-indigo-500/30 p-4 rounded-2xl rounded-tl-none max-w-[80%] w-full backdrop-blur-sm shadow-lg shadow-indigo-900/20">
               <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-8 h-8">
                     <ScanLine size={32} className="text-indigo-400 absolute inset-0" />
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent animate-ping opacity-50 h-1 top-1/2"></div>
                  </div>
                  <div>
                    <p className="text-indigo-300 font-bold text-sm">Scanning Documents...</p>
                    <p className="text-[10px] text-indigo-400/60">Reading extracted text</p>
                  </div>
               </div>
               
               {/* Fake File Scanner Visual */}
               <div className="space-y-2">
                 {documents.slice(0, 3).map((d, i) => (
                   <div key={i} className="flex items-center gap-2 opacity-70">
                     <FileText size={12} className="text-slate-500" />
                     <div className="h-1.5 bg-slate-700 rounded-full flex-1 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-100"
                          style={{ 
                            width: `${Math.max(0, Math.min(100, scanProgress + (i * 20) - 20))}%`,
                            opacity: scanProgress > (i*10) ? 1 : 0
                          }}
                        ></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Toast */}
      {validationError && (
        <div className="px-4 pb-2">
          <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-300 font-medium">{validationError}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleFormSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="E.g. '0958' or 'Invoice #400'..."
            className="w-full bg-slate-800 text-white rounded-full py-3.5 pl-5 pr-12 border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-lg"
          />
          <button 
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-500 transition-colors shadow-md"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
