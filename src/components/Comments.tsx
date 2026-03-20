import { useState, useEffect, FormEvent } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserData } from '../contexts/AuthContext';
import { Trash2, User as UserIcon, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import RoleBadge from './RoleBadge';
import { motion, AnimatePresence } from 'motion/react';

interface Comment {
  id: string;
  targetId: string;
  content: string;
  authorId: string;
  createdAt: any;
}

interface CommentWithAuthor extends Comment {
  author?: UserData;
}

interface CommentsProps {
  targetId: string;
}

export default function Comments({ targetId }: CommentsProps) {
  const { user, userData } = useAuth();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('targetId', '==', targetId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];

      // Fetch author details for each comment
      const commentsWithAuthors = await Promise.all(
        commentsData.map(async (comment) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', comment.authorId));
            if (userDoc.exists()) {
              return { ...comment, author: userDoc.data() as UserData };
            }
          } catch (error) {
            console.error("Error fetching author details:", error);
          }
          return comment;
        })
      );

      setComments(commentsWithAuthors);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetId]);

  const isUserBanned = (user: any) => {
    if (!user?.bannedUntil) return false;
    const banDate = user.bannedUntil?.toDate ? user.bannedUntil.toDate() : new Date(user.bannedUntil);
    return banDate > new Date();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    if (isUserBanned(userData)) {
      alert("You are currently banned and cannot post comments.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        targetId,
        content: newComment.trim(),
        authorId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment.");
    }
  };

  const isModeratorOrAbove = userData?.role === 'owner' || userData?.role === 'admin' || userData?.role === 'moderator';

  if (loading) {
    return <div className="animate-pulse flex space-x-4 p-4">
      <div className="rounded-full bg-zinc-800 h-10 w-10"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-zinc-800 rounded"></div>
          <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
        </div>
      </div>
    </div>;
  }

  return (
    <div className="mt-8 border-t border-zinc-800/50 pt-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-red-500" />
        Comments ({comments.length})
      </h3>

      {user ? (
        isUserBanned(userData) ? (
          <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 mb-8 text-center text-red-400">
            You are currently banned and cannot post comments.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="Your avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 resize-none min-h-[80px]"
                  maxLength={1000}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8 text-center">
          <p className="text-zinc-400 mb-4">You must be signed in to post a comment.</p>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-4 group"
            >
              <Link to={`/profile/${comment.authorId}`} className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-red-500 transition-all">
                {comment.author?.photoURL ? (
                  <img src={comment.author.photoURL} alt={comment.author.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link to={`/profile/${comment.authorId}`} className="font-bold text-zinc-200 hover:text-white truncate">
                    {comment.author?.name || 'Unknown User'}
                  </Link>
                  {comment.author && (
                    <RoleBadge role={comment.author.role} isOfficial={comment.author.isOfficial} />
                  )}
                  <span className="text-xs text-zinc-500 ml-auto">
                    {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <p className="text-zinc-300 whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
              
              {(user?.uid === comment.authorId || isModeratorOrAbove) && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
