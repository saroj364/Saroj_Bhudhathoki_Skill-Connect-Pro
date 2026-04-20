import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001/api";

const authAxios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default authAxios;
