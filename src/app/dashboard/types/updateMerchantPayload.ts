export interface UpdateMerchantPayload {
  merchantStatus?: string;
  liveOnboardingEnabled?: boolean;
  ips?: IpsData[];
  apiKeys?: APIData[];
}

export interface IpsData {
  mode: string;
  ip: string;
  status: string;
}

export interface APIData {
  mode: string;
  status: string;
}
