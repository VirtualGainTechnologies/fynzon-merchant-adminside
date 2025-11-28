export interface MerchantResponse {
  message: string;
  error: boolean;
  data: MerchantData;
}

export interface MerchantData {
  _id: string;
  merchant_type: string;
  email: string;
  business_name: string;
  business_category: string;
  full_name: string;
  profession: string;
  phone_code: string;
  phone: string;
  live_onboarding_enabled: boolean;
  is_blocked: boolean;
  user_api_setting_id: UserApiSettingId;
  createdAt: Date;
}

export interface UserApiSettingId {
  _id: string;
  test_api_key: {
    status: string;
    api_key: string;
    secret_key: string;
    url: string;
    created_at: string;
  };
  live_api_key: {
    status: string;
    api_key: string;
    secret_key: string;
    url: string;
    created_at: string;
  };
  test_ip: IpData[];
  live_ip: IpData[];
}

export interface IpData {
  ip_address: string;
  status: string;
  created_at: Date;
}

export interface UserKycModel {
  message: string;
  error: boolean;
  data: UserKycData;
}

export interface UserKycData {
  totalRecords: number;
  result: KycData[];
}

export interface KycData {
  _id: string;
  merchant_type: string;
  email: string;
  fullName: string;
  userName: string;
  businessName: string;
  kyc_status: string;
  pan: PanData;
  bank: BankData;
  aadhaar?: AadhaarData;
  selfie?: SelfieData;
  gstin?: GSTData;
  createdAt: Date;
}

export interface PanData {
  registeredName: string;
  panNumber: string;
  typeOfHolder: string;
  dateOfBirth: string;
  registeredAddress: string;
  panImage: string;
  status: string;
  issueDate: string;
}

export interface BankData {
  bankName: string;
  branch: string;
  ifscCode: string;
  accountNumber: string;
  accountType: string;
  registeredAddress: string;
  chequeImage: string;
  status: string;
}

export interface GSTData {
  gstinNumber: string;
  businessName: string;
  businessType: string;
  registeredAddress: string;
  status: string;
  constitutionOfBusiness: string;
  centreJurisdiction: string;
  registrationDate: string;
  taxPayerType: string;
}

export interface AadhaarData {
  registeredName: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  registeredAddress: string;
  frontImage: string;
  backImage: string;
  status: string;
  gender: string;
}

export interface SelfieData {
  selfieImage: string;
  status: string;
}

export interface MerchantModel {
  message: string;
  error: boolean;
  data: MerchantTypeData;
}

export interface MerchantTypeData {
  totalRecords: number;
  result: MerchantData[];
}