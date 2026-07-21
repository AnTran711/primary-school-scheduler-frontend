import { useState, useEffect, useCallback } from 'react';
import api from '@/api/axios-client';
import { isAxiosError } from 'axios';

// Số lần thử tối đa và khoảng cách giữa các lần (ms)
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000;

const isTauriEnvironment = '__TAURI_INTERNALS__' in window;

/**
 * Hook kiểm tra Spring Boot backend đã sẵn sàng chưa.
 * Poll health endpoint cho đến khi nhận được response thành công.
 */
export const useBackendReady = () => {
  const [isReady, setIsReady] = useState(!isTauriEnvironment);
  const [retryCount, setRetryCount] = useState(0);

  const error =
    retryCount >= MAX_RETRIES
      ? 'Không thể kết nối đến server. Vui lòng khởi động lại ứng dụng.'
      : null;

  const checkBackend = useCallback(async (): Promise<boolean> => {
    try {
      await api.get('/health', { timeout: 3000, skipErrorToast: true });
      setIsReady(true);
      return true;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setIsReady(true);
        return true;
      }
      return false;
    }
  }, []);

  useEffect(() => {
    // 1. Nếu đã sẵn sàng thì không làm gì thêm
    if (isReady) return;

    // 2. Nếu đã hết số lần thử thì dừng luôn
    if (retryCount >= MAX_RETRIES) return;

    // 3. Tiến hành gọi checkBackend định kỳ
    const timer = setTimeout(
      async () => {
        const isSuccess = await checkBackend();

        if (!isSuccess) {
          setRetryCount((prev) => prev + 1);
        }
      },
      retryCount === 0 ? 500 : RETRY_INTERVAL
    );

    return () => clearTimeout(timer);
  }, [retryCount, isReady, checkBackend]);

  return { isReady, retryCount, error };
};
