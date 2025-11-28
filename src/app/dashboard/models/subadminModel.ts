export interface SubAdminModel {
  message: string;
  error: boolean;
  data: UserData;
}

export interface UserData {
  totalRecords: number;
  result: SubAdminData[];
}

export interface SubAdminData {
  _id: string;
  user_name: string;
  email: string;
  phone: string;
  phone_code: string;
  role: string;
  status: string;
  createdAt: Date;
}