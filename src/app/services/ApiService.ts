// src/services/ApiService.ts
import axios, { AxiosInstance } from "axios";

const apiService: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

const ApiService = {
  async get(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await apiService.get(endpoint, { params });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("GET Axios error:", err.response?.data || err.message);
        throw err;
      } else {
        console.error("GET unexpected error:", err);
        throw err;
      }
    }
  },

  // Supports both JSON and multipart/form-data (via config)
  async post(endpoint: string, data: any = {}, config: any = {}) {
    try {
      const response = await apiService.post(endpoint, data, config);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("POST Axios error:", err.response?.data || err.message);
        throw err;
      } else {
        console.error("POST unexpected error:", err);
        throw err;
      }
    }
  },

  async put(endpoint: string, data: any = {}, config: any = {}) {
    try {
      const response = await apiService.put(endpoint, data, config);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("PUT Axios error:", err.response?.data || err.message);
        throw err;
      } else {
        console.error("PUT unexpected error:", err);
        throw err;
      }
    }
  },

  async delete(endpoint: string, config: any = {}) {
    try {
      const response = await apiService.delete(endpoint, config);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("DELETE Axios error:", err.response?.data || err.message);
        throw err;
      } else {
        console.error("DELETE unexpected error:", err);
        throw err;
      }
    }
  },
};

export default ApiService;
