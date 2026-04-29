import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { MessageSquare, Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

interface LabAssistantProps {
  context: string;
}

export default function LabAssistant({ context }: LabAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const ai = getAI();
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the NeuroLab Assistant. Help the user understanding Artificial Learning.
        Current Context: ${context}
        User's question: ${query}
        Provide a concise, educational explanation with focus on the math or logic behind it.`,
      });
      
      setResponse(result.text || 'I could not find an answer for that.');
    } catch (error) {
      console.error('AI Error:', error);
      setResponse('Sorry, I encountered an error while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 md:w-96 glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[500px]"
          >
            <div className="p-4 bg-lab-primary/10 border-b border-lab-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lab-primary" />
                <span className="font-semibold text-sm">Lab Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {response && (
                <div className="prose prose-invert prose-sm max-w-none">
                  <Markdown>{response}</Markdown>
                </div>
              )}
              {!response && !isLoading && (
                <p className="text-sm text-slate-400 italic">
                  Ask me anything about "${context}" or Artificial Intelligence in general.
                </p>
              )}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-lab-primary animate-spin" />
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-lab-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  placeholder="How does this work?"
                  className="flex-1 bg-lab-bg border border-lab-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lab-primary"
                />
                <button
                  onClick={handleAsk}
                  disabled={isLoading}
                  className="p-2 bg-lab-primary text-lab-bg rounded-lg hover:bg-lab-secondary transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 group ${
          isOpen ? 'bg-slate-800 text-white' : 'bg-lab-primary text-lab-bg hover:scale-105'
        }`}
      >
        <Sparkles className="w-6 h-6" />
        {!isOpen && <span className="font-semibold whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500">Ask Lab AI</span>}
      </button>
    </div>
  );
}
