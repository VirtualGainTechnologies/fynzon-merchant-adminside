import { Component, inject, signal } from '@angular/core';
import { form, Field, submit, required, email } from '@angular/forms/signals';
import { NgOtpInputModule } from 'ng-otp-input';

import { LoginData } from '../../types/loginData';
import { FixedMaskDataPipe } from '../../../shared/pipes/mask-data.pipe';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { OtpData } from '../../models/otpModel';
import { Observable } from 'rxjs';
import { getTimer } from '../../../utils/timer';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../../models/authModel';
import { DeviceDetectorService } from 'ngx-device-detector';

interface LoginCredentials {
  email: string;
  password: string;
  otp: string;
}

@Component({
  selector: 'app-login',
  imports: [
    Field,
    FixedMaskDataPipe,
    NgOtpInputModule,
    CommonModule,
    NgOptimizedImage,
    RouterModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly fynzonLogo = signal<string>('assets/icons/fynzon_logo.svg');
  step = signal<number>(1);
  showVisibilityIcon = signal<boolean>(true);
  fieldTextType = signal<boolean>(false);
  spinner = signal<boolean>(false);
  resendOtpLoader = signal<boolean>(false);
  loginModel = signal<LoginCredentials>({
    email: '',
    password: '',
    otp: '',
  });
  resendOtpTimer$!: Observable<any>;
  otpData = signal<OtpData | null>(null);
  updateOtpValidation = signal < boolean >(false);

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.email, { message: 'Email is required!' });
    email(fieldPath.email, { message: 'Enter valid email address!' });
    required(fieldPath.password, { message: 'Password is required!' });
    required(fieldPath.otp, {
      message:
        'Kindly enter the 6-digit OTP we sent to your email address registered with Fynzon-merchangt!',
      when:()=> this.updateOtpValidation()
    });
  });

  ngOtpConfig = signal({
    allowNumbersOnly: true,
    length: 6,
    placeholder: '-',
    inputStyles: {
      width: '50px',
      height: '50px',
      marginRight: '20px',
      border: '2px solid #008cba',
      fontSize: '20px',
    },
  });

  // dependancies

  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private router = inject(Router);
  private deviceService = inject(DeviceDetectorService);

  ngOnInit() {
    this.checkBrowserSupport();
   }
   checkBrowserSupport(): void {
    if (
      this.deviceService.browser === 'MS-Edge-Chromium' ||
      this.deviceService.browser === 'MS-Edge' ||
      this.deviceService.browser === 'Edge' ||
      this.deviceService.browser === 'Safari'
    ) {
      this.showVisibilityIcon.set(false);
    }
  }

  togglePasswordVisibility() {
    this.fieldTextType.update((value) => !value);
  }

  sendOtp(): void {
    this.spinner.set(true);
    if (this.loginForm().invalid()) {
      this.snackBar.open('Please fill all the required fields', 'close', {
        duration: 5000,
        panelClass: ['error-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      this.spinner.set(false);
      return;
    }

    const payload:LoginData = {
      email: this.loginForm.email().value(),
      password: this.loginForm.password().value(),
    };
    this.authService.sendLoginOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.spinner.set(false);
        this.otpData.set(response);

        this.resendOtpTimer$ = getTimer(300000);
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.step.set(2);
      },
      error: (err: HttpErrorResponse) => {
        this.spinner.set(false);
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  resendOtp() {
    this.resendOtpLoader.set(true);
    const payload = {
      type: 'login',
      email: this.loginForm.email().value(),
    };

    this.authService.resendOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.resendOtpLoader.set(false);

        this.otpData.set(response);
        this.resendOtpTimer$ = getTimer(300000);
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.resendOtpLoader.set(false);
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  onOtpChange(otp: string): void {
    if (otp?.length === 6) {
      this.loginForm.otp().value.set(otp);
    } else {
      this.loginForm.otp().reset();
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, async () => {
      const loginCredentials = this.loginForm().value();
      console.log('the login credential are...', loginCredentials);

      const payload: LoginData = {
        email: this.loginForm.email().value(),
        password: this.loginForm.password().value(),
        otpId: this.otpData()?.data?.otpId,
        otp: this.loginForm.otp().value()
      }

      this.authService.login(payload).subscribe({
        next: (res: AuthData) => {
          const response = JSON.parse(JSON.stringify(res));
          this.spinner.set(false);
          this.otpData.set(response);
          this.snackBar.open(response.message, 'close', {
            duration: 5000,
            panelClass: ['success-snackbar', 'snackbar-with-progress'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
          });
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.spinner.set(false);
          this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
            duration: 5000,
            panelClass: ['error-snackbar', 'snackbar-with-progress'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
          });
        },
      });
    });
  }
}
