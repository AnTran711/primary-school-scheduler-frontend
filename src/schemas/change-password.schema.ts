import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().trim().min(1, 'Mật khẩu cũ không được để trống'),
    newPassword: z
      .string()
      .trim()
      .min(5, 'Mật khẩu mới phải có ít nhất 5 ký tự'),
    confirmPassword: z
      .string()
      .trim()
      .min(5, 'Xác nhận mật khẩu phải có ít nhất 5 ký tự')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
