import axios, { AxiosHeaders } from "axios";

// Axios instance untuk seluruh request ke API Satu Atap
const coreApi = axios.create({
  baseURL: "https://satuatap.my.id/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: sisipkan Authorization jika ada token di localStorage
coreApi.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          config.headers = new AxiosHeaders(config.headers as any);
          config.headers.set("Authorization", `Bearer ${token}`);
        }
      }
    }
  } catch (_) {
    // abaikan jika localStorage tidak tersedia
  }
  return config;
});

// Interceptor response: kembalikan response apa adanya, propagasi error
coreApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default coreApi;
