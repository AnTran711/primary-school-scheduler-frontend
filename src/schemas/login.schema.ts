import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().trim().min(5, 'Mật khẩu phải có ít nhất 5 ký tự')
});

export type LoginFormValues = z.infer<typeof loginSchema>;
