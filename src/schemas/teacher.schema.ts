import { z } from 'zod';

export const teacherSchema = z.object({
  name: z.string().min(1, 'Họ tên không được để trống'),
  numberOfLessonsPerWeek: z.coerce.number().min(1, 'Phải có ít nhất 1 tiết')
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;
