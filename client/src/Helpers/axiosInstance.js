import axios from "axios";

const BASE_URL = "http://65.1.91.189:5000/api/v1"; // 👈 replace with your EC2 public IP and port

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default axiosInstance;
