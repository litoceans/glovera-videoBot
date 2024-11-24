'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </SessionProvider>
  );
}
