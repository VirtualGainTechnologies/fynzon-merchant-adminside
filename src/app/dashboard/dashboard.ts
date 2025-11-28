import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../auth/services/auth.service';
import { TruncateTextDirective } from '../shared/directives/truncate-text.directive';
import { PlatformBrowserService } from '../shared/services/platform-browser.service';
import { combineLatest } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    TruncateTextDirective,
    MatTooltipModule,
    NgOptimizedImage,
  ],
})
export class Dashboard {
  render = signal<string>('');
  preView = signal<string>('');
  activeComponent = signal<string>('getStarted');
  addSubadmin = signal<string>('/icons/addSubadmin.svg');
  isExpanded = signal<boolean>(false);
  imageUrl = signal<string>('');
  isMenubarExpanded = signal<boolean>(false);
  isDarkMode = signal<boolean>(true);
  menubarWidth = signal<string>('50px');
  subMenubarWidth = signal<string>('15%');
  business_img = signal<string>('assets/icons/business_img.svg');
  leftMargin = signal<string>('0px');
  preventCollapse = signal<boolean>(false);
  preventExpand = signal<boolean>(false);
  menuStyles = signal<{ [key: string]: string }>({
    height: '100vh',
  });
  sectionStyles = signal<{ [key: string]: string }>({
    height: '100vh',
  });

  isTxnDetailsActive = signal<boolean>(true);
  isSubAdminActive = signal<boolean>(true);
  isOtherMenuActive = signal<boolean>(false);
  isBrowser = signal<boolean>(false);
  pageLoader = signal<boolean>(false);

  //dependencies
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private platform = inject(PlatformBrowserService);
  public authService = inject(AuthService);
  adminData$ = combineLatest({ admin: this.authService.getAdminDetails() });
  admin = signal<any>(null);
  constructor() {}

  ngOnInit() {
    if (this.platform.isBrowser) {
      combineLatest({
        admin: this.authService.getAdminDetails(),
      }).subscribe((res) => {
        this.admin.set(res);
      });
    }
  }

  isParentActive(menuName: string) {
    switch (menuName) {
      case 'TXN-DETAILS':
        this.isTxnDetailsActive.set(false);

        this.isOtherMenuActive.set(true);
        break;
      case 'SUBADMIN':
        this.isSubAdminActive.set(false);
        this.isOtherMenuActive.set(true);
        break;
      default:
        this.isSubAdminActive.set(true);
        this.isTxnDetailsActive.set(true);
        this.isOtherMenuActive.set(true);
    }
  }

  openMainMenuComponent(active: string) {
    this.openSubMenuComponent(active);
    this.collapseMenuBar('collapse');
  }

  openSubMenuComponent(active: string) {
    this.menubarWidth.set('50px');
    this.leftMargin.set('0%');
    this.activeComponent.set(active);
    this.preventExpand.set(true);
  }

  renderSubMenuBar(view: string) {
    this.menubarWidth.set('50px');
    this.leftMargin.set('0%');
    this.activeComponent.set(view);
    this.render.set(view);
    this.preView.set(view);
    this.preventExpand.set(true);
  }

  expandMenuBar(expand: string) {
    if (!this.preventExpand()) {
      this.isMenubarExpanded.set(true);
      this.menubarWidth.set('16%');
      if (expand == 'expandwithbutton') {
        this.leftMargin.set('0%');
        this.preventCollapse.set(true);
      } else {
        this.render() ? this.leftMargin.set('0%') : this.leftMargin.set('13%');
        this.subMenubarWidth.set('15%');
      }
    } else {
      this.preventExpand.set(false);
    }
  }

  collapseMenuBar(collapse: string) {
    if (!this.preventCollapse()) {
      this.isMenubarExpanded.set(false);
      this.menubarWidth.set('50px');
      this.leftMargin.set('0px');
      if (collapse == 'collapse') {
        setTimeout(() => this.render.set(''), 500);
        this.subMenubarWidth.set('0%');
      }
    } else {
      this.preventCollapse.set(false);
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: (res: any) => {
        this.router.navigate(['/']);
        this.snackBar.open(res.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error(err.error);
        this.snackBar.open(err.error.message || 'Something went wrong!', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }
}
