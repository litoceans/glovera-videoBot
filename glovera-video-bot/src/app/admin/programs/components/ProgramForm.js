'use client';

import { useState } from 'react';

export default function ProgramForm({ universityId, onSubmit, onClose, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    program_name: '',
    specializations: [],
    eligibility_criteria: {
      required_tests: [],
      scholarship_info: '',
      duration: {
        india: '',
        usa: '',
      },
      fee_structure: {
        original_price: 0,
        discounted_price: 0,
      },
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSpecializationsChange = (e) => {
    const specializations = e.target.value.split('\n').filter(s => s.trim());
    setFormData({ ...formData, specializations });
  };

  const handleRequiredTestsChange = (e) => {
    const tests = e.target.value.split('\n').filter(t => t.trim());
    setFormData({
      ...formData,
      eligibility_criteria: {
        ...formData.eligibility_criteria,
        required_tests: tests,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Program' : 'Add New Program'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Program Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.program_name}
              onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
              required
            />
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specializations (one per line)
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              value={formData.specializations?.join('\n')}
              onChange={handleSpecializationsChange}
              rows={3}
            />
          </div>

          {/* Eligibility Criteria */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Eligibility Criteria</h3>

            {/* Required Tests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Tests (one per line)
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                value={formData.eligibility_criteria?.required_tests?.join('\n')}
                onChange={handleRequiredTestsChange}
                rows={3}
              />
            </div>

            {/* Scholarship Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scholarship Info
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.eligibility_criteria?.scholarship_info}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eligibility_criteria: {
                      ...formData.eligibility_criteria,
                      scholarship_info: e.target.value,
                    },
                  })
                }
              />
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (India)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.eligibility_criteria?.duration?.india}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibility_criteria: {
                        ...formData.eligibility_criteria,
                        duration: {
                          ...formData.eligibility_criteria.duration,
                          india: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (USA)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.eligibility_criteria?.duration?.usa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibility_criteria: {
                        ...formData.eligibility_criteria,
                        duration: {
                          ...formData.eligibility_criteria.duration,
                          usa: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Fee Structure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.eligibility_criteria?.fee_structure?.original_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibility_criteria: {
                        ...formData.eligibility_criteria,
                        fee_structure: {
                          ...formData.eligibility_criteria.fee_structure,
                          original_price: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discounted Price
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.eligibility_criteria?.fee_structure?.discounted_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibility_criteria: {
                        ...formData.eligibility_criteria,
                        fee_structure: {
                          ...formData.eligibility_criteria.fee_structure,
                          discounted_price: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              {initialData ? 'Update' : 'Add'} Program
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
