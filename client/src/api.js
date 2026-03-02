import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return config;
});

// Auth
export const studentSignup = (data) => API.post('/auth/student/signup', data);
export const studentLogin = (data) => API.post('/auth/student/login', data);
export const companySignup = (data) => API.post('/auth/company/signup', data);
export const companyLogin = (data) => API.post('/auth/company/login', data);

// Internships
export const getAllInternships = () => API.get('/internships');
export const getInternship = (id) => API.get(`/internships/${id}`);
export const getMyInternships = () => API.get('/internships/company/mine');
export const createInternship = (data) => API.post('/internships', data);
export const deleteInternship = (id) => API.delete(`/internships/${id}`);

// Upload
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return API.post('/upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Applications
export const applyToInternship = (data) => API.post('/applications', data);
export const getMyApplications = () => API.get('/applications/mine');
export const getApplicants = (internshipId) => API.get(`/applications/internship/${internshipId}`);
export const updateApplicationStatus = (id, status) => API.patch(`/applications/${id}/status`, { status });

export default API;
