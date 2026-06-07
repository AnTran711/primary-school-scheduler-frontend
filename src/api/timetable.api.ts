import type { CreateTimetableRequest } from '@/types/timetable';
import api from './axios-client';
import type { ApiResponse } from '@/types/api-response';

export const startSolvingAPI = async (data: CreateTimetableRequest) => {
  const res: ApiResponse<{ jobId: string }> = await api.post(
    '/timetable/solve',
    data
  );

  return res;
};

export const getSolvingStatusAPI = async (jobId: string) => {
  const res = await api.get(`/timetable/status/${jobId}`);

  return res;
};
