'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { AdminProvider, useAdmin } from './context/AdminContext';

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, loading } = useAdmin();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading) {
      if (!admin && !isLoginPage) {
        router.push('/admin/login');
      } else if (admin && isLoginPage) {
        router.push('/admin/dashboard');
      }
    }
  }, [admin, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64 min-h-screen transition-all duration-300">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
