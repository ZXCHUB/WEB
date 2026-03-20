import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Code2, ShieldAlert, Settings, LogIn, LogOut, Menu, LayoutDashboard, Upload, Bookmark, User as UserIcon, MessageSquare, Youtube, FileText, Shield, Code, ThumbsDown, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { user, userData, isAdmin, isModerator, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="border-b border-red-900/30 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-red-500 font-bold text-2xl tracking-tighter">
          <img src="/logo.png" alt="ZXCHUB Logo" className="w-8 h-8 rounded-full object-cover" />
          ZXCHUB
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/scripts" className="text-zinc-400 hover:text-red-400 transition-colors font-medium">
            Scripts
          </Link>
          <Link to="/executors" className="text-zinc-400 hover:text-red-400 transition-colors font-medium">
            Executors
          </Link>
          
          {user ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-700 hover:border-red-500 transition-colors bg-zinc-900"
              >
                <Menu className="w-5 h-5 text-zinc-300" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
                    <img src={userData?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" className="w-10 h-10 rounded-full bg-zinc-800 object-cover" />
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1">
                        {userData?.name || user.displayName || 'User'}
                        {userData?.isOfficial && <CheckCircle2 className="w-3 h-3 text-blue-500" title="Official Account" />}
                      </div>
                      <Link to={`/profile/${userData?.username || user.uid}`} onClick={() => setIsMenuOpen(false)} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">View your profile</Link>
                    </div>
                  </div>

                  <div className="py-2 border-b border-zinc-800">
                    <Link to="/upload" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors">
                      <Upload className="w-4 h-4 text-zinc-400" /> Upload Script
                    </Link>
                    <Link to="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors">
                      <UserIcon className="w-4 h-4 text-zinc-400" /> Account
                    </Link>
                  </div>

                  <div className="py-2 border-b border-zinc-800">
                    <a href="https://discord.gg/rnJC4yYfsU" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors">
                      <MessageSquare className="w-4 h-4 text-zinc-400" /> Discord
                    </a>
                    <a href="https://www.youtube.com/@ZxcHubScripts" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors">
                      <Youtube className="w-4 h-4 text-zinc-400" /> YouTube
                    </a>
                  </div>

                  {(isAdmin || isModerator) && (
                    <div className="py-2 border-b border-zinc-800">
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-900 hover:text-red-300 transition-colors font-medium">
                        <Settings className="w-4 h-4 text-red-500" /> Admin Panel
                      </Link>
                    </div>
                  )}

                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-zinc-900 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
