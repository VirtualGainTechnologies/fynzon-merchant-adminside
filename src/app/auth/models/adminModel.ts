export interface AdminData {
  message: string;
  error: boolean;
  data: {
    role: string;
    userName: string;
    email: string;
    phoneCode: string;
    phone: string;
    status: string;
  };
}
