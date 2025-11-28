import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { email, form, minLength, required, pattern, Field } from '@angular/forms/signals';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceDetectorService } from 'ngx-device-detector';

import { PasswordStrength } from '../../../../shared/components/password-strength/password-strength';
import { UserService } from '../../../services/user.service';
import { SubAdminPayload } from '../../../types/subAdminPayload';
import { DataTransferService } from '../../../services/dataTransfer.service';

interface SubAdminData {
  user_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
}

@Component({
  selector: 'app-addSubadmin',
  standalone: true,
  imports: [CommonModule, PasswordStrength, Field, NgOptimizedImage],
  templateUrl: './add-subadmin.html',
  styleUrl: './add-subadmin.scss',
})
export class AddSubadmin implements OnInit, OnDestroy {
  showPassword = signal<boolean>(false);
  showPassword2 = signal<boolean>(false);
  showVisibilityIcon = signal<boolean>(true);
  readonly indianFlag = signal<string>('assets/icons/indianFlag.svg');
  readonly roles = signal<string[]>([
    'SUB-ADMIN-LEVEL-1',
    'SUB-ADMIN-LEVEL-2',
    'SUB-ADMIN-LEVEL-3',
  ]);
  subAdminModel = signal({
    user_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  updatepasswordValidation = signal<boolean>(false);

  subAdminForm = form(this.subAdminModel, (fieldPath) => {
    required(fieldPath.user_name, { message: 'Username is required!' });
    minLength(fieldPath.user_name, 2, { message: 'Username should be atleast 2 characters!' });
    required(fieldPath.email, { message: 'Email is required!' });
    email(fieldPath.email, { message: 'Invalid Email!' });
    required(fieldPath.phone, { message: 'Phone is required!' });
    pattern(fieldPath.phone, /^([6-9]{1}[0-9]{9})$/, { message: 'Mobile no should be 10 digits!' });
    required(fieldPath.password, {
      message: 'Password is required!',
      when: this.updatepasswordValidation,
    });
    minLength(fieldPath.password, 8, { message: 'Password should be 8 characters!' });
    required(fieldPath.role, { message: 'Role is required!' });
  });
  isSubadminUpdate = signal<boolean>(false);
  subAdminId = signal<string>('');
  pageLoader = signal<boolean>(false);

  // dependancies
  private router = inject(Router);
  private deviceService = inject(DeviceDetectorService);
  private snackBar = inject(MatSnackBar);
  private dataService = inject(DataTransferService);
  private userService = inject(UserService);

  constructor() {}

  ngOnInit(): void {
    this.checkBrowserSupport();
    this.getSubAdminData();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }

  togglePasswordVisibility2() {
    this.showPassword2.update((value) => !value);
  }

  checkBrowserSupport() {
    if (
      this.deviceService.browser === 'MS-Edge' ||
      this.deviceService.browser === 'Edge' ||
      this.deviceService.browser == 'Safari' ||
      this.deviceService.browser == 'MS-Edge-Chromium'
    ) {
      this.showVisibilityIcon.set(false);
    }
  }

  confirmPasswordValidation(): boolean {
    if (this.subAdminForm.password().value() != this.subAdminForm.confirmPassword().value()) {
      return true;
    } else {
      return false;
    }
  }

  manageSubAdmin(event: Event) {
    event.preventDefault();
    if (this.subAdminForm().invalid()) {
      this.snackBar.open('Please fill all the required fields!', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      return;
    }
    const { email, phone, role, user_name, password } = this.subAdminForm().value();
    const payload: SubAdminPayload = this.isSubadminUpdate()
      ? {
          userId: this.subAdminId(),
          userName: user_name,
          phoneCode: '91',
          phone,
          email,
          role,
          ...(password && { password: password }),
        }
      : {
          userName: user_name,
          phoneCode: '91',
          phone: phone,
          email: email,
          role: role,
          password: password,
        };
    this.pageLoader.set(true);
    this.userService.sendSubAdminData(payload).subscribe({
      next: (res: any) => {
        this.pageLoader.set(false);
        const response = JSON.parse(JSON.stringify(res));
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.router.navigate(['/dashboard/home']);
      },
      error: (err: any) => {
        this.pageLoader.set(false);
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  getSubAdminData() {
    this.dataService.subAdminDetails.subscribe({
      next: (res: any) => {
        if (res) {
          console.log(res);
          this.isSubadminUpdate.set(true);
          this.subAdminId.set(res._id);
          this.subAdminForm.user_name().value.set(res.user_name);
          this.subAdminForm.email().value.set(res.email);
          this.subAdminForm.phone().value.set(res.phone);
          this.subAdminForm.role().value.set(res.role);
          this.updatepasswordValidation.set(false);
        }
      },
      error: (err: any) => {
        console.error('There is an error occured', err);
      },
    });
  }

  ngOnDestroy() {
    this.dataService.setData('');
  }
}
