import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login user
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Update user profile (using direct fetch to avoid recursion)
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Updating profile with:', profileData);
    
    const response = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    console.log('Update response:', data);
    
    if (response.ok && data.user) {
      const currentUser = getCurrentUser();
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return data;
    }
    
    throw new Error(data.error || 'Update failed');
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/users/profile-picture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok && data.user) {
      const currentUser = getCurrentUser();
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return data;
    }
    
    throw new Error(data.error || 'Upload failed');
  } catch (error) {
    console.error('Upload profile picture error:', error);
    throw error;
  }
};

// Get fresh user profile from server
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// ─── COURSE API FUNCTIONS ───

// Get all published courses
export const getCourses = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.level) query.append('level', params.level);
  if (params.language) query.append('language', params.language);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);

  const response = await api.get(`/courses?${query.toString()}`);
  return response.data;
};

// Get single course
export const getCourse = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

// Create course
export const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

// Update course
export const updateCourse = async (courseId, courseData) => {
  const response = await api.put(`/courses/${courseId}`, courseData);
  return response.data;
};

// Delete course
export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

// Update course status
export const updateCourseStatus = async (courseId, status) => {
  const response = await api.patch(`/courses/${courseId}/status`, { status });
  return response.data;
};

// Get instructor's courses
export const getMyCourses = async () => {
  const response = await api.get('/courses/my');
  return response.data;
};

// ─── MODULE API FUNCTIONS ───

// Get modules for a course
export const getModules = async (courseId) => {
  const response = await api.get(`/modules/courses/${courseId}/modules`);
  return response.data;
};

// Create module
export const createModule = async (courseId, moduleData) => {
  const response = await api.post(`/modules/courses/${courseId}/modules`, moduleData);
  return response.data;
};

// Update module
export const updateModule = async (moduleId, moduleData) => {
  const response = await api.put(`/modules/${moduleId}`, moduleData);
  return response.data;
};

// Delete module
export const deleteModule = async (moduleId) => {
  const response = await api.delete(`/modules/${moduleId}`);
  return response.data;
};

// ─── LESSON API FUNCTIONS ───

// Get lessons for a module
export const getLessons = async (moduleId) => {
  const response = await api.get(`/lessons/modules/${moduleId}/lessons`);
  return response.data;
};

// Get single lesson
export const getLesson = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}`);
  return response.data;
};

// Create lesson
export const createLesson = async (moduleId, lessonData) => {
  const response = await api.post(`/lessons/modules/${moduleId}/lessons`, lessonData);
  return response.data;
};

// Update lesson
export const updateLesson = async (lessonId, lessonData) => {
  const response = await api.put(`/lessons/${lessonId}`, lessonData);
  return response.data;
};

// Delete lesson
export const deleteLesson = async (lessonId) => {
  const response = await api.delete(`/lessons/${lessonId}`);
  return response.data;
};

// ─── ENROLLMENT API FUNCTIONS ───

// Enroll in a course
export const enrollCourse = async (courseId) => {
  const response = await api.post(`/enrollments/courses/${courseId}/enroll`);
  return response.data;
};

// Unenroll from a course
export const unenrollCourse = async (courseId) => {
  const response = await api.delete(`/enrollments/courses/${courseId}/unenroll`);
  return response.data;
};

// Get my enrolled courses
export const getMyEnrolledCourses = async () => {
  const response = await api.get('/enrollments/my-enrolled');
  return response.data;
};

// Update progress
export const updateProgress = async (enrollmentId, data) => {
  const response = await api.patch(`/enrollments/${enrollmentId}/progress`, data);
  return response.data;
};
// ─── ADMIN API FUNCTIONS ───

// Get all users (admin only)
export const getAllUsers = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.role) query.append('role', params.role);
  if (params.search) query.append('search', params.search);
  const response = await api.get(`/admin/users?${query.toString()}`);
  return response.data;
};

// Update user role/status (admin only)
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};
export default api;
// Reset user password (admin only)
export const resetUserPassword = async (userId, newPassword) => {
  const response = await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
  return response.data;
};
