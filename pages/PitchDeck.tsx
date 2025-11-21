import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Brain, Shield, Zap, Globe, Users, Target } from 'lucide-react';

const Slide = ({ title, children, className = '' }: { title: string, children?: React.ReactNode, className?: string }) => (
  <div className={`w-full aspect-video bg-white text-slate-900 p-12 flex flex-col relative overflow-hidden border-b-8 border-indigo-600 page-break-after-always ${className}`}>
    {/* Background Elements */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 z-0"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-100 rounded-full -ml-16 -mb-16 z-0"></div>
    
    {/* Content */}
    <div className="relative z-10 flex-1 flex flex-col">
      <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight uppercase">{title}</h2>
      <div className="flex-1">
        {children}
      </div>
    </div>

    {/* Footer */}
    <div className="relative z-10 mt-auto flex justify-between items-end border-t border-slate-200 pt-4">
      <div className="flex items-center gap-2 text-indigo-600 font-bold">
        <Brain size={20} /> DocuMind AI
      </div>
      <div className="text-xs text-slate-400 font-mono">CONFIDENTIAL • INVESTOR DECK</div>
    </div>
  </div>
);

export const PitchDeck = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-800 font-sans text-slate-900">
      {/* Navigation Bar (Hidden when printing) */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md p-4 flex justify-between items-center z-50 print:hidden border-b border-slate-700">
        <button 
          onClick={() => navigate('/profile')}
          className="text-slate-300 hover:text-white flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={20} /> Back to App
        </button>
        <button 
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Download size={18} /> Download PDF
        </button>
      </div>

      {/* Slides Container */}
      <div className="max-w-5xl mx-auto py-24 space-y-8 print:p-0 print:space-y-0 print:w-full print:max-w-none">
        
        {/* SLIDE 1: TITLE */}
        <Slide title="The Future of Personal Filing" className="bg-slate-900 text-white border-indigo-500">
          <div className="h-full flex flex-col justify-center items-center text-center">
            <div className="w-32 h-32 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/50">
              <Brain size={64} className="text-white" />
            </div>
            <h1 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              DocuMind AI
            </h1>
            <p className="text-2xl text-slate-400 font-light max-w-2xl">
              Intelligent Document Management for the Mobile Generation
            </p>
            <div className="mt-12 flex gap-8 text-sm font-bold tracking-widest uppercase text-slate-500">
              <span>Scan</span> • <span>Analyze</span> • <span>Organize</span>
            </div>
          </div>
        </Slide>

        {/* SLIDE 2: PROBLEM */}
        <Slide title="The Problem">
          <div className="grid grid-cols-2 gap-12 h-full items-center">
            <div>
              <p className="text-3xl font-light leading-relaxed text-slate-600 mb-8">
                "Where is my insurance policy?"<br/>
                "Did I pay that bill?"
              </p>
              <p className="text-lg text-slate-600">
                We live in a digital world, yet our personal documents are a mess.
                Cloud storage is just a digital shoebox—unorganized and impossible to search.
              </p>
            </div>
            <div className="bg-slate-100 p-8 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col gap-4 opacity-75">
              <div className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
                <span className="text-slate-400">IMG_2934.jpg</span>
                <span className="text-red-400 font-bold">Unsearchable</span>
              </div>
              <div className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
                <span className="text-slate-400">Scan_001.pdf</span>
                <span className="text-red-400 font-bold">No Metadata</span>
              </div>
              <div className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
                <span className="text-slate-400">Screenshot_22.png</span>
                <span className="text-red-400 font-bold">Lost Forever</span>
              </div>
            </div>
          </div>
        </Slide>

        {/* SLIDE 3: SOLUTION */}
        <Slide title="The Solution">
          <div className="grid grid-cols-3 gap-8 h-full pt-8">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-indigo-900">Instant Analysis</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Gemini 3 Pro analyzes every pixel. It doesn't just read text; it understands context, categories, and urgency.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white mb-4">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-purple-900">Auto-Organization</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                No more manual folders. Documents identify themselves and sort into "Finance", "Medical", or "Identity" automatically.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Smart Retrieval</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ask natural questions like "When does my passport expire?" and get instant answers, not just file lists.
              </p>
            </div>
          </div>
        </Slide>

        {/* SLIDE 4: MARKET */}
        <Slide title="Market Opportunity">
          <div className="flex flex-col justify-between h-full">
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                 <div className="text-6xl font-black text-slate-900 mb-2">2.8B</div>
                 <div className="text-xl font-semibold text-indigo-600 uppercase tracking-wider">Smartphone Users</div>
                 <p className="mt-2 text-slate-500">Potential user base handling documents on mobile.</p>
              </div>
              <div>
                 <div className="text-6xl font-black text-slate-900 mb-2">$12B</div>
                 <div className="text-xl font-semibold text-indigo-600 uppercase tracking-wider">Personal Cloud Market</div>
                 <p className="mt-2 text-slate-500">Growing annually with demand for intelligent organization.</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 flex items-center gap-8 border border-slate-200">
              <div className="flex-1">
                 <h3 className="text-2xl font-bold mb-2">Why Now?</h3>
                 <p className="text-slate-600">
                   Multimodal AI models like Gemini have finally reached the speed and accuracy required to make OCR obsolete. We are moving from "Text Recognition" to "Document Understanding."
                 </p>
              </div>
              <Globe size={64} className="text-slate-300" />
            </div>
          </div>
        </Slide>

        {/* SLIDE 5: TRACTION */}
        <Slide title="Roadmap & Vision">
          <div className="space-y-6">
             <div className="flex gap-6">
               <div className="w-24 text-right font-bold text-indigo-600 pt-2">Q1 2025</div>
               <div className="flex-1 bg-white shadow-md p-6 rounded-xl border-l-4 border-indigo-600">
                 <h4 className="font-bold text-lg">MVP Launch</h4>
                 <p className="text-sm text-slate-500">Core upload, auto-tagging, and natural language search.</p>
               </div>
             </div>
             <div className="flex gap-6">
               <div className="w-24 text-right font-bold text-purple-600 pt-2">Q2 2025</div>
               <div className="flex-1 bg-white shadow-md p-6 rounded-xl border-l-4 border-purple-600">
                 <h4 className="font-bold text-lg">Integrations</h4>
                 <p className="text-sm text-slate-500">Direct sync with Gmail, Drive, and Dropbox.</p>
               </div>
             </div>
             <div className="flex gap-6">
               <div className="w-24 text-right font-bold text-slate-400 pt-2">Q4 2025</div>
               <div className="flex-1 bg-slate-50 p-6 rounded-xl border-l-4 border-slate-300 dashed">
                 <h4 className="font-bold text-lg text-slate-500">Enterprise API</h4>
                 <p className="text-sm text-slate-400">Offering our categorization engine to fintech apps.</p>
               </div>
             </div>
          </div>
        </Slide>

        {/* SLIDE 6: CONTACT */}
        <Slide title="Join Us">
           <div className="h-full flex flex-col items-center justify-center text-center bg-indigo-600 text-white -m-12 p-12">
              <Brain size={80} className="text-white/20 mb-8" />
              <h2 className="text-5xl font-black mb-8">Ready to scale.</h2>
              <p className="text-xl text-indigo-100 max-w-xl mb-12">
                We are raising our pre-seed round to accelerate product development and user acquisition.
              </p>
              
              <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <Users size={24} className="mx-auto mb-2" />
                  <p className="font-bold">founders@documind.ai</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <Globe size={24} className="mx-auto mb-2" />
                  <p className="font-bold">www.documind.ai</p>
                </div>
              </div>
           </div>
        </Slide>

      </div>

      <style>{`
        @media print {
          @page { size: landscape; margin: 0; }
          body { background: white; }
          .page-break-after-always { page-break-after: always; height: 100vh !important; width: 100vw !important; border: none !important; }
        }
      `}</style>
    </div>
  );
};