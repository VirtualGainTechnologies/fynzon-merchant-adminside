export interface SubAdminPayload {
  userId?: string;
  userName: string;
  phoneCode: string;
  phone: string;
  email: string;
  password?: string;
  role: string;
}