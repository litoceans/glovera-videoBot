'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import './styles.css';
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
// Data for dropdowns
const countries = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'DE', label: 'Germany' },
  // Add more countries as needed
];

const mastersDegrees = [
  { value: 'MBA', label: 'Master of Business Administration (MBA)' },
  { value: 'MS_CS', label: 'Master of Science in Computer Science' },
  { value: 'MS_DS', label: 'Master of Science in Data Science' },
  { value: 'MS_AI', label: 'Master of Science in Artificial Intelligence' },
  { value: 'MS_CE', label: 'Master of Science in Civil Engineering' },
  { value: 'MS_ME', label: 'Master of Science in Mechanical Engineering' },
  { value: 'MS_EE', label: 'Master of Science in Electrical Engineering' },
  // Add more degrees as needed
];

const fieldsOfInterest = [
  { value: 'CS', label: 'Computer Science' },
  { value: 'BUS', label: 'Business' },
  { value: 'ENG', label: 'Engineering' },
  { value: 'DS', label: 'Data Science' },
  { value: 'AI', label: 'Artificial Intelligence' },
  { value: 'FIN', label: 'Finance' },
  // Add more fields as needed
];

const budgetRanges = [
  { value: '10-15', label: '10-15 Lakhs' },
  { value: '15-30', label: '15-30 Lakhs' },
  { value: '30-40', label: '30-40 Lakhs' },
  { value: '40-50', label: '40-50 Lakhs' },
];

const experienceRanges = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
];

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 10 }, (_, i) => ({
  value: currentYear - i,
  label: `${currentYear - i}`,
}));

const phoneRegExp = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').min(1).max(50),
  lastName: Yup.string().required('Last name is required').min(1).max(50),
  dateOfBirth: Yup.string()
    .required('Date of birth is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  gender: Yup.string()
    .required('Gender is required')
    .matches(/^(Male|Female|Other)$/, 'Invalid gender'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  currentQualification: Yup.string().required('Current qualification is required').min(1).max(100),
  graduationYear: Yup.number()
    .required('Graduation year is required')
    .min(1900)
    .max(2100),
  institution: Yup.string().required('Institution is required').min(1).max(100),
  streamOfStudy: Yup.string().required('Stream of study is required').min(1).max(100),
  desiredDegree: Yup.string().required('Desired degree is required').min(1).max(100),
  fieldOfInterest: Yup.string().required('Field of interest is required').min(1).max(100),
  preferredUniversities: Yup.string().required('Preferred universities are required').min(1),
  preferredCountries: Yup.array().min(1, 'At least one country must be selected'),
  budgetRange: Yup.string()
    .required('Budget range is required')
    .matches(/^\d+-\d+$/, 'Invalid budget range format'),
  scholarshipInterest: Yup.boolean().required('Scholarship interest is required'),
  loanRequirement: Yup.boolean().required('Loan requirement is required'),
  greScore: Yup.number().min(0).max(340).optional(),
  gmatScore: Yup.number().min(0).max(800).optional(),
  ieltsScore: Yup.number().min(0).max(9).optional(),
  toeflScore: Yup.number().min(0).max(120).optional(),
  totalExperience: Yup.string().matches(/^\d+-\d+$/, 'Invalid experience range format').optional(),
});

export default function CompleteProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [stepErrors, setStepErrors] = useState({});
  const apiCounter = useRef(0);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: '',
      currentQualification: '',
      graduationYear: '',
      institution: '',
      streamOfStudy: '',
      desiredDegree: '',
      fieldOfInterest: '',
      preferredUniversities: '',
      preferredCountries: [],
      budgetRange: '',
      scholarshipInterest: '',
      loanRequirement: '',
      totalExperience: '',
      greScore: '',
      gmatScore: '',
      ieltsScore: '',
      toeflScore: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to update your profile');
          router.push('/login');
          return;
        }

        // Format the data according to the backend model
        const formattedValues = {
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: values.phoneNumber,
          date_of_birth: values.dateOfBirth,
          gender: values.gender,
          current_qualification: values.currentQualification,
          graduation_year: parseInt(values.graduationYear),
          institution: values.institution,
          stream_of_study: values.streamOfStudy,
          desired_degree: values.desiredDegree,
          field_of_interest: values.fieldOfInterest,
          preferred_universities: [values.preferredUniversities],
          preferred_countries: values.preferredCountries.map(country => country) || [],
          budget_range: values.budgetRange,
          scholarship_interest: values.scholarshipInterest,
          loan_requirement: values.loanRequirement,
          total_exp: values.totalExperience || '0-2',
          gre_score: parseInt(values.greScore) || 0,
          gmat_score: parseInt(values.gmatScore) || 0,
          ielts_score: parseInt(values.ieltsScore) || 0,
          toefl_score: parseInt(values.toeflScore) || 0,
          token: token,
          userId: localStorage.getItem('userId')
        };

        console.log("Sending request with data:", formattedValues);

        const response = await fetch(`${NEXT_PUBLIC_API_URL}/updateProfile`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify(formattedValues)
        });

        const responseData = await response.json();
        console.log("Response:", responseData);

        if (!response.ok) {
          throw new Error(responseData.detail || 'Failed to update profile');
        }

        toast.success('Profile updated successfully!');
        router.push('/');
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Failed to update profile. Please try again.');
      }
    },
  });

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to continue');
          router.push('/login');
          return;
        }

        const response = await fetch(`${NEXT_PUBLIC_API_URL}/checkProfileCompletion`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: localStorage.getItem('userId')
          }),
          credentials: 'include'
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to check profile status');
        }

        if (data.isProfileCompleted) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        toast.error(error.message || 'Failed to check profile status');
      } finally {
        setIsLoading(false);
      }
    };
    if(apiCounter.current === 0){
      apiCounter.current++;
    checkProfileCompletion();
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Function to clear error for a specific field
  const clearFieldError = (field) => {
    setStepErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Custom change handler that clears errors
  const handleFieldChange = (field, value) => {
    formik.setFieldValue(field, value);
    clearFieldError(field);
    formik.setFieldError(field, undefined);
  };

  const steps = [
    {
      title: 'Personal Information',
      fields: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber'],
    },
    {
      title: 'Educational Background',
      fields: ['currentQualification', 'graduationYear', 'institution', 'streamOfStudy'],
    },
    {
      title: 'Study Preferences',
      fields: ['desiredDegree', 'fieldOfInterest', 'preferredUniversities', 'preferredCountries'],
    },
    {
      title: 'Financial Information',
      fields: ['budgetRange', 'scholarshipInterest', 'loanRequirement'],
    },
    {
      title: 'Test Scores',
      fields: ['greScore', 'gmatScore', 'ieltsScore', 'toeflScore'],
    },
    {
      title: 'Professional Experience',
      fields: ['isWorkingProfessional', 'totalExperience'],
    },
  ];

  // Function to validate current step
  const validateStep = (stepIndex) => {
    const currentFields = steps[stepIndex - 1].fields;
    let errors = {};
    let isValid = true;

    currentFields.forEach(field => {
      formik.setFieldTouched(field, true);
    });

    currentFields.forEach(field => {
      if (field === 'preferredUniversities') return;
      if (field === 'greScore' || field === 'gmatScore' || 
          field === 'ieltsScore' || field === 'toeflScore') return;
      if (field === 'totalExperience' && !formik.values.isWorkingProfessional) return;

      const value = formik.values[field];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });

    setStepErrors(errors);
    return isValid;
  };

  // Function to handle next step
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error('Please fill in all required fields correctly before proceeding.');
    }
  };

  const currentStep = steps[step - 1];

  const renderField = (field) => {
    switch (field) {
      case 'gender':
        return (
          <select
            name={field}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={formik.handleBlur}
            value={formik.values[field]}
            className="input-field"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        );

      case 'phoneNumber':
        return (
          <PhoneInput
            country={selectedCountry?.value.toLowerCase() || 'in'}
            value={formik.values[field]}
            onChange={(phone) => handleFieldChange(field, phone)}
            inputClass="input-field"
          />
        );

      case 'graduationYear':
        return (
          <Select
            options={graduationYears}
            value={graduationYears.find(y => y.value === formik.values[field])}
            onChange={(option) => handleFieldChange(field, option.value)}
            className="react-select"
          />
        );

      case 'desiredDegree':
        return (
          <Select
            options={mastersDegrees}
            value={mastersDegrees.find(d => d.value === formik.values[field])}
            onChange={(option) => handleFieldChange(field, option.value)}
            className="react-select"
          />
        );

      case 'fieldOfInterest':
        return (
          <Select
            options={fieldsOfInterest}
            value={fieldsOfInterest.find(f => f.value === formik.values[field])}
            onChange={(option) => handleFieldChange(field, option.value)}
            className="react-select"
          />
        );

      case 'preferredCountries':
        return (
          <Select
            isMulti
            options={countries}
            value={formik.values[field].map(value => countries.find(c => c.value === value))}
            onChange={(options) => {
              handleFieldChange(
                field,
                options ? options.map(option => option.value) : []
              );
              if (options && options.length > 0 && !selectedCountry) {
                setSelectedCountry(options[0]);
              }
            }}
            className="react-select"
          />
        );

      case 'budgetRange':
        return (
          <Select
            options={budgetRanges}
            value={budgetRanges.find(b => b.value === formik.values[field])}
            onChange={(option) => handleFieldChange(field, option.value)}
            className="react-select"
          />
        );

      case 'totalExperience':
        return (
          <Select
            options={experienceRanges}
            value={experienceRanges.find(e => e.value === formik.values[field])}
            onChange={(option) => handleFieldChange(field, option.value)}
            className="react-select"
            isDisabled={!formik.values.isWorkingProfessional}
          />
        );

      case 'isWorkingProfessional':
      case 'scholarshipInterest':
      case 'loanRequirement':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={field}
              onChange={(e) => handleFieldChange(field, e.target.checked)}
              onBlur={formik.handleBlur}
              checked={formik.values[field]}
              className="h-4 w-4 text-accent-color"
            />
            <span className="ml-2">Yes</span>
          </div>
        );

      default:
        return (
          <input
            type={field === 'dateOfBirth' ? 'date' : 'text'}
            name={field}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={formik.handleBlur}
            value={formik.values[field]}
            className="input-field"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-primary-color py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card">
            <h1 className="text-3xl font-bold text-accent-color mb-6">Complete Your Profile</h1>
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {steps.map((s, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step > index + 1
                        ? 'bg-accent-color text-primary-color'
                        : step === index + 1
                        ? 'bg-secondary-color text-accent-color'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-accent-color rounded-full transition-all duration-300"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">{currentStep.title}</h2>
              <div className="space-y-4">
                {currentStep.fields.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.split(/(?=[A-Z])/).join(' ')}
                      {!['preferredUniversities', 'greScore', 'gmatScore', 'ieltsScore', 'toeflScore'].includes(field) &&
                       !(field === 'totalExperience' && !formik.values.isWorkingProfessional) && 
                       <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                    {(formik.touched[field] && formik.errors[field]) || stepErrors[field] ? (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors[field] || stepErrors[field]}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(step - 1);
                      window.scrollTo(0, 0);
                    }}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                )}
                {step < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary ml-auto"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="btn-primary ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      if (validateStep(step)) {
                        formik.handleSubmit();
                      } else {
                        toast.error('Please fill in all required fields correctly before submitting.');
                      }
                    }}
                  >
                    Complete Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
