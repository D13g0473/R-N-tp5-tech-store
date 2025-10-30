import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Product, Category, Brand, Order, User } from '../types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:1337/api';

// Cliente para operaciones públicas (sin token)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

// Cliente para operaciones autenticadas (con token)
const authenticatedApi = axios.create({
  baseURL: API_BASE_URL,
});

authenticatedApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await authenticatedApi.post('/auth/local', { identifier: email, password });
    return response.data;
  },
  register: async (email: string, password: string) => {
    const response = await authenticatedApi.post('/auth/local/register', { email, password, username: email });
    return response.data;
  },
};

export const productsAPI = {
  getProducts: async (params?: { category?: number; brand?: number; search?: string; page?: number; limit?: number }) => {
    const response = await publicApi.get('/products', {
      params: {
        ...params,
        populate: ['image', 'brand', 'category'],
        'filters[isActive]': true // Solo mostrar productos activos
      }
    });
    return response.data;
  },
  getProduct: async (id: number) => {
    const response = await publicApi.get(`/products/${id}`, {
      params: {
        populate: ['image', 'brand', 'category']
      }
    });
    return response.data;
  },
};

export const categoriesAPI = {
  getCategories: async () => {
    const response = await publicApi.get('/categories');
    return response.data;
  },
};

export const brandsAPI = {
  getBrands: async () => {
    const response = await publicApi.get('/brands');
    return response.data;
  },
};

export const ordersAPI = {
  createOrder: async (order: { items: { product: number; quantity: number }[]; total: number }) => {
    const response = await authenticatedApi.post('/orders', { data: order });
    return response.data;
  },
  getOrders: async () => {
    const response = await authenticatedApi.get('/orders');
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await authenticatedApi.get('/users/me');
    return response.data;
  },
  updateFavorites: async (favorites: number[]) => {
    const response = await authenticatedApi.put('/users/me', { favorites });
    return response.data;
  },
};

// Función helper para construir URLs completas de imágenes
export const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return 'https://via.placeholder.com/150';
  // Si ya es una URL completa, devolverla
  if (imageUrl.startsWith('http')) return imageUrl;
  // Si es relativa, construir la URL completa
  const baseUrl = API_BASE_URL.replace('/api', '');
  console.log('BASE URL:', baseUrl);
  console.log('IMAGE URL:', imageUrl);
  console.log('FINAL URL:', `${baseUrl}${imageUrl}`);
  return `${baseUrl}${imageUrl}`;
};