// src/apis/axiosInstance.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
  baseURL: 'http://10.122.209.131:3008/api',
  timeout: 10000,
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage. getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;
