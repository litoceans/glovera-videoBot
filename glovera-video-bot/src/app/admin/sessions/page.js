'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { format } from 'date-fns';
import ChatHistoryModal from './ChatHistoryModal';
import SessionDetailsModal from './SessionDetailsModal';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [pageNo]);

  const fetchSessions = async () => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');
      const adminToken = localStorage.getItem('adminToken');
      if (!adminEmail || !adminToken) {
        window.location = '/admin/login';
        return;
      }
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/getAllSession`, {
        email: adminEmail,
        pageNo: pageNo
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (response.data.Success) {
        setSessions(response.data.Success);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent-color">Sessions</h1>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPageNo(prev => Math.max(1, prev - 1))}
            className="btn-secondary"
            disabled={pageNo === 1}
          >
            Previous
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPageNo(prev => prev + 1)}
            className="btn-primary"
            disabled={sessions.length < 10}
          >
            Next
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.sessionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{session.sessionId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{session.student_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(session.created_at), 'PPpp')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.sessionStatus === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {session.sessionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Session Details"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-accent-color hover:text-accent-color/80 transition-colors"
                        title="View Chat History"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsChatModalOpen(true);
                        }}
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <SessionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onViewChat={() => {
          setIsDetailsModalOpen(false);
          setIsChatModalOpen(true);
        }}
      />
      <ChatHistoryModal
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setSelectedSession(null);
        }}
        sessionId={selectedSession?.sessionId}
      />
    </div>
  );
}
