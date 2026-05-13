import { z } from 'zod';

export const branchSchoolSchema = z.object({
  name: z.string().trim().min(1, 'Tên điểm trường không được để trống')
});

export type BranchSchoolFormValues = z.infer<typeof branchSchoolSchema>;
