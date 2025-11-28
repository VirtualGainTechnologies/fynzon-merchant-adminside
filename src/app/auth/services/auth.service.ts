import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, Observable, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environment/environment.dev';
import { LoginData } from '../types/loginData';
import { OtpData } from '../models/otpModel';
import { OtpPayload } from '../types/otpPayload';
import { AuthData } from '../models/authModel';
import { ForgotPasswordPayload } from '../types/forgotPassword';
import { AdminData } from '../models/adminModel';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  protected readonly baseUrl = signal<string>(environment.apiUrl);

  //dependancies

  private http = inject(HttpClient);

  //login scenario apis

  sendLoginOtp(payload: LoginData): Observable<OtpData> {
    return this.http.post<OtpData>(`${this.baseUrl()}/admin/auth/api/v1/send-login-otp`, payload);
  }

  login(payload: LoginData): Observable<AuthData> {
    return this.http.post<AuthData>(`${this.baseUrl()}/admin/auth/api/v1/login`, payload);
  }

  //resend-otp api
  resendOtp(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(`${this.baseUrl()}/resend-otp/api/v1`, payload);
  }

  //forgot password apis
  //forgot-password
  sendForgotPasswordOtp(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.baseUrl()}/admin/password/api/v1/forgot-password/send-otp`,
      payload
    );
  }

  verifyForgotPasswordOtp(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.baseUrl()}/admin/password/api/v1/forgot-password/verify-otp`,
      payload
    );
  }

  changePassword(payload: ForgotPasswordPayload): Observable<AuthData> {
    return this.http.post<AuthData>(
      `${this.baseUrl()}/admin/password/api/v1/forgot-password/change-password`,
      payload
    );
  }

  //get admin profile
  getAdminDetails(): Observable<AdminData> {
    return this.http.get<AdminData>(`${this.baseUrl()}/admin/auth/api/v1/get-admin-profile`);
  }

  //logout
  logout(): Observable<AuthData> {
    return this.http.get<AuthData>(`${this.baseUrl()}/auth/api/v1/logout`);
  }
}
