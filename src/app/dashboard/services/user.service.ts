import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environment/environment.dev';
import { Observable} from 'rxjs';
import { SubAdminModel } from '../models/subadminModel';
import { SubAdminPayload } from '../types/subAdminPayload';
import { SubAdminDataModel } from '../models/subAdminDataModel';
import { UpdateMerchantPayload } from '../types/updateMerchantPayload';
import { MerchantModel, MerchantResponse, UserKycModel } from '../models/userModel';

@Injectable({
  providedIn: 'root',
})
  
export class UserService {
  baseUrl = signal<string>(environment.apiUrl);
  private http = inject(HttpClient);

  getSubAdminData(): Observable<SubAdminModel> {
    return this.http.get<SubAdminModel>(`${this.baseUrl()}/admin/auth/api/v1/get-all-sub-admins`);
  }

  sendSubAdminData(payload: SubAdminPayload): Observable<SubAdminDataModel> {
    return this.http.post<SubAdminDataModel>(
      `${this.baseUrl()}/admin/auth/api/v1/upsert-sub-admin`,
      payload
    );
  }

  updateMerchantData(payload: UpdateMerchantPayload, id: string): Observable<MerchantResponse> {
    return this.http.put<MerchantResponse>(
      `${this.baseUrl()}/admin/manage-merchants/api/v1/update/${id}}`,
      payload
    );
  }

  getMerchantData(): Observable<MerchantModel> {
    return this.http.get<MerchantModel>(`${this.baseUrl()}/admin/manage-merchants/api/v1/merchants`)
  }

  getUsersKycData(): Observable<UserKycModel>{
    return this.http.get<UserKycModel>(`${this.baseUrl()}/admin/manage-merchants/api/v1/kycs`)
  }
}
