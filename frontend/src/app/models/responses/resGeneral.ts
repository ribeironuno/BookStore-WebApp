export interface GeneralResponse {
  success: number;
  error: {
    code: number;
    message: string;
  };
}
