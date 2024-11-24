'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { motion } from 'framer-motion';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-color">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-accent-color">Glovera</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="p-2 hover:bg-secondary-color rounded-full transition-colors"
                aria-label="Profile"
              >
                <UserIcon className="w-6 h-6 text-accent-color" />
              </button>
              <button
                onClick={()=>{
                  localStorage.clear();
                  logout();
                }}
                className="p-2 hover:bg-secondary-color rounded-full transition-colors"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 text-accent-color" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-accent-color mb-4">
            Welcome, {user.name}!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ready to start your educational journey?
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <button
              onClick={() => router.push('/avatar')}
              className="btn-primary w-full py-4 text-lg font-semibold"
            >
              Start Consultation
            </button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card text-left"
            >
              <h3 className="text-xl font-semibold mb-2">Personalized Guidance</h3>
              <p className="text-gray-600">
                Get tailored advice based on your academic profile and career goals.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card text-left"
            >
              <h3 className="text-xl font-semibold mb-2">Interactive Sessions</h3>
              <p className="text-gray-600">
                Engage in natural conversations with our AI-powered video bot.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card text-left"
            >
              <h3 className="text-xl font-semibold mb-2">Real-time Support</h3>
              <p className="text-gray-600">
                Get instant answers to your questions about international education.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
