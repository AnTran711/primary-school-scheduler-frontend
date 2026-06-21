import api from './axios-client';
import type { ApiResponse } from '@/types/api-response';
import type { UserRecord } from '@/types/user';

// ─── Fetch all users ────────────────────────────────────────────────────────────

export const fetchUsersAPI = async () => {
  const res: ApiResponse<UserRecord[]> = await api.get('/users');

  return res;
};

// ─── Create user ────────────────────────────────────────────────────────────────

export const createUserAPI = async (data: {
  username: string;
  password: string;
}) => {
  const res: ApiResponse<UserRecord> = await api.post('/auth/register', data);

  return res;
};

// ─── Update user ────────────────────────────────────────────────────────────────

export const updateUserAPI = async (
  userId: string,
  data: {
    password: string;
  }
) => {
  const res: ApiResponse<UserRecord> = await api.put(`/users/${userId}`, data);

  return res;
};

// ─── Delete user ────────────────────────────────────────────────────────────────

export const deleteUserAPI = async (userId: string) => {
  const res: ApiResponse<string> = await api.delete(`/users/${userId}`);

  return res;
};
