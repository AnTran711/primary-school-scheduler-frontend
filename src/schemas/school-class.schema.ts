import { z } from 'zod';

export const schoolClassSchema = z.object({
  name: z.string().trim().min(1, 'Tên lớp không được để trống'),
  branchSchoolId: z.string().trim().min(1, 'Vui lòng chọn một điểm trường'),
  homeroomTeacherId: z
    .string()
    .trim()
    .min(1, 'Vui lòng chọn một giáo viên chủ nhiệm')
});

export type SchoolClassFormValues = z.infer<typeof schoolClassSchema>;
