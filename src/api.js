import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── AUTH ───
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// ─── PROFILE ───
export const updateUserProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  if (response.ok && data.user) {
    const currentUser = getCurrentUser();
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data.user }));
    return data;
  }
  throw new Error(data.error || 'Update failed');
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

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// ─── COURSES ───
export const getCourses = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.level) query.append('level', params.level);
  if (params.language) query.append('language', params.language);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  return (await api.get(`/courses?${query.toString()}`)).data;
};

export const getCourse = async (courseId) => (await api.get(`/courses/${courseId}`)).data;
export const createCourse = async (courseData) => (await api.post('/courses', courseData)).data;
export const updateCourse = async (courseId, courseData) => (await api.put(`/courses/${courseId}`, courseData)).data;
export const deleteCourse = async (courseId) => (await api.delete(`/courses/${courseId}`)).data;
export const updateCourseStatus = async (courseId, status) => (await api.patch(`/courses/${courseId}/status`, { status })).data;
export const getMyCourses = async () => (await api.get('/courses/my')).data;

// ─── MODULES ───
export const getModules = async (courseId) => (await api.get(`/modules/courses/${courseId}/modules`)).data;
export const createModule = async (courseId, moduleData) => (await api.post(`/modules/courses/${courseId}/modules`, moduleData)).data;
export const updateModule = async (moduleId, moduleData) => (await api.put(`/modules/${moduleId}`, moduleData)).data;
export const deleteModule = async (moduleId) => (await api.delete(`/modules/${moduleId}`)).data;

// ─── LESSONS ───
export const getLessons = async (moduleId) => (await api.get(`/lessons/modules/${moduleId}/lessons`)).data;
export const getLesson = async (lessonId) => (await api.get(`/lessons/${lessonId}`)).data;
export const createLesson = async (moduleId, lessonData) => (await api.post(`/lessons/modules/${moduleId}/lessons`, lessonData)).data;
export const updateLesson = async (lessonId, lessonData) => (await api.put(`/lessons/${lessonId}`, lessonData)).data;
export const deleteLesson = async (lessonId) => (await api.delete(`/lessons/${lessonId}`)).data;

// ─── ENROLLMENTS ───
export const enrollCourse = async (courseId) => (await api.post(`/enrollments/courses/${courseId}/enroll`)).data;
export const unenrollCourse = async (courseId) => (await api.delete(`/enrollments/courses/${courseId}/unenroll`)).data;
export const getMyEnrolledCourses = async () => (await api.get('/enrollments/my-enrolled')).data;
export const updateProgress = async (enrollmentId, data) => (await api.patch(`/enrollments/${enrollmentId}/progress`, data)).data;

// ─── ADMIN ───
export const getAllUsers = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.role) query.append('role', params.role);
  if (params.search) query.append('search', params.search);
  return (await api.get(`/admin/users?${query.toString()}`)).data;
};
export const updateUser = async (userId, userData) => (await api.put(`/admin/users/${userId}`, userData)).data;
export const deleteUser = async (userId) => (await api.delete(`/admin/users/${userId}`)).data;
export const resetUserPassword = async (userId, newPassword) => (await api.put(`/admin/users/${userId}/reset-password`, { newPassword })).data;
export const linkParentToStudent = async (parentEmail, studentEmail) => (await api.post('/admin/users/link-parent', { parentEmail, studentEmail })).data;
export const getParentLinks = async () => (await api.get('/admin/users/parent-links')).data;

// ─── PARENT ───
export const getLinkedChildren = async () => (await api.get('/parent/children')).data;
export const linkChild = async (childEmail) => (await api.post('/parent/link-child', { childEmail })).data;
export const unlinkChild = async (childId) => (await api.delete(`/parent/unlink-child/${childId}`)).data;
export const getChildProgress = async (childId) => (await api.get(`/parent/child/${childId}/progress`)).data;

// ─── MESSAGING ───
export const sendMessage = async (messageData) => (await api.post('/messages', messageData)).data;
export const getInbox = async () => (await api.get('/messages/inbox')).data;
export const getSentMessages = async () => (await api.get('/messages/sent')).data;
export const markAsRead = async (messageId) => (await api.patch(`/messages/${messageId}/read`)).data;
export const getCourseInstructor = async (courseId) => (await api.get(`/messages/instructor/${courseId}`)).data;

export default api;