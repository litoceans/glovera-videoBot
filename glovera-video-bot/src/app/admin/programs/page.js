'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useUniversity } from './hooks/useUniversity';
import UniversityForm from './components/UniversityForm.js';
import ProgramForm from './components/ProgramForm.js';

export default function Programs() {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [showAddUniversity, setShowAddUniversity] = useState(false);
  const {
    loading,
    error,
    createUniversity,
    getUniversity,
    updateUniversity,
    deleteUniversity,
    addProgram,
    getPrograms,
    updateProgram,
    deleteProgram,
  } = useUniversity();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllUniversities/`);
      const data = await response.json();
      if (data.Success) {
        setUniversities(data.Data || []);
      }
    } catch (err) {
      console.error('Error fetching universities:', err);
    }
  };

  const handleAddUniversity = async (universityData) => {
    const result = await createUniversity(universityData);
    if (result?.Success) {
      setShowAddUniversity(false);
      fetchUniversities();
    }
  };

  const handleDeleteUniversity = async (universityId) => {
    if (window.confirm('Are you sure you want to delete this university?')) {
      const result = await deleteUniversity(universityId);
      if (result?.Success) {
        fetchUniversities();
      }
    }
  };

  const handleAddProgram = async (programData) => {
    if (!selectedUniversity) return;
    const result = await addProgram(selectedUniversity.universityId, programData);
    if (result?.Success) {
      setShowAddProgram(false);
      fetchUniversities();
    }
  };

  const handleDeleteProgram = async (universityId, programName) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      const result = await deleteProgram(universityId, programName);
      if (result?.Success) {
        fetchUniversities();
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent-color">Universities & Programs</h1>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowAddUniversity(true)}
          >
            <PlusIcon className="w-5 h-5" />
            Add University
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`btn-primary flex items-center gap-2 ${!selectedUniversity ? 'opacity-50' : ''}`}
            onClick={() => {
              if (!selectedUniversity) {
                alert('Please select a university first by clicking the edit (pencil) icon next to the university.');
                return;
              }
              setShowAddProgram(true);
            }}
          >
            <PlusIcon className="w-5 h-5" />
            Add Program
          </motion.button>
        </div>
      </div>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                University Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {universities.map((university) => (
              <tr key={university.universityId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{university.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{university.location}</td>
                <td className="px-6 py-4">
                  <ul className="list-disc list-inside">
                    {university.programs?.map((program) => (
                      <li key={program.program_name} className="mb-2">
                        {program.program_name}
                        <button
                          onClick={() => handleDeleteProgram(university.universityId, program.program_name)}
                          className="ml-2 text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4 inline" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      className={`text-indigo-600 hover:text-indigo-900 ${selectedUniversity?.universityId === university.universityId ? 'ring-2 ring-indigo-500 rounded-full p-1' : ''}`}
                      onClick={() => {
                        if (selectedUniversity?.universityId === university.universityId) {
                          setSelectedUniversity(null);
                        } else {
                          setSelectedUniversity(university);
                        }
                      }}
                      title={selectedUniversity?.universityId === university.universityId ? 'Deselect University' : 'Select University'}
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteUniversity(university.universityId)}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add University Modal */}
      {showAddUniversity && (
        <UniversityForm
          onSubmit={handleAddUniversity}
          onClose={() => setShowAddUniversity(false)}
        />
      )}

      {/* Add Program Modal */}
      {showAddProgram && selectedUniversity && (
        <ProgramForm
          universityId={selectedUniversity.universityId}
          onSubmit={handleAddProgram}
          onClose={() => setShowAddProgram(false)}
        />
      )}
    </div>
  );
}
