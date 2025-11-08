import axios from "axios";

// Create an Axios instance with your backend base URL
const API = axios.create({
  baseURL: "http://localhost:8080", // ✅ match your backend port (from your Express server)
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
