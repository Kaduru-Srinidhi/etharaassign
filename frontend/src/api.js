import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (name, email, password) =>
  api.post('/auth/signup', { name, email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getCurrentUser = () => api.get('/auth/me');

// Projects
export const createProject = (name, description) =>
  api.post('/projects', { name, description });

export const getProjects = () => api.get('/projects');

export const getProjectById = (projectId) =>
  api.get(`/projects/${projectId}`);

export const updateProject = (projectId, name, description) =>
  api.put(`/projects/${projectId}`, { name, description });

export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}`);

export const addProjectMember = (projectId, userId, role) =>
  api.post(`/projects/${projectId}/members`, { userId, role });

export const getProjectMembers = (projectId) =>
  api.get(`/projects/${projectId}/members`);

// Tasks
export const createTask = (projectId, title, description, assigned_to, priority, due_date) =>
  api.post(`/tasks/${projectId}/tasks`, {
    title,
    description,
    assigned_to,
    priority,
    due_date,
  });

export const getTasks = (projectId) =>
  api.get(`/tasks/${projectId}/tasks`);

export const getTaskById = (projectId, taskId) =>
  api.get(`/tasks/${projectId}/tasks/${taskId}`);

export const updateTask = (projectId, taskId, updates) =>
  api.put(`/tasks/${projectId}/tasks/${taskId}`, updates);

export const deleteTask = (projectId, taskId) =>
  api.delete(`/tasks/${projectId}/tasks/${taskId}`);

export const getDashboard = () =>
  api.get('/tasks/dashboard/overview');

export default api;
