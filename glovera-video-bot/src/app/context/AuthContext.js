'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { toast } from 'react-toastify';
import { set } from 'react-hook-form';

const AuthContext = createContext();
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to check if user profile is completed
  const checkProfileCompletion = async (userId) => {
    try {
      // Replace this with your actual database query
      const response = await fetch(`/api/users/${userId}/profile`);
      const data = await response.json();
      return data.isProfileCompleted;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  };

  const loginUsingDB = async (token) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/loginUsingGoogle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },body: JSON.stringify({
          "token": token,
        }),
      });
      const data = await response.json();
      console.log(data);
      if(data.Success){
        let dataObj = data.Success;
        localStorage.setItem('token', dataObj.token);
        localStorage.setItem('userId', dataObj.id);
        setUser(data.Success);
        return true;
      }else{
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
      return false;
    }
  };

  // Function to check if user is admin
  const checkIsAdmin = async (userId) => {
    try {
      // Replace this with your actual database query
      const response = await fetch(`/api/users/${userId}/role`);
      const data = await response.json();
      return data.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set basic user info
        const userObj = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };

        // Check if user is admin
        const isAdmin = await checkIsAdmin(firebaseUser.uid);
        userObj.isAdmin = isAdmin;

        if (!isAdmin) {
          // Only check profile completion for non-admin users
          const isProfileCompleted = await checkProfileCompletion(firebaseUser.uid);
          userObj.isProfileCompleted = isProfileCompleted;

          // Only redirect regular users to complete profile
          if (!isProfileCompleted && !window.location.pathname.includes('/complete-profile')) {
            router.push('/complete-profile');
          }
        } else {
          // For admin users, redirect to admin dashboard if they're on a user route
          if (window.location.pathname.startsWith('/complete-profile')) {
            router.push('/admin/dashboard');
          }
        }

        setUser(userObj);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      console.log("google user", token);

      // Check if user exists in database
      const userExists = await loginUsingDB(token);
      if (!userExists) {
        toast.error('User not found. Please register first.');
        return;
      }
      
      // Check if user is admin first
      const isAdmin = await checkIsAdmin(result.user.uid);
      
      toast.success('Login successful!');
      
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        // Only check profile completion for non-admin users
        const isProfileCompleted = await checkProfileCompletion(result.user.uid);
        if (isProfileCompleted) {
          router.push('/');
        } else {
          router.push('/complete-profile');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
