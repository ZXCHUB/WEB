import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { UserData } from '../contexts/AuthContext';
import { ShieldAlert, CheckCircle2, Clock, Calendar, Code2, Heart, Eye, Copy, Check } from 'lucide-react';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [userScripts, setUserScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          setProfileUser({ uid: userDoc.id, ...userDoc.data() } as UserData);
        } else {
          setProfileUser(null);
        }

        // Fetch user's scripts
        const scriptsQuery = query(
          collection(db, 'scripts'),
          where('authorId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const scriptsSnapshot = await getDocs(scriptsQuery);
        setUserScripts(scriptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const copyToClipboard = (code: string, scriptId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(scriptId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Unknown';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-zinc-300 mb-4">User Not Found</h2>
        <p className="text-zinc-500">The profile you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="relative h-64 bg-zinc-900 border-b border-zinc-800">
          {profileUser.bannerURL ? (
            <img src={profileUser.bannerURL} alt="Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-900 to-zinc-800" />
          )}
          
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-[#0a0a0a] bg-zinc-800 overflow-hidden relative group">
              <img 
                src={profileUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.email}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-white drop-shadow-md">{profileUser.name || 'Anonymous'}</h1>
                {profileUser.isOfficial && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500" title="Official Account">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {profileUser.role === 'admin' && (
                  <span className="px-2.5 py-1 rounded-md bg-red-950/50 text-red-400 border border-red-900/50 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Administrator
                  </span>
                )}
                {profileUser.role === 'moderator' && (
                  <span className="px-2.5 py-1 rounded-md bg-purple-950/50 text-purple-400 border border-purple-900/50 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Moderator
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-zinc-400 drop-shadow-md">
                  <Calendar className="w-4 h-4" /> Joined {profileUser.joinedAt && typeof profileUser.joinedAt.toDate === 'function' ? profileUser.joinedAt.toDate().toLocaleDateString() : 'Unknown'}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400 drop-shadow-md">
                  <Clock className="w-4 h-4" /> Last seen {formatTimeAgo(profileUser.lastSeen)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 pt-24">
          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-zinc-200 mb-3">About</h3>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {profileUser.bio || "This user hasn't written a bio yet."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* User's Scripts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-6 h-6 text-red-500" />
          Recent Activities & Scripts
        </h2>

        {userScripts.length === 0 ? (
          <div className="text-center p-12 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <Code2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-300 mb-2">No scripts published</h3>
            <p className="text-zinc-500">This user hasn't published any scripts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userScripts.map((script, index) => (
              <motion.div
                key={script.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 overflow-hidden flex flex-col group hover:border-red-900/50 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.1)]"
              >
                {script.image ? (
                  <div className="h-40 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
                    <img 
                      src={script.image} 
                      alt={script.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-zinc-900/50 flex items-center justify-center relative border-b border-zinc-800/50">
                    <Code2 className="w-12 h-12 text-zinc-800" />
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-zinc-100 line-clamp-1 mb-2">{script.title}</h3>
                  <p className="text-zinc-400 text-sm mb-4 flex-1 line-clamp-2 leading-relaxed">
                    {script.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        {script.likes || 0}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {script.views || 0}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(script.code, script.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-500 transition-colors text-xs font-bold border border-red-900/30"
                    >
                      {copiedId === script.id ? (
                        <><Check className="w-3 h-3" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
