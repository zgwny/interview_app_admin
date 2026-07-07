import axios from 'axios';

// 开发时走 Vite proxy（/api → http://localhost:3000），生产时按需配置 baseURL
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '',
  timeout: 10000,
});

// 请求拦截：自动附加 JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：401 跳转登录
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
