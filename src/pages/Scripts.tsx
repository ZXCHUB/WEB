import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Code2, Copy, Check, Clock, User, Heart, Eye } from 'lucide-react';
import ScriptModal from '../components/ScriptModal';

interface Script {
  id: string;
  title: string;
  description: string;
  code: string;
  executor?: string;
  image?: string;
  createdAt: any;
  authorId: string;
  likes?: number;
  likedBy?: string[];
  views?: number;
  isPremium?: boolean;
}

export default function Scripts() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    const q = query(collection(db, 'scripts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scriptsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Script[];
      setScripts(scriptsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching scripts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const copyToClipboard = async (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    
    // Increment views
    try {
      const scriptRef = doc(db, 'scripts', id);
      await updateDoc(scriptRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error("Error updating views:", error);
    }
  };

  const toggleLike = async (scriptId: string, currentLikedBy: string[] = []) => {
    if (!user) {
      alert("Please sign in to like scripts");
      return;
    }

    const scriptRef = doc(db, 'scripts', scriptId);
    const hasLiked = currentLikedBy.includes(user.uid);

    try {
      if (hasLiked) {
        await updateDoc(scriptRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(scriptRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = (script.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (script.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'all') return matchesSearch;
    if (categoryFilter === 'free') return matchesSearch && !script.isPremium;
    if (categoryFilter === 'premium') return matchesSearch && script.isPremium;
    
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-white">
          OUR <span className="text-red-600">SCRIPTS</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
          Browse our collection of high-performance, undetected Roblox scripts developed by the ZXCHUB team.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
          <div className="relative w-full md:w-2/3">
            <input
              type="text"
              placeholder="Search scripts by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all shadow-lg"
            />
          </div>
          <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-zinc-800 shadow-lg w-full md:w-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                categoryFilter === 'all' 
                  ? 'bg-zinc-800 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('free')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                categoryFilter === 'free' 
                  ? 'bg-zinc-800 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setCategoryFilter('premium')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                categoryFilter === 'premium' 
                  ? 'bg-red-900/40 text-red-500 shadow-md border border-red-900/30' 
                  : 'text-zinc-400 hover:text-red-400 hover:bg-red-900/10'
              }`}
            >
              Premium
            </button>
          </div>
        </div>
      </div>

      {filteredScripts.length === 0 ? (
        <div className="text-center p-12 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <Code2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300 mb-2">No scripts found</h3>
          <p className="text-zinc-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script, index) => {
            const hasLiked = user ? (script.likedBy || []).includes(user.uid) : false;
            
            return (
              <motion.div
                key={script.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 overflow-hidden flex flex-col group hover:border-red-900/50 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.1)]"
              >
                {script.image ? (
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
                    <img 
                      src={script.image} 
                      alt={script.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 z-20 flex gap-2">
                      {script.isPremium && (
                        <span className="px-2.5 py-1 rounded-md bg-red-900/80 backdrop-blur-md text-white text-xs font-bold border border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                          PREMIUM
                        </span>
                      )}
                      {script.executor && (
                        <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-red-400 text-xs font-bold border border-red-900/30">
                          {script.executor}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-zinc-900/50 flex items-center justify-center relative border-b border-zinc-800/50">
                    <Code2 className="w-16 h-16 text-zinc-800" />
                    <div className="absolute top-3 right-3 z-20 flex gap-2">
                      {script.isPremium && (
                        <span className="px-2.5 py-1 rounded-md bg-red-900/80 backdrop-blur-md text-white text-xs font-bold border border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                          PREMIUM
                        </span>
                      )}
                      {script.executor && (
                        <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-red-400 text-xs font-bold border border-red-900/30">
                          {script.executor}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-zinc-100 line-clamp-1 mb-2">{script.title}</h3>
                  <Link to={`/profile/${script.authorId}`} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors mb-4 w-fit">
                    <User className="w-3 h-3" />
                    View Author Profile
                  </Link>
                  
                  <p className="text-zinc-400 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {script.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(script.id, script.likedBy);
                        }}
                        className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                      >
                        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                        {script.likes || 0}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {script.views || 0}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScript(script);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-500 transition-colors text-sm font-bold border border-red-900/30"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ScriptModal
        script={selectedScript}
        isOpen={!!selectedScript}
        onClose={() => setSelectedScript(null)}
        hasLiked={user ? (selectedScript?.likedBy || []).includes(user.uid) : false}
        toggleLike={toggleLike}
        copyToClipboard={copyToClipboard}
        copiedId={copiedId}
      />
    </div>
  );
}
