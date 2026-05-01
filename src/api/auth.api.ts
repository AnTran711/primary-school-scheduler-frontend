import api from './axios-client';

import type { LoginPayload, LoginResponse } from '@/types/auth';

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  // async changePassword(payload: { oldPassword: string; newPassword: string }) {
  //   const response = await api.post('/auth/change-password', payload);
  //   return response.data;
  // },

  async getCurrentUser() {
    const response = await api.get('/users/my-info');
    return response.data;
  },

  logout() {
    return api.post('/auth/logout');
  }
};
