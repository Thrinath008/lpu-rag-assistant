import axios from 'axios';
import { ChatResponse, UploadResponse } from './types';

// Use environment variables for API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const API_V1_URL = `${API_BASE_URL}/v1`;

// Create a generic axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const v1Client = axios.create({
  baseURL: API_V1_URL,
});

// Security keys aligned with backend api/core/config.py
const API_KEY = "lpu-rag-dev-key";
const ADMIN_KEY = "lpu-admin-master-key";

export const chatApi = {
  ask: async (query: string): Promise<ChatResponse> => {
    const response = await v1Client.post<ChatResponse>('/ask', 
      { query },
      { headers: { 'x-api-key': API_KEY } }
    );
    return response.data;
  }
};

export const adminApi = {
  uploadDocument: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await v1Client.post<UploadResponse>('/admin/upload', 
      formData,
      { 
        headers: { 
          'x-admin-key': ADMIN_KEY,
          'Content-Type': 'multipart/form-data' 
        } 
      }
    );
    return response.data;
  },

  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};
