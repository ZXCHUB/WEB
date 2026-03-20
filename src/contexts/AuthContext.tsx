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
  role: 'user' | 'moderator' | 'admin';
  isOfficial?: boolean;
  lastSeen?: any;
  joinedAt?: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
            const role = (currentUser.email === 'zxchubadmin@gmail.com' || currentUser.email === 'marinzxcpartner@gmail.com') ? 'admin' : data.role;
            setIsAdmin(role === 'admin');
            
            if ((currentUser.email === 'zxchubadmin@gmail.com' || currentUser.email === 'marinzxcpartner@gmail.com') && data.role !== 'admin') {
              await setDoc(userDocRef, { role: 'admin' }, { merge: true });
              data.role = 'admin';
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
            const isFirstUser = currentUser.email === 'marinzxcpartner@gmail.com' || currentUser.email === 'zxchubadmin@gmail.com';
            const role = isFirstUser ? 'admin' : 'user';
            
            const newUserData: any = {
              email: currentUser.email || '',
              name: currentUser.displayName || 'Anonymous',
              photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
              role: role,
              joinedAt: serverTimestamp(),
              lastSeen: serverTimestamp()
            };
            
            await setDoc(userDocRef, newUserData);
            const createdDoc = await getDoc(userDocRef);
            
            setIsAdmin(role === 'admin');
            setUserData({ ...createdDoc.data(), uid: currentUser.uid } as UserData);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          setUserData(null);
        }
      } else {
        setIsAdmin(false);
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
      console.error("Error logging in:", error);
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
    <AuthContext.Provider value={{ user, userData, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
