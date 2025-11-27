import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import { getAIProvider, setAIProvider, AIProvider } from '../services/aiService';

export const Settings = () => {
  const navigate = useNavigate();
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(getAIProvider());

  const handleProviderChange = (provider: AIProvider) => {
    setAIProvider(provider);
    setCurrentProvider(provider);
  };

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-3 text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* AI Provider Selection */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg">
        <div className="flex items-center mb-4">
          <Sparkles size={20} className="text-indigo-400 mr-2" />
          <h2 className="text-lg font-bold text-white">AI Provider</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Choose which AI service to use for document analysis and search
        </p>

        <div className="space-y-3">
          {/* Local AI Option - Recommended */}
          <button
            onClick={() => handleProviderChange('local')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${currentProvider === 'local'
                ? 'border-green-500 bg-green-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">🤖</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white flex items-center gap-2">
                    Local AI
                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">FREE</span>
                  </div>
                  <div className="text-xs text-slate-400">OCR + Smart algorithms (No API needed!)</div>
                </div>
              </div>
              {currentProvider === 'local' && (
                <Check size={20} className="text-green-400" />
              )}
            </div>
          </button>

          {/* Gemini Option */}
          <button
            onClick={() => handleProviderChange('gemini')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${currentProvider === 'gemini'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Google Gemini</div>
                  <div className="text-xs text-slate-400">Fast & accurate vision AI</div>
                </div>
              </div>
              {currentProvider === 'gemini' && (
                <Check size={20} className="text-indigo-400" />
              )}
            </div>
          </button>

          {/* OpenAI Option */}
          <button
            onClick={() => handleProviderChange('openai')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${currentProvider === 'openai'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">OpenAI GPT-4</div>
                  <div className="text-xs text-slate-400">Advanced reasoning & OCR</div>
                </div>
              </div>
              {currentProvider === 'openai' && (
                <Check size={20} className="text-indigo-400" />
              )}
            </div>
          </button>

          {/* Perplexity Option */}
          <button
            onClick={() => handleProviderChange('perplexity')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${currentProvider === 'perplexity'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">🔍</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Perplexity</div>
                  <div className="text-xs text-slate-400">Smart search with online context</div>
                </div>
              </div>
              {currentProvider === 'perplexity' && (
                <Check size={20} className="text-indigo-400" />
              )}
            </div>
          </button>

          {/* Groq Option */}
          <button
            onClick={() => handleProviderChange('groq')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${currentProvider === 'groq'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">⚡</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Groq</div>
                  <div className="text-xs text-slate-400">Fast text search (no vision)</div>
                </div>
              </div>
              {currentProvider === 'groq' && (
                <Check size={20} className="text-indigo-400" />
              )}
            </div>
          </button>

          {/* Hugging Face Option */}
          <button
            onClick={() => handleProviderChange('huggingface')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${currentProvider === 'huggingface'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">🤗</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Hugging Face</div>
                  <div className="text-xs text-slate-400">Simple filename-based analysis</div>
                </div>
              </div>
              {currentProvider === 'huggingface' && (
                <Check size={20} className="text-indigo-400" />
              )}
            </div>
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">
            <strong className="text-slate-300">Note:</strong> Make sure you have the API key configured in your .env file for the selected provider.
          </p>
        </div>
      </div>
    </div>
  );
};
