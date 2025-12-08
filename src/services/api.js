import axios from 'axios';
import { auth } from '../firebaseconfig';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Added auth token to request:', config.url);
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.error('❌ Unauthorized - Token may be expired');
        // Optionally redirect to login
        // window.location.href = '/login';
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('❌ Forbidden - Insufficient permissions');
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // User endpoints
  users: {
    syncUser: (userData) => apiClient.post('/sync/user', userData),
    getUserByUid: (uid) => apiClient.get(`/sync/get-by-uid?uid=${uid}`),
    getProfile: (uid) => apiClient.get(`/users/${uid}/profile`),
    updateProfile: (uid, profileData) => apiClient.put(`/users/${uid}/profile`, profileData),
    uploadProfileImage: (uid, formData) => 
      apiClient.post(`/users/${uid}/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    getAllTeachers: () => apiClient.get('/users/teachers'),
    getAllUsers: () => apiClient.get('/users'),
  },

  // Item endpoints
  items: {
    getAll: () => apiClient.get('/items'),
    getById: (id) => apiClient.get(`/items/${id}`),
    create: (itemData) => apiClient.post('/items', itemData),
    createWithImage: (formData) => 
      apiClient.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id, itemData) => apiClient.put(`/items/${id}`, itemData),
    delete: (id) => apiClient.delete(`/items/${id}`),
  },

  // Borrow request endpoints
  requests: {
    getAll: (status) => apiClient.get('/requests', { params: { status } }),
    getById: (id) => apiClient.get(`/requests/${id}`),
    getUserRequests: (userId) => apiClient.get(`/requests/user/${userId}`),
    getUserHistory: (userId) => apiClient.get(`/requests/user/${userId}/history`),
    getPendingTeacher: () => apiClient.get('/requests/pending-teacher'),
    getPendingLab: () => apiClient.get('/requests/pending-lab'),
    create: (requestData) => apiClient.post('/requests', requestData),
    teacherApprove: (id, approvalData) => 
      apiClient.put(`/requests/${id}/teacher-approve`, approvalData),
    labApprove: (id, approvalData) => 
      apiClient.put(`/requests/${id}/lab-approve`, approvalData),
    updateStatus: (id, statusData) => apiClient.put(`/requests/${id}`, statusData),
    delete: (id) => apiClient.delete(`/requests/${id}`),
  },

  // Maintenance endpoints
  maintenance: {
    getAll: () => apiClient.get('/maintenance/all'),
    getPending: () => apiClient.get('/maintenance/pending'),
    getById: (id) => apiClient.get(`/maintenance/${id}`),
    create: (maintenanceData) => apiClient.post('/maintenance/request', maintenanceData),
    updateProgress: (id, params) => 
      apiClient.put(`/maintenance/${id}/update-progress`, null, { params }),
    delete: (id) => apiClient.delete(`/maintenance/${id}`),
  },
};

export default apiClient;
