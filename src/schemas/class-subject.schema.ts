import { z } from 'zod';

export const classSubjectSchema = z.object({
  subjectId: z.string().min(1, 'Vui lòng chọn môn học'),
  lessonsPerWeek: z.coerce.number().min(1, 'Phải có ít nhất 1 tiết')
});

export type ClassSubjectFormValues = z.infer<typeof classSubjectSchema>;
