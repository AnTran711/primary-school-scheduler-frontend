import { getSolvingStatusAPI, startSolvingAPI } from '@/api/timetable.api';
import type {
  CreateTimetableRequest,
  TimetableResponse
} from '@/types/timetable';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const useTimetableSolving = () => {
  const [isSolving, setIsSolving] = useState(false);

  const solve = async (
    request: CreateTimetableRequest,
    onDone: (result: TimetableResponse) => void
  ) => {
    setIsSolving(true);

    // Gửi request và nhận jobId ngay
    const res = await startSolvingAPI(request);
    const { jobId } = res.data;

    // Polling mỗi 2s để kiểm tra kết quả
    const poll = async (): Promise<void> => {
      const res = await getSolvingStatusAPI(jobId);
      const job = res.data;

      if (job.status === 'DONE') {
        setIsSolving(false);
        onDone(job.result);
        return;
      }

      if (job.status === 'FAILED') {
        setIsSolving(false);
        toast.error(
          job.errorMessage ?? 'Tạo thời khóa biểu thất bại, vui lòng thử lại.'
        );
        return;
      }

      // Còn SOLVING thì chờ 2s rồi poll tiếp
      await new Promise((r) => setTimeout(r, 2000));
      return poll();
    };

    await poll();
  };

  return { isSolving, solve };
};
