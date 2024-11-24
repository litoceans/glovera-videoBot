'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MicrophoneIcon, SpeakerWaveIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import CharacterList from './CharacterList';

const requirements = [
  {
    id: 'microphone',
    title: 'Use Microphone',
    description: 'Enable microphone access for voice interaction',
    icon: MicrophoneIcon
  },
  {
    id: 'silent',
    title: 'Silent Environment',
    description: 'Ensure you are in a quiet room for better conversation',
    icon: SpeakerWaveIcon
  },
  {
    id: 'noise',
    title: 'Avoid Background Noise',
    description: 'Minimize background noise for clear communication',
    icon: SpeakerWaveIcon
  },
  {
    id: 'english',
    title: 'Speak in English',
    description: 'Communication will be in English language',
    icon: SpeakerWaveIcon
  }
];

export default function Avatar() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [checkedRequirements, setCheckedRequirements] = useState({});
  const [showCharacterList, setShowCharacterList] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophonePermission(true);
        setCheckedRequirements(prev => ({ ...prev, microphone: true }));
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone permission check error:', error);
        setMicrophonePermission(false);
        if (error.name === 'NotAllowedError') {
          setPermissionDenied(true);
        }
      }
    };

    checkMicrophonePermission();
  }, []);

  const handleRequirementCheck = (id) => {
    setCheckedRequirements(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allRequirementsMet = () => {
    return requirements.every(req => checkedRequirements[req.id]);
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    toast.success(`Selected ${character.voiceCharcter} with ${character.accent} accent`);
  };

  const createSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        toast.error('Please login to continue');
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/createSession', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
        }),
        credentials: 'include'
      });

      const data = await response.json();
      if(data.Success){
        const sessionId = data.session_id;
        let timeStamp = Date.now();
        localStorage.setItem('sessionId', sessionId);
        router.push(`/character?characterId=${selectedCharacter.no}&timeStamp=${timeStamp}&sessionId=${sessionId}`);
      }else{
        toast.error(data.Error);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Get Ready for Your Session</h1>
        
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Requirements Checklist */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Before We Begin(Click the checkbox)</h2>
            <div className="space-y-4">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => handleRequirementCheck(req.id)}>
                  <div className="flex-shrink-0">
                    {checkedRequirements[req.id] ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{req.title}</h3>
                    <p className="text-sm text-gray-500">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Character Selection */}
          {allRequirementsMet() && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Select Your Avatar</h2>
              <CharacterList 
                onCharacterSelect={handleCharacterSelect} 
                selectedCharacter={selectedCharacter}
              />
              {selectedCharacter && (
                <div className="mt-6">
                  <button
                    onClick={createSession}
                    disabled={isStarting}
                    className={`w-full py-3 px-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${
                      isStarting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isStarting ? 'Starting Session...' : 'Start Session'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
