// src/services/api.js
// This file serves as the API abstraction layer.
// Later, replace these mock Promises with real `axios` calls to your backend.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getTPOAnalytics = async () => {
  await delay(800); // simulate network latency
  
  // Later: return axios.get('/api/analytics').then(res => res.data);
  return {
    placementStatus: [
      { name: 'Placed', value: 450, color: '#10b981' }, // green-500
      { name: 'Unplaced', value: 120, color: '#f43f5e' } // rose-500
    ],
    departmentStats: [
      { dept: 'CSE', placed: 180, total: 200 },
      { dept: 'ECE', placed: 120, total: 150 },
      { dept: 'IT', placed: 100, total: 110 },
      { dept: 'MECH', placed: 30, total: 60 },
      { dept: 'CIVIL', placed: 20, total: 50 },
    ]
  };
};

export const uploadStudentResume = async (formData) => {
  // formData would typically contain the file: formData.get('resume')
  await delay(1500); 
  
  // Later: return axios.post('/api/student/resume', formData, { 
  //   headers: { 'Content-Type': 'multipart/form-data' } 
  // }).then(res => res.data);
  
  return {
    status: 'success',
    message: 'Resume uploaded successfully',
    filename: formData.get('resume')?.name || 'resume.pdf',
    uploadDate: new Date().toISOString()
  };
};
