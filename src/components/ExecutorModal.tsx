import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Comments from './Comments';

interface ExecutorModalProps {
  executor: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExecutorModal({
  executor,
  isOpen,
  onClose
}: ExecutorModalProps) {
  if (!isOpen || !executor) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Working': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Patched': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Updating': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Working': return 'bg-green-950/30 text-green-400 border-green-900/50';
      case 'Patched': return 'bg-red-950/30 text-red-400 border-red-900/50';
      case 'Updating': return 'bg-yellow-950/30 text-yellow-400 border-yellow-900/50';
      default: return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && executor && (
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
            className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-10"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/50 bg-zinc-900/20">
              <h2 className="text-2xl font-bold text-white truncate pr-8 flex items-center gap-3">
                {executor.name}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shrink-0 ${getStatusColor(executor.status)}`}>
                  {getStatusIcon(executor.status)}
                  {executor.status}
                </div>
              </h2>
              <button
                onClick={onClose}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 flex-1 custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-full md:w-1/3 aspect-square rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {executor.image ? (
                    <img src={executor.image} alt={executor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ShieldAlert className="w-16 h-16 text-zinc-800" />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <Link to={`/profile/${executor.authorId}`} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors">
                      <User className="w-4 h-4" />
                      View Author Profile
                    </Link>
                    <span className="text-sm text-zinc-500 ml-auto">
                      {executor.createdAt?.toDate ? new Date(executor.createdAt.toDate()).toLocaleDateString() : ''}
                    </span>
                  </div>
                  
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap flex-1">
                    {executor.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <Comments targetId={executor.id} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
