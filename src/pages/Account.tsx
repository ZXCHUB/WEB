import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Save, User as UserIcon, Image as ImageIcon, FileText, ShieldAlert, CheckCircle2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function Account() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photoURL: '',
    bannerURL: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        photoURL: userData.photoURL || '',
        bannerURL: userData.bannerURL || ''
      });
    }
  }, [userData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
      return;
    }

    try {
      setMessage({ type: '', text: '' });
      // Compress avatar to 256x256, banner to 1200x400
      const maxWidth = type === 'avatar' ? 256 : 1200;
      const maxHeight = type === 'avatar' ? 256 : 400;
      const base64Image = await compressImage(file, maxWidth, maxHeight, 0.8);
      
      setFormData(prev => ({
        ...prev,
        [type === 'avatar' ? 'photoURL' : 'bannerURL']: base64Image
      }));
    } catch (error) {
      console.error("Error compressing image:", error);
      setMessage({ type: 'error', text: 'Failed to process image.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        bio: formData.bio,
        photoURL: formData.photoURL,
        bannerURL: formData.bannerURL
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Reload page to reflect changes in context
      setTimeout(() => window.location.reload(), 1500);
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
                {userData?.isOfficial && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500" title="Official Account">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-zinc-400 text-sm drop-shadow-md">{userData?.role === 'admin' ? 'Administrator' : userData?.role === 'moderator' ? 'Moderator' : 'User'}</p>
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
                  <ImageIcon className="w-4 h-4" /> Avatar Image
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Avatar
                  </button>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={(e) => handleImageUpload(e, 'avatar')}
                    accept="image/*"
                    className="hidden"
                  />
                  {formData.photoURL && formData.photoURL.startsWith('data:image') && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Image selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-2">Max size: 5MB. Will be resized to 256x256.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Banner Image
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Banner
                  </button>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={(e) => handleImageUpload(e, 'banner')}
                    accept="image/*"
                    className="hidden"
                  />
                  {formData.bannerURL && formData.bannerURL.startsWith('data:image') && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Image selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-2">Max size: 5MB. Will be resized to 1200x400.</p>
              </div>
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
