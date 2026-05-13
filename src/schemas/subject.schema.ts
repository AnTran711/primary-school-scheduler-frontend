import { z } from 'zod';

export const subjectSchema = z.object({
  name: z.string().trim().min(1, 'Tên môn học không được để trống')
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
