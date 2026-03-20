import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserData {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  bannerURL?: string;
  bio?: string;
  role: 'user' | 'verified' | 'moderator' | 'admin' | 'owner';
  isOfficial?: boolean;
  warns?: number;
  bannedUntil?: any;
  lastSeen?: any;
  joinedAt?: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  isModerator: boolean;
  isOwner: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  isModerator: false,
  isOwner: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          
          // Update lastSeen
          await setDoc(userDocRef, { lastSeen: serverTimestamp() }, { merge: true });
          
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            let role = data.role;
            if (currentUser.email === 'zxchubadmin@gmail.com') {
              role = 'owner';
            } else if (currentUser.email === 'marinzxcpartner@gmail.com' || currentUser.email === 'marindonoga2005@gmail.com') {
              role = role === 'owner' ? 'owner' : 'admin';
            }
            
            setIsAdmin(role === 'admin' || role === 'owner');
            setIsModerator(role === 'moderator' || role === 'admin' || role === 'owner');
            setIsOwner(role === 'owner');
            
            if (data.role !== role) {
              await setDoc(userDocRef, { role }, { merge: true });
              data.role = role;
            }
            
            // If joinedAt is missing, set it to now
            if (!data.joinedAt) {
               await setDoc(userDocRef, { joinedAt: serverTimestamp() }, { merge: true });
               const updatedDoc = await getDoc(userDocRef);
               if (updatedDoc.exists()) {
                 data.joinedAt = updatedDoc.data().joinedAt;
               }
            }

            setUserData({ ...data, uid: currentUser.uid });
          } else {
            // Create user profile
            let role: 'user' | 'verified' | 'moderator' | 'admin' | 'owner' = 'user';
            if (currentUser.email === 'zxchubadmin@gmail.com') {
              role = 'owner';
            } else if (currentUser.email === 'marinzxcpartner@gmail.com' || currentUser.email === 'marindonoga2005@gmail.com') {
              role = 'admin';
            }
            
            const newUserData: any = {
              email: currentUser.email || '',
              name: currentUser.displayName || 'Anonymous',
              photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
              role: role,
              warns: 0,
              joinedAt: serverTimestamp(),
              lastSeen: serverTimestamp()
            };
            
            await setDoc(userDocRef, newUserData);
            const createdDoc = await getDoc(userDocRef);
            
            setIsAdmin(role === 'admin' || role === 'owner');
            setIsModerator(role === 'moderator' || role === 'admin' || role === 'owner');
            setIsOwner(role === 'owner');
            setUserData({ ...createdDoc.data(), uid: currentUser.uid } as UserData);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          setUserData(null);
        }
      } else {
        setIsAdmin(false);
        setIsModerator(false);
        setIsOwner(false);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, isAdmin, isModerator, isOwner, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
