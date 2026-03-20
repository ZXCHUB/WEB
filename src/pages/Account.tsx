import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Save, User as UserIcon, Image as ImageIcon, FileText, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoleBadge from '../components/RoleBadge';
import ImageUploader from '../components/ImageUploader';

export default function Account() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    photoURL: '',
    bannerURL: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        username: userData.username || '',
        bio: userData.bio || '',
        photoURL: userData.photoURL || '',
        bannerURL: userData.bannerURL || ''
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    const newUsername = formData.username.trim().toLowerCase();

    try {
      // Validate and check uniqueness only if username was changed
      if (newUsername && newUsername !== (userData?.username || '')) {
        if (!/^[a-z0-9_]{3,32}$/.test(newUsername)) {
          setMessage({ type: 'error', text: 'Username: only letters, numbers, underscores. Min 3, max 32 chars.' });
          setIsSaving(false);
          return;
        }
        const usernameQuery = query(collection(db, 'users'), where('username', '==', newUsername));
        const snapshot = await getDocs(usernameQuery);
        if (!snapshot.empty && snapshot.docs[0].id !== user.uid) {
          setMessage({ type: 'error', text: 'This username is already taken. Please choose another.' });
          setIsSaving(false);
          return;
        }
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        username: newUsername,
        bio: formData.bio,
        photoURL: formData.photoURL,
        bannerURL: formData.bannerURL
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => navigate(`/profile/${newUsername || user.uid}`), 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-white flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-red-500" />
          ACCOUNT <span className="text-red-600">SETTINGS</span>
        </h1>
        <p className="text-zinc-400">Manage your public profile and account details.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Preview Section */}
        <div className="relative h-48 bg-zinc-900 border-b border-zinc-800">
          {formData.bannerURL ? (
            <img src={formData.bannerURL} alt="Banner" className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-900 to-zinc-800" />
          )}
          
          <div className="absolute -bottom-12 left-8 flex items-end gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-[#0a0a0a] bg-zinc-800 overflow-hidden">
              <img 
                src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">{formData.name || 'Your Name'}</h2>
              </div>
              <div className="mt-1">
                <RoleBadge role={userData?.role || 'user'} isOfficial={userData?.isOfficial} />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-20 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-950/30 text-green-400 border border-green-900/50' : 'bg-red-950/30 text-red-400 border border-red-900/50'}`}>
              <ShieldAlert className="w-5 h-5" />
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Your nickname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="your_username"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Profile link: <span className="text-red-400">zxchub.online/profile/{formData.username || "username"}</span>. Only letters, numbers, underscores (3–32 chars).
                </p>
              </div>

              <ImageUploader
                value={formData.photoURL}
                onChange={val => setFormData({...formData, photoURL: val})}
                label="Avatar Image"
                maxWidth={256}
                maxHeight={256}
                aspectHint="1:1"
              />

              <ImageUploader
                value={formData.bannerURL}
                onChange={val => setFormData({...formData, bannerURL: val})}
                label="Banner Image"
                maxWidth={1200}
                maxHeight={400}
                aspectHint="3:1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 h-48 resize-none transition-colors"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <div className="text-right text-xs text-zinc-500 mt-1">
                {formData.bio.length} / 500
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800/50">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
