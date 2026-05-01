export interface ApiResponse<T> {
  code: number;
  success: boolean;
  data: T;
  message?: string;
}
