'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const AdminContext = createContext();
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('adminToken');
      const adminName = localStorage.getItem('adminName');
      const adminEmail = localStorage.getItem('adminEmail');

      if (token && adminName && adminEmail) {
        setAdmin({
          name: adminName,
          email: adminEmail,
          token: token
        });
      }
      setLoading(false);
    };

    checkAdmin();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/loginAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.Error) {
        throw new Error(data.Error);
      }

      if (!data.Success) {
        throw new Error('Login failed');
      }

      const { name, email: adminEmail, token } = data.Success;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminName', name);
      localStorage.setItem('adminEmail', adminEmail);

      setAdmin({
        name,
        email: adminEmail,
        token
      });

      toast.success('Login successful!');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    setAdmin(null);
    router.push('/admin/login');
  };

  const value = {
    admin,
    loading,
    login,
    logout,
  };

  return (
    <AdminContext.Provider value={value}>
      {!loading && children}
    </AdminContext.Provider>
  );
}
