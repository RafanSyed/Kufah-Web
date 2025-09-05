import axios, { AxiosInstance, AxiosError } from "axios";

const apiService: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

const ApiService = {
  async get(endpoint: string, params = {}) {
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

  async post(endpoint: string, data = {}) {
    try {
      const response = await apiService.post(endpoint, data);
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

  async put(endpoint: string, data = {}, config = {}) {
    try {
      const response = await apiService.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

};

export default ApiService;
