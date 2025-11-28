export interface SubAdminDataModel {
  message: string;
  error: boolean;
  data:SubAdminResponse
};

export interface SubAdminResponse {
  user_name: string;
  phone_code: string;
  phone: string;
  email: string;
  password: string;
  role: string;
  token: string;
  login_count:number
}