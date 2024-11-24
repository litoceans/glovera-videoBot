'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ChartBarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-color to-white">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-bold text-accent-color flex items-center gap-2"
            >
              <GlobeAltIcon className="w-8 h-8" />
              Glovera
            </motion.h1>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/profile')}
                className="p-2 hover:bg-secondary-color rounded-full transition-colors"
                aria-label="Profile"
              >
                <UserIcon className="w-6 h-6 text-accent-color" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={()=>{
                  localStorage.clear();
                  logout();
                }}
                className="p-2 hover:bg-secondary-color rounded-full transition-colors"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 text-accent-color" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-accent-color mb-4"
            >
              Welcome, {user.name}! 🎓
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-8"
            >
              Your journey to academic excellence starts here. Let's explore the perfect educational path for you.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/avatar')}
                className="btn-primary py-4 px-8 text-lg font-semibold flex items-center gap-2 shadow-lg"
              >
                <RocketLaunchIcon className="w-6 h-6" />
                Start Your Journey
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px]"
          >
            <Image
              src="https://glovera.in/assets/images/heroImage.svg"
              alt="Educational Journey"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          <motion.div variants={itemVariants} className="card text-left p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <AcademicCapIcon className="w-12 h-12 text-accent-color mb-4" />
            <h3 className="text-xl font-semibold mb-2">Personalized Guidance</h3>
            <p className="text-gray-600">
              Get tailored advice based on your academic profile and career goals.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="card text-left p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <UserGroupIcon className="w-12 h-12 text-accent-color mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expert Consultation</h3>
            <p className="text-gray-600">
              Connect with experienced advisors who understand your aspirations.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="card text-left p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <ChartBarIcon className="w-12 h-12 text-accent-color mb-4" />
            <h3 className="text-xl font-semibold mb-2">Data-Driven Insights</h3>
            <p className="text-gray-600">
              Make informed decisions with comprehensive analytics and trends.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
