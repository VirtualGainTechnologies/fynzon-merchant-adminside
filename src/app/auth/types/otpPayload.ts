export interface OtpPayload {
  type?: string;
  otp?: string;
  otpId?: string;
  email?: string;
  phone?: string;
  phoneCode?:string
}