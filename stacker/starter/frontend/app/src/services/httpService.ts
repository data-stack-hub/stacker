// src/services/httpService.ts
import axios, { AxiosResponse, AxiosError } from 'axios';


class HttpService {
  private axiosInstance;

  constructor() {
    // Create an axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: 'http://127.0.0.1:3000', // Your FastAPI backend URL
      headers: {
        'Content-Type': 'application/json',
        "Prefer": "resolution=merge-duplicates", 
      },
    });
  }

  // Method to handle GET requests
  async get<T>(url: string){
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url);
      return { data: response.data, status: response.status };
    } catch (error:any) {
      return this.handleError(error);
    }
  }

  // Method to handle POST requests
  async post<T>(url: string, payload: any) {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(url, payload);
      return { data: response.data, status: response.status };
    } catch (error:any) {
      return this.handleError(error);
    }
  }

  // Method to handle PUT requests
  async put<T>(url: string, payload: any) {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.patch(url, payload);
      return { data: response.data, status: response.status };
    } catch (error:any) {
      return this.handleError(error);
    }
  }

  // Method to handle DELETE requests
  async delete<T>(url: string) {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(url);
      return { data: response.data, status: response.status };
    } catch (error:any) {
      return this.handleError(error);
    }
  }

  // Handle errors from Axios requests
  private handleError(error: any) {
    // Check if error is due to a response (e.g., server-side error)
    if (error.response) {
      return {
        data: null,
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
      };
    }

    // If it's a network or client error (no response)
    return {
      data: null,
      status: 500,
      message: error.message || 'Network Error',
    };
  }
}

const httpService = new HttpService();
export default httpService;
