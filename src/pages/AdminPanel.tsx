import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit, Save, X, ShieldAlert, Code2, Users, Image as ImageIcon, FileText, Heart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scripts' | 'executors' | 'users'>('scripts');

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          ADMIN <span className="text-red-600">PANEL</span>
        </h1>
        <p className="text-zinc-400">Manage scripts, executors, and users for ZXCHUB.</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'scripts' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <Code2 className="w-5 h-5" />
          Scripts
        </button>
        <button
          onClick={() => setActiveTab('executors')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'executors' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          Executors
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'users' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <Users className="w-5 h-5" />
          Users
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-6 shadow-2xl">
        {activeTab === 'scripts' && <ScriptsManager />}
        {activeTab === 'executors' && <ExecutorsManager />}
        {activeTab === 'users' && <UsersManager />}
      </div>
    </div>
  );
}

function ScriptsManager() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    code: '', 
    executor: '', 
    image: '',
    likes: 0,
    views: 0
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchScripts = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'scripts'));
    setScripts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'scripts', editingId), {
          ...formData,
          likes: Number(formData.likes),
          views: Number(formData.views),
        });
      } else {
        await addDoc(collection(db, 'scripts'), {
          ...formData,
          likes: Number(formData.likes),
          views: Number(formData.views),
          createdAt: serverTimestamp(),
          authorId: user.uid,
          likedBy: []
        });
      }
      setFormData({ title: '', description: '', code: '', executor: '', image: '', likes: 0, views: 0 });
      setIsAdding(false);
      setEditingId(null);
      fetchScripts();
    } catch (error) {
      console.error("Error saving script:", error);
      alert("Failed to save script. Check console for details.");
    }
  };

  const handleEdit = (script: any) => {
    setFormData({
      title: script.title || '',
      description: script.description || '',
      code: script.code || '',
      executor: script.executor || '',
      image: script.image || '',
      likes: script.likes || 0,
      views: script.views || 0
    });
    setEditingId(script.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return;
    try {
      await deleteDoc(doc(db, 'scripts', id));
      fetchScripts();
    } catch (error) {
      console.error("Error deleting script:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-6 h-6 text-red-500" />
          Manage Scripts
        </h2>
        <button
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingId(null);
              setFormData({ title: '', description: '', code: '', executor: '', image: '', likes: 0, views: 0 });
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-[0_0_10px_rgba(220,38,38,0.2)]"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Add New Script'}
        </button>
      </div>

      {isAdding && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Title *
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. Auto Farm OP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Supported Executor
                </label>
                <input
                  type="text"
                  value={formData.executor}
                  onChange={e => setFormData({...formData, executor: e.target.value})}
                  className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. Synapse X, Krnl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Initial Likes
                  </label>
                  <input
                    type="number"
                    value={formData.likes}
                    onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Initial Views
                  </label>
                  <input
                    type="number"
                    value={formData.views}
                    onChange={e => setFormData({...formData, views: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="https://..."
                />
                {formData.image && (
                  <div className="mt-3 h-32 rounded-lg overflow-hidden border border-zinc-800">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 h-28 resize-none transition-colors"
              placeholder="Detailed description of what the script does..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Script Code *</label>
            <textarea
              required
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-lg text-red-400 focus:outline-none focus:border-red-500 font-mono text-sm h-48 resize-none transition-colors"
              placeholder="loadstring(game:HttpGet('...'))()"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]">
              <Save className="w-5 h-5" />
              {editingId ? 'Update Script' : 'Publish Script'}
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading scripts...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
          <table className="w-full text-left border-collapse bg-zinc-900/30">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
                <th className="py-4 px-5 font-medium">Script Details</th>
                <th className="py-4 px-5 font-medium">Stats</th>
                <th className="py-4 px-5 font-medium">Added</th>
                <th className="py-4 px-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scripts.map(script => (
                <tr key={script.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {script.image ? (
                        <img src={script.image} alt="" className="w-10 h-10 rounded-md object-cover border border-zinc-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          <Code2 className="w-5 h-5 text-zinc-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-zinc-200">{script.title}</div>
                        <div className="text-xs text-zinc-500">{script.executor || 'Any Executor'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> {script.likes || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-blue-500" /> {script.views || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-zinc-400">
                    {script.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(script)} className="p-2 text-zinc-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-500/10">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(script.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {scripts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500">No scripts found. Add your first script above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ExecutorsManager() {
  const { user } = useAuth();
  const [executors, setExecutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Working', image: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchExecutors = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'executors'));
    setExecutors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchExecutors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'executors', editingId), {
          ...formData
        });
      } else {
        await addDoc(collection(db, 'executors'), {
          ...formData,
          createdAt: serverTimestamp(),
          authorId: user.uid
        });
      }
      setFormData({ name: '', description: '', status: 'Working', image: '' });
      setIsAdding(false);
      setEditingId(null);
      fetchExecutors();
    } catch (error) {
      console.error("Error saving executor:", error);
      alert("Failed to save executor. Check console for details.");
    }
  };

  const handleEdit = (executor: any) => {
    setFormData({
      name: executor.name || '',
      description: executor.description || '',
      status: executor.status || 'Working',
      image: executor.image || ''
    });
    setEditingId(executor.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this executor?')) return;
    try {
      await deleteDoc(doc(db, 'executors', id));
      fetchExecutors();
    } catch (error) {
      console.error("Error deleting executor:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'executors', id), { status: newStatus });
      fetchExecutors();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Manage Executors
        </h2>
        <button
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingId(null);
              setFormData({ name: '', description: '', status: 'Working', image: '' });
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-[0_0_10px_rgba(220,38,38,0.2)]"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Add New Executor'}
        </button>
      </div>

      {isAdding && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Executor Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. Synapse X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Current Status *
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 appearance-none transition-colors"
                >
                  <option value="Working">✅ Working</option>
                  <option value="Patched">❌ Patched</option>
                  <option value="Updating">🔄 Updating</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Logo/Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-2.5 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="https://..."
                />
                {formData.image && (
                  <div className="mt-3 h-24 w-24 rounded-lg overflow-hidden border border-zinc-800 bg-black/50 p-2">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Detailed Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 h-28 resize-none transition-colors"
              placeholder="Features, pricing, compatibility details..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]">
              <Save className="w-5 h-5" />
              {editingId ? 'Update Executor' : 'Publish Executor'}
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading executors...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
          <table className="w-full text-left border-collapse bg-zinc-900/30">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
                <th className="py-4 px-5 font-medium">Executor</th>
                <th className="py-4 px-5 font-medium">Status</th>
                <th className="py-4 px-5 font-medium">Added</th>
                <th className="py-4 px-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {executors.map(executor => (
                <tr key={executor.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {executor.image ? (
                        <img src={executor.image} alt="" className="w-10 h-10 rounded-md object-contain bg-black/50 p-1 border border-zinc-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          <ShieldAlert className="w-5 h-5 text-zinc-500" />
                        </div>
                      )}
                      <span className="font-bold text-zinc-200">{executor.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="relative inline-block">
                      <select
                        value={executor.status}
                        onChange={(e) => handleStatusChange(executor.id, e.target.value)}
                        className={`appearance-none bg-zinc-900/80 border border-zinc-700 rounded-md px-3 py-1.5 pr-8 text-sm font-bold focus:outline-none focus:border-zinc-500 cursor-pointer transition-colors ${
                          executor.status === 'Working' ? 'text-green-400' :
                          executor.status === 'Patched' ? 'text-red-400' : 'text-yellow-400'
                        }`}
                      >
                        <option value="Working" className="text-green-400 bg-zinc-900">Working</option>
                        <option value="Patched" className="text-red-400 bg-zinc-900">Patched</option>
                        <option value="Updating" className="text-yellow-400 bg-zinc-900">Updating</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-zinc-400">
                    {executor.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(executor)} className="p-2 text-zinc-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-500/10">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(executor.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {executors.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500">No executors found. Add one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'users'));
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Only admins can do this.");
    }
  };

  const handleOfficialChange = async (id: string, isOfficial: boolean) => {
    try {
      await updateDoc(doc(db, 'users', id), { isOfficial });
      fetchUsers();
    } catch (error) {
      console.error("Error updating official status:", error);
      alert("Failed to update official status. Only admins can do this.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-red-500" />
        Manage Users
      </h2>
      
      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading users...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
          <table className="w-full text-left border-collapse bg-zinc-900/30">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80">
                <th className="py-4 px-5 font-medium">User Info</th>
                <th className="py-4 px-5 font-medium">Email</th>
                <th className="py-4 px-5 font-medium">Role</th>
                <th className="py-4 px-5 font-medium">Badges</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="" className="w-8 h-8 rounded-full bg-zinc-800 object-cover" />
                      <span className="font-medium text-zinc-200">{user.name || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-zinc-400">{user.email}</td>
                  <td className="py-4 px-5">
                    <div className="relative inline-block">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`appearance-none bg-zinc-900/80 border border-zinc-700 rounded-md px-3 py-1.5 pr-8 text-sm font-medium focus:outline-none focus:border-zinc-500 cursor-pointer transition-colors ${
                          user.role === 'admin' ? 'text-red-400 border-red-900/50 bg-red-950/20' : 
                          user.role === 'moderator' ? 'text-purple-400 border-purple-900/50 bg-purple-950/20' : 
                          'text-zinc-300'
                        }`}
                      >
                        <option value="user" className="text-zinc-300 bg-zinc-900">User</option>
                        <option value="moderator" className="text-purple-400 bg-zinc-900">Moderator</option>
                        <option value="admin" className="text-red-400 bg-zinc-900">Admin</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={user.isOfficial || false}
                        onChange={(e) => handleOfficialChange(user.id, e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
                      />
                      <span className="text-sm text-zinc-400">Official</span>
                    </label>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-zinc-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
