import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, User } from '@/types/auth';

/**
 * Decode JWT payload mà không cần thư viện bên ngoài.
 * Trả về object payload hoặc null nếu token không hợp lệ.
 */
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Kiểm tra token JWT đã hết hạn chưa.
 * Trả về true nếu token null, không hợp lệ, hoặc đã hết hạn.
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  // So sánh với thời gian hiện tại (tính bằng giây)
  return Date.now() >= payload.exp * 1000;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions
      login: (user: User, token: string | null) => {
        set({
          user,
          token,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated && state.token !== null
      })
    }
  )
);
