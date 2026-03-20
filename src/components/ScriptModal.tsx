import { motion, AnimatePresence } from 'motion/react';
import { X, Code2, User, Heart, Eye, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Comments from './Comments';
import { useState } from 'react';

interface ScriptModalProps {
  script: any;
  isOpen: boolean;
  onClose: () => void;
  hasLiked: boolean;
  toggleLike: (id: string, likedBy: string[]) => void;
  copyToClipboard: (code: string, id: string) => void;
  copiedId: string | null;
}

export default function ScriptModal({
  script,
  isOpen,
  onClose,
  hasLiked,
  toggleLike,
  copyToClipboard,
  copiedId
}: ScriptModalProps) {
  return (
    <AnimatePresence>
      {isOpen && script && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-10"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/50 bg-zinc-900/20">
              <h2 className="text-2xl font-bold text-white truncate pr-8">{script.title}</h2>
              <button
                onClick={onClose}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 flex-1 custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {script.image ? (
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-xl overflow-hidden border border-zinc-800/50 flex-shrink-0">
                    <img src={script.image} alt={script.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-16 h-16 text-zinc-800" />
                  </div>
                )}
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {script.isPremium && (
                      <span className="px-3 py-1 rounded-md bg-red-900/80 text-white text-sm font-bold border border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                        PREMIUM
                      </span>
                    )}
                    {script.executor && (
                      <span className="px-3 py-1 rounded-md bg-red-500/10 text-red-400 text-sm font-bold border border-red-500/20">
                        {script.executor}
                      </span>
                    )}
                    <Link to={`/profile/${script.authorId}`} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors">
                      <User className="w-4 h-4" />
                      View Author Profile
                    </Link>
                    <span className="text-sm text-zinc-500 ml-auto">
                      {script.createdAt?.toDate ? new Date(script.createdAt.toDate()).toLocaleDateString() : ''}
                    </span>
                  </div>
                  
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap mb-6 flex-1">
                    {script.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                      <button 
                        onClick={() => toggleLike(script.id, script.likedBy)}
                        className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                      >
                        <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                        {script.likes || 0}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-5 h-5" />
                        {script.views || 0}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(script.code, script.id)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors font-bold shadow-lg shadow-red-900/20"
                    >
                      {copiedId === script.id ? (
                        <>
                          <Check className="w-5 h-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy Script
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-red-500" />
                  Source Code
                </h3>
                <div className="relative group">
                  <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-x-auto text-sm text-zinc-300 font-mono custom-scrollbar max-h-96">
                    <code>{script.code}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(script.code, script.id)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    title="Copy code"
                  >
                    {copiedId === script.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Comments targetId={script.id} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
