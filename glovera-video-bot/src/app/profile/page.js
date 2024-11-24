'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Profile() {
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

  const profileFields = [
    { label: 'Name', value: `${user.firstName} ${user.lastName}` },
    { label: 'Date of Birth', value: user.dateOfBirth },
    { label: 'Gender', value: user.gender },
    { label: 'Phone Number', value: user.phoneNumber },
    { label: 'Current Qualification', value: user.currentQualification },
    { label: 'Graduation Year', value: user.graduationYear },
    { label: 'Institution', value: user.institution },
    { label: 'Stream of Study', value: user.streamOfStudy },
    { label: 'Desired Degree', value: user.desiredDegree },
    { label: 'Field of Interest', value: user.fieldOfInterest },
    { label: 'Preferred Universities', value: user.preferredUniversities },
    { label: 'Preferred Countries', value: user.preferredCountries },
    { label: 'Budget Range', value: user.budgetRange },
    { label: 'Scholarship Interest', value: user.scholarshipInterest ? 'Yes' : 'No' },
    { label: 'Loan Requirement', value: user.loanRequirement ? 'Yes' : 'No' },
    { label: 'GRE Score', value: user.greScore || 'Not provided' },
    { label: 'GMAT Score', value: user.gmatScore || 'Not provided' },
    { label: 'IELTS Score', value: user.ieltsScore || 'Not provided' },
    { label: 'TOEFL Score', value: user.toeflScore || 'Not provided' },
    { label: 'Working Professional', value: user.isWorkingProfessional ? 'Yes' : 'No' },
    { label: 'Total Experience', value: user.isWorkingProfessional ? `${user.totalExperience} years` : 'N/A' },
  ];

  return (
    <div className="min-h-screen bg-primary-color">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-accent-color">Glovera</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-secondary-color rounded-full transition-colors"
                aria-label="Home"
              >
                <UserIcon className="w-6 h-6 text-accent-color" />
              </button>
              <button
                onClick={logout}
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
          className="max-w-3xl mx-auto"
        >
          <div className="card">
            <h1 className="text-3xl font-bold text-accent-color mb-8">Your Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileFields.map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-200 pb-4"
                >
                  <h3 className="text-sm font-medium text-gray-500">{field.label}</h3>
                  <p className="mt-1 text-lg text-accent-color">{field.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
