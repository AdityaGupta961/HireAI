import axios from 'axios';
import type { Job, Application, User, StructuredApplication } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { email, password }),
  getProfile: () => api.get<User>('/profile'),
};

export const jobsApi = {
  create: (data: Partial<Job>) => api.post<Job>('/jobs', data),
  getById: (id: string) => api.get<Job>(`/jobs/${id}`),
  list: () => api.get<{ data: Job[]; page: number; limit: number; total: number; totalPages: number }>('/jobs'),
  update: (id: string, data: Partial<Job>) => api.put<Job>(`/jobs/${id}`, data),
};

export const applicationsApi = {
  submit: (jobId: string, data: { rawData: string; resumeFileUrl: string }) =>
    api.post<{ application: Application; structured: StructuredApplication }>(
      `/jobs/${jobId}/applications`,
      data
    ),
  list: (jobId?: string, verdict?: string) =>
    api.get<{ data: (Application & { structured_applications: StructuredApplication })[]; page: number; limit: number; total: number; totalPages: number }>(
      `/applications${jobId || verdict ? `?${jobId ? `jobId=${jobId}&` : ''}${verdict ? `verdict=${verdict}` : ''}` : ''}`
    ),
  getById: (id: string) =>
    api.get<Application & { structured_applications: StructuredApplication }>(`/applications/${id}`),
};
