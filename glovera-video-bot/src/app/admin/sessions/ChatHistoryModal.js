'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { format } from 'date-fns';

export default function ChatHistoryModal({ isOpen, onClose, sessionId }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNo, setPageNo] = useState(1);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchChatHistory();
    } else {
      setPageNo(1);
      setChatHistory([]);
    }
  }, [isOpen, sessionId, pageNo]);

  const fetchChatHistory = async () => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');
      const adminToken = localStorage.getItem('adminToken');

      if (!adminEmail || !adminToken) {
        window.location = '/admin/login';
        return;
      }

      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/getChatHistory`,
        {
          "email": adminEmail,
          "sessionId": sessionId,
          "pageNo": pageNo
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.data.Success) {
        setChatHistory(response.data.Success.chatHistory || []);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPageNo(1);
    setChatHistory([]);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="text-xl font-semibold">Chat History</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No chat messages found
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                        message.role === 'assistant'
                          ? 'bg-gray-100 rounded-tl-none'
                          : 'bg-accent-color text-white rounded-tr-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t flex justify-between items-center bg-white sticky bottom-0">
            <button
              onClick={() => setPageNo(prev => Math.max(1, prev - 1))}
              disabled={pageNo === 1 || loading}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {pageNo}</span>
            <button
              onClick={() => setPageNo(prev => prev + 1)}
              disabled={chatHistory.length < 10 || loading}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
