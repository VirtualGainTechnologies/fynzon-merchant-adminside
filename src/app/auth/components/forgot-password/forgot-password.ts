import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Field, form, required, email, submit, minLength, validate } from '@angular/forms/signals';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgOtpInputModule } from 'ng-otp-input';

import { AuthService } from '../../services/auth.service';
import { OtpData } from '../../models/otpModel';
import { AuthData } from '../../models/authModel';
import { getTimer } from '../../../utils/timer';
import { FixedMaskDataPipe } from '../../../shared/pipes/mask-data.pipe';
import { OtpPayload } from '../../types/otpPayload';
import { PasswordStrength } from '../../../shared/components/password-strength/password-strength';
import { DisableCutCopyPasteDirective } from "../../../shared/directives/disableCutCopyPaste.directive";

interface ChangePasswordData {
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FixedMaskDataPipe,
    PasswordStrength,
    Field,
    NgOtpInputModule,
    NgOptimizedImage,
    DisableCutCopyPasteDirective
],
})
export class ForgotPassword {
  readonly lockImg = signal<string>('assets/icons/lock_img.png');
  showVisibilityIcon = signal<boolean>(true);
  fieldTextType = signal<boolean>(false);
  fieldTextType2 = signal<boolean>(false);
  step = signal<number>(1);
  resendOtpTimer$!: Observable<any>;
  spinner = signal<boolean>(false);
  resendOtpLoader = signal<boolean>(false);
  otpData = signal<OtpData | null>(null);
  otp = signal<string | null>(null);
  ngOtpConfig = signal({
    allowNumbersOnly: true,
    length: 6,
    placeholder: '-',
    inputStyles: {
      width: '40px',
      height: '40px',
      border: '2px solid #008cba',
      fontSize: '18px',
    },
  });
  updatePasswordMinLengthValidation = signal<boolean>(false);
  updateConfirmPasswordRequiredValidation = signal<boolean>(false);
  updateOtpValidation = signal<boolean>(false);

  changePasswordModel = signal<ChangePasswordData>({
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  changePasswordForm = form(this.changePasswordModel, (fieldPath) => {
    required(fieldPath.email, { message: 'Email is required!' });
    email(fieldPath.email, { message: 'Enter valid email address!' });
    required(fieldPath.password, {
      message: 'Enter new password!',
      when: () => this.updatePasswordMinLengthValidation(),
    });
    required(fieldPath.confirmPassword, {
      message: 'Enter password again!',
      when: () => this.updateConfirmPasswordRequiredValidation(),
    });
    required(fieldPath.otp, {
      message:
        'Kindly enter the 6-digit OTP we sent to your email address registered with Fynzon-merchangt!',
      when: () => this.updateOtpValidation(),
    });
  });

  private deviceService = inject(DeviceDetectorService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  constructor() {}

  ngOnInit(): void {
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

  togglePasswordVisibility1(): void {
    this.fieldTextType.update((value) => !value);
  }

  togglePasswordVisibility2(): void {
    this.fieldTextType2.update((value) => !value);
  }

  sendOtp(): void {
    this.spinner.set(true);

    if (this.changePasswordForm().invalid()) {
      this.snackBar.open('Please fill all the required fields', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      this.spinner.set(false);
      return;
    }

    const payload = {
      email: this.changePasswordForm.email().value(),
    };

    this.authService.sendForgotPasswordOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.spinner.set(false);
        this.otpData.set(response);
        this.updateOtpValidation.set(true);
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

  onOtpChange(otp: string): void {
    if (otp?.length === 6) {
      this.changePasswordForm.otp().value.set(otp);
    } else {
      this.changePasswordForm.otp().reset();
    }
  }

  verifyOtp(): void {
    this.spinner.set(true);

    if (this.changePasswordForm().invalid()) {
      this.snackBar.open('Please fill all the required fields', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      this.spinner.set(false);
      return;
    }

    const payload: OtpPayload = {
      otpId: this.otpData()?.data?.otpId,
      otp: this.changePasswordForm.otp().value(),
    };

    this.authService.verifyForgotPasswordOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.spinner.set(false);
        this.otpData.set(response);
        this.updatePasswordMinLengthValidation.set(true);
        this.updateConfirmPasswordRequiredValidation.set(true);
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.step.set(3);
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

  submitChangePasswordForm(event: Event) {
    event.preventDefault();
    if (this.changePasswordForm().invalid()) {
      this.snackBar.open('Please fill all the required fields', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      this.spinner.set(false);
      return;
    }
    submit(this.changePasswordForm, async () => {
      this.spinner.set(true);
      this.changePassword();
    });
  }

  changePassword() {
    const payload = {
      email: this.changePasswordForm.email().value(),
      newPassword: this.changePasswordForm.password().value(),
    };

    this.authService.changePassword(payload).subscribe({
      next: (res: AuthData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.spinner.set(false);

        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.router.navigate(['/']);
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

  resendOtp(): void {
    this.resendOtpLoader.set(true);

    const payload = {
      type: 'reset password',
      email: this.changePasswordForm.email().value(),
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
}
