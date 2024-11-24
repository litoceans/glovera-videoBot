'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [mockData, setMockData] = useState({
    totalStudents: 0,
    activeSessions: 0,
    completedSessions: 0,
    conversionRate: 0,
    monthlyStats: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      sessions: [65, 78, 90, 85, 95, 110],
      students: [45, 52, 60, 58, 65, 75],
    },
    sessionTypes: {
      labels: ['Initial Consultation', 'Follow-up', 'Program Selection', 'Application Help'],
      data: [35, 25, 20, 20],
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sessionData = {
    labels: mockData.monthlyStats.labels,
    datasets: [
      {
        label: 'Sessions',
        data: mockData.monthlyStats.sessions,
        borderColor: '#2a2118',
        tension: 0.4,
      },
      {
        label: 'Students',
        data: mockData.monthlyStats.students,
        borderColor: '#e6e0d4',
        tension: 0.4,
      },
    ],
  };

  useEffect(() => {
    if (isClient) {
      getDashBoardData();
    }
  }, [isClient]);

  const getDashBoardData = async () => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/getDashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({"email":localStorage.getItem('adminEmail') }),
      });
      const data = await response.json();
      console.log(data);
      if(data.Success){
        let totalStudents = data.Success.totalUsers;
        let activeSessions = data.Success.totalActiveSessions;
        let completedSessions = data.Success.totalCompletedSessions;
        let totalUnqueUsers = data.Success.unique_students;
        let conversionRateCal = (Number(totalUnqueUsers) / Number(totalStudents)) * 100;
        console.log(conversionRateCal);
        let conversionRate = conversionRateCal.toFixed(2);
        console.log(conversionRate);
        setMockData({
          totalStudents: totalStudents,
          activeSessions: activeSessions,
          completedSessions: completedSessions,
          conversionRate: conversionRate,
          monthlyStats: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            sessions: [65, 78, 90, 85, 95, 110],
            students: [45, 52, 60, 58, 65, 75],
          },
          sessionTypes: {
            labels: ['Active', 'Completed', 'Cancelled', 'Pending'],
            data: [activeSessions, completedSessions, 0, 0],
          },
        });
      }else{
        toast.error(data.Error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const sessionTypeData = {
    labels: mockData.sessionTypes.labels,
    datasets: [
      {
        data: mockData.sessionTypes.data,
        backgroundColor: ['#2a2118', '#e6e0d4', '#f8f6f2', '#d4cec2'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-primary-color">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-accent-color mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary-color rounded-full">
                <UserGroupIcon className="w-6 h-6 text-accent-color" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-accent-color">{mockData.totalStudents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary-color rounded-full">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-accent-color" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-accent-color">{mockData.activeSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary-color rounded-full">
                <AcademicCapIcon className="w-6 h-6 text-accent-color" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-accent-color">{mockData.completedSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary-color rounded-full">
                <ArrowTrendingUpIcon className="w-6 h-6 text-accent-color" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-accent-color">{mockData.conversionRate}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-4">Monthly Activity</h2>
            {isClient && <Line data={sessionData} />}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-4">Session Types</h2>
            {isClient && <Doughnut data={sessionTypeData} />}
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/students')}
            className="btn-primary"
          >
            Manage Students
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/programs')}
            className="btn-secondary"
          >
            Manage Programs
          </motion.button>
        </div>
      </div>
    </div>
  );
}
