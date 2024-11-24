'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function Students() {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [email, setEmail] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/getAllStudents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`},
        body: JSON.stringify({ pageNo: currentPage, "email":localStorage.getItem('adminEmail') }),
      });
      const data = await response.json();
      console.log(data);
      if (data.Success) {
        setStudents(data.Success);
        setTotalPages(totalPages+1);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, email]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleUpdateStudent = async (updatedData) => {
    try {
      const response = await fetch('/api/students/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchStudents();
      } else {
        alert('Failed to update student information');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student information');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent-color">Students</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by email"
            className="px-4 py-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field of Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Desired Degree
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{student.student_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`${student.personal_information.first_name} ${student.personal_information.last_name}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.program_interests.field_of_interest}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.program_interests.desired_degree}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Student Edit Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {selectedStudent && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Edit Student Information</h2>
                
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.personal_information.first_name}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.personal_information.last_name}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.personal_information.date_of_birth}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gender</label>
                      <select
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.personal_information.gender}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education Background */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Education Background</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Qualification</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.education_background.current_qualification}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Graduation Year</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.education_background.graduation_year}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Institution</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.education_background.institution}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stream of Study</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.education_background.stream_of_study}
                      />
                    </div>
                  </div>
                </div>

                {/* Program Interests */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Program Interests</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Desired Degree</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.program_interests.desired_degree}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Field of Interest</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.program_interests.field_of_interest}
                      />
                    </div>
                  </div>
                </div>

                {/* Assessment Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Assessment Scores</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">GRE Score</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.assessment_scores.gre_score}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">GMAT Score</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.assessment_scores.gmat_score}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">IELTS Score</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.assessment_scores.ielts_score}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">TOEFL Score</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        defaultValue={selectedStudent.assessment_scores.toefl_score}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateStudent(selectedStudent)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
