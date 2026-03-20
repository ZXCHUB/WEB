import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, XCircle, AlertCircle, User } from 'lucide-react';

interface Executor {
  id: string;
  name: string;
  description?: string;
  status: 'Working' | 'Patched' | 'Updating';
  image?: string;
  createdAt: any;
  authorId: string;
}

export default function Executors() {
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'executors'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const executorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Executor[];
      setExecutors(executorsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching executors:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-white">
          SUPPORTED <span className="text-red-600">EXECUTORS</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Check the current status of Roblox executors to see which ones are working with ZXCHUB scripts.
        </p>
      </div>

      {executors.length === 0 ? (
        <div className="text-center p-12 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <ShieldAlert className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300 mb-2">No executors listed</h3>
          <p className="text-zinc-500">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {executors.map((executor, index) => (
            <motion.div
              key={executor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-6 hover:border-red-900/30 transition-colors"
            >
              <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 shrink-0">
                {executor.image ? (
                  <img src={executor.image} alt={executor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-zinc-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-zinc-100 truncate pr-4">{executor.name}</h3>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shrink-0 ${getStatusColor(executor.status)}`}>
                    {getStatusIcon(executor.status)}
                    {executor.status}
                  </div>
                </div>
                <Link to={`/profile/${executor.authorId}`} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors mb-2 w-fit">
                  <User className="w-3 h-3" />
                  View Author Profile
                </Link>
                
                {executor.description && (
                  <p className="text-zinc-400 text-sm line-clamp-2">
                    {executor.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
