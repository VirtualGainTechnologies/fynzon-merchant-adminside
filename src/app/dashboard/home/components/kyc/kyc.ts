import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Field, form } from '@angular/forms/signals';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  merge,
  startWith,
  Subscription,
} from 'rxjs';
import { UserService } from '../../../services/user.service';
import { UserKycData, UserKycModel } from '../../../models/userModel';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

interface KycData {
  email: string;
  userName: string;
  businessName: string;
}

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    FormsModule,
    MatTooltipModule,
    NgOptimizedImage,
    Field,
  ],
  templateUrl: './kyc.html',
  styleUrl: './kyc.scss',
  host: {
    '[style.--mat-paginator-container-background-color]': "'transparent'",
  },
})
export class Kyc implements OnInit, AfterViewInit, OnDestroy {
  kycModel = signal<KycData>({
    email: '',
    businessName: '',
    userName: '',
  });
  kycForm = form(this.kycModel);
  kycDetails = signal<any>('');
  pageNumber = signal<number>(1);
  entityType = signal<string>('');
  defaultImage = signal<string>('assets/icons/admin.png');
  selfieImage = signal<string>('');
  modalViewImage = signal<string>('');
  kycList = signal<UserKycData>({
    totalRecords: 0,
    result:[]
  });
  pageSize = signal<number>(5);
  currentPageNumber = signal<number>(1);
  kycView = signal<boolean>(false);
  pageLoader = signal<boolean>(false);
  private filteredKycDataSubject!: Subscription;
  //dependancies
  private snackBar = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);
  private userService = inject(UserService);


  @ViewChild('kycDataPaginator') KycPaginator!: MatPaginator;
  constructor() {}

  ngOnInit(): void {
    this.getUserKycData();
    // this.getFilteredKycDataBasedonFilters();
  }

  ngAfterViewInit() {
    this.initializePagination();
  }

  initializePagination() {
    this.KycPaginator.page.pipe(startWith({})).subscribe(() => {
      this.currentPageNumber.set(this.KycPaginator.pageIndex + 1);
      this.getUserKycData();
    });
  }

  getUserKycData() {
    this.pageLoader.set(true);
    this.userService.getUsersKycData().subscribe({
      next: (res: UserKycModel) => {
        this.pageLoader.set(false);
        this.kycList.set(res.data);
      },
      error: (err: HttpErrorResponse) => {
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

  // getFilteredKycDataBasedonFilters() {
  //   this.filteredKycDataSubject = merge(
  //     this.kycForm.email().valueChanges.pipe(
  //       debounceTime(300),
  //       distinctUntilChanged()
  //     ),
  //     this.KycData.get('fullName')!.valueChanges.pipe(
  //       debounceTime(300),
  //       distinctUntilChanged()
  //     ),
  //     this.KycData.get('businessName')!.valueChanges.pipe(
  //       debounceTime(300),
  //       distinctUntilChanged()
  //     )
  //   ).subscribe(() => {
  //     this.filterKycData();
  //   });
  // }

  clearFilter() {
    this.kycForm().reset();
  }

  filterKycData() {
    if (this.KycPaginator) {
      this.KycPaginator.pageIndex = 0;
    }
    const filters: KycData = {
      email: this.kycForm.email().value(),
      userName: this.kycForm.userName().value(),
      businessName: this.kycForm.businessName().value(),
    };
    // this.store.dispatch(
    //   userActions.updateKycFilteredData({
    //     filters,
    //   })
    // );
  }

  cancelKycView() {
    this.kycView.update((value) => !value);
    this.cd.detectChanges();
    this.initializePagination();
  }

  viewKycDetails(kycData: any) {
    this.kycView.update((value) => !value);
    this.entityType.set(kycData.merchant_type);
    this.kycDetails.set(kycData);
  }

  //pagination
  gotoPage() {
    if (this.pageNumber() < 1) {
      return null;
    } else if (this.pageNumber() > Math.ceil(this.KycPaginator.length / this.pageSize())) {
      return null;
    } else {
      this.KycPaginator.pageIndex = this.pageNumber() - 1;
      this.currentPageNumber.set(this.KycPaginator.pageIndex + 1);
      return null;
      // this.store.dispatch(
      //   userActions.updateKycPaginationData({ page: this.pageNumber })
      // );
    }
  }

  gotoFirstorLastPage(page: number, totalRecords: number) {
    if (page == 1) {
      this.pageNumber.set(page);
      this.KycPaginator.pageIndex = page - 1;
      this.currentPageNumber.set(this.KycPaginator.pageIndex + 1);
      // this.store.dispatch(userActions.updateKycPaginationData({ page: page }));
    } else {
      this.KycPaginator.pageIndex = Math.ceil(totalRecords / this.pageSize()) - 1;
      this.pageNumber.set(this.KycPaginator.pageIndex + 1);
      this.currentPageNumber.set(this.KycPaginator.pageIndex + 1);
      // this.store.dispatch(
      //   userActions.updateKycPaginationData({
      //     page: this.KycPaginator.pageIndex + 1,
      //   })
      // );
    }
  }

  onViewImage(previewImage: string) {
    this.modalViewImage.set(previewImage);
  }

  ngOnDestroy() {
    this.kycForm().reset();
    this.filterKycData();
    // this.filteredKycDataSubject.unsubscribe();
  }
}
