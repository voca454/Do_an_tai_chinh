// File: src/services/apiClient.js
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Lấy Token cũ ngay khi F5 trang để tránh lỗi Race Condition
const initialToken = localStorage.getItem("token");
if (initialToken) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

export const authAPI = {
  login: (formData) => apiClient.post("/login", formData),
  register: (data) => apiClient.post("/register", data),
};

export const transactionAPI = {
  getAll: () => apiClient.get("/transactions/"),
  addAI: (text) => apiClient.post(`/transactions/ai?text_input=${text}`),
  delete: (id) => apiClient.delete(`/transactions/${id}`),
  update: (id, data) => apiClient.put(`/transactions/${id}`, data),
};

export const chatAPI = {
  send: (message) => apiClient.post("/chat", { message }),
};

export default apiClient;
