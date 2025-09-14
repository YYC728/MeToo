import axios, { AxiosResponse } from 'axios';
import {
  AuthResponse,
  ApiResponse,
  LoginCredentials,
  RegisterData,
  CreateMealData,
  CreateStoryData,
  CreateCommentData,
  MealPost,
  MeTooStory,
  Comment,
  User
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: RegisterData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', data),
  
  login: (data: LoginCredentials): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
  
  verifyEmail: (token: string): Promise<AxiosResponse<AuthResponse>> =>
    api.get(`/auth/verify-email/${token}`),
  
  resendVerification: (email: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/resend-verification', { university_email: email }),
};

// Meals API
export const mealsAPI = {
  getMeals: (params?: {
    dietary_group?: string | string[];
    lat?: number;
    lon?: number;
    radius?: number;
    start_date?: string;
    end_date?: string;
    min_portion_size?: number;
    max_portion_size?: number;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<MealPost[]>>> =>
    api.get('/meals', { params }),
  
  getMealById: (id: string): Promise<AxiosResponse<ApiResponse<MealPost>>> =>
    api.get(`/meals/${id}`),
  
  createMeal: (data: CreateMealData): Promise<AxiosResponse<ApiResponse<MealPost>>> =>
    api.post('/meals', data),
  
  updateMealAvailability: (id: string, is_available: boolean): Promise<AxiosResponse<ApiResponse<MealPost>>> =>
    api.patch(`/meals/${id}/availability`, { is_available }),
};

// Stories API
export const storiesAPI = {
  getStories: (params?: {
    privacy_level?: string;
    tags?: string | string[];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<MeTooStory[]>>> =>
    api.get('/stories', { params }),
  
  getStoryById: (id: string): Promise<AxiosResponse<ApiResponse<MeTooStory>>> =>
    api.get(`/stories/${id}`),
  
  createStory: (data: CreateStoryData): Promise<AxiosResponse<ApiResponse<MeTooStory>>> =>
    api.post('/stories', data),
  
  getStoryComments: (id: string): Promise<AxiosResponse<ApiResponse<Comment[]>>> =>
    api.get(`/stories/${id}/comments`),
  
  addComment: (id: string, data: CreateCommentData): Promise<AxiosResponse<ApiResponse<Comment>>> =>
    api.post(`/stories/${id}/comments`, data),
};

// File upload API
export const uploadAPI = {
  uploadFile: (file: File): Promise<AxiosResponse<ApiResponse<{ url: string }>>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

