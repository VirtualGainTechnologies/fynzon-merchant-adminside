import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewChecked,
  ChangeDetectorRef,
  signal,
} from '@angular/core';

import {
  debounceTime,
  distinctUntilChanged,
  merge,
  startWith,
  Subscription,
} from 'rxjs';

import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';


import { MatTooltipModule } from '@angular/material/tooltip';
import { form } from '@angular/forms/signals';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IpsData, UpdateMerchantPayload } from '../../../types/updateMerchantPayload';
import { MerchantData, MerchantModel, MerchantTypeData } from '../../../models/userModel';
import { HttpErrorResponse } from '@angular/common/http';

interface merchantData {
  email: string;
  businessName: string;
  userName: string;
}


@Component({
  selector: 'app-merchant',
  standalone: true,
  templateUrl: './merchant.html',
  styleUrls: ['./merchant.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  providers: [],
})
export class Merchant implements OnInit, AfterViewInit, OnDestroy {
  merchantModel = signal<merchantData>({
    email: "",
    userName: "",
    businessName: ""
  });
  pageNumber= signal<number>(1);
  pageLoader = signal<boolean>(false);
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  merchantFilterForm = form(this.merchantModel);
  manageMerchantData: FormGroup | any;
  merchantFormView= signal<boolean>(false);
  blockedStatus= signal<string[]>(['ACTIVE', 'BLOCKED']);
  status= signal<string[]> (['PENDING', 'PROCESSING', 'ACTIVE', 'BLOCKED']);
  selctedMerchant = signal<MerchantData | null>(null);
  merchantList = signal<MerchantTypeData >({
    totalRecords: 0,
    result:[]
  });
  testAPIs:any[]=[];
  liveAPIS: any[]=[];
  private merchantFilterSubject!: Subscription;

  //dependancies
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('merchantPagination') Paginator!: MatPaginator;
  constructor() {}

  ngOnInit(): void {
    this.createManageMerchantDataForm();
    this.getMerchnatData();
    this.getFilteredMerchantDataBasedonFilters();
  }

  ngAfterViewInit() {
    this.initializePagination();
  }


  createManageMerchantDataForm() {
    this.manageMerchantData = this.fb.group({
      _id: [''],
      merchantStatus: [''],
      liveOnboardingEnabled: [''],
      testapikey: [''],
      liveapikey: [''],
      testips: this.fb.group({}),
      liveips: this.fb.group({}),
    });
  }

  initializePagination() {
    this.Paginator.page.pipe(startWith({})).subscribe(() => {
      this.currentPage.set(this.Paginator.pageIndex + 1);
      // this.store.dispatch(
      //   userActions.updateMerchantPaginatedData({
      //     page: this.Paginator.pageIndex + 1,
      //   })
      // );
    });
  }
  getMerchnatData() {
   this.pageLoader.set(true);
    this.userService.getMerchantData().subscribe({
      next: (res:MerchantModel) => {
        this.pageLoader.set(false);
        this.merchantList.set(res.data);
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

  getFilteredMerchantDataBasedonFilters() {
    // this.merchantFilterSubject = merge(
    //   this.merchantFilterForm.email().value()!.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    //   this.merchantData
    //     .get('fullName')!
    //     .valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    //   this.merchantData
    //     .get('businessName')!
    //     .valueChanges.pipe(debounceTime(300), distinctUntilChanged())
    // ).subscribe(() => {
    //   this.filterData();
    // });
  }

  // filterout the data based on current filters

  filterData() {
    if (this.Paginator) {
      this.Paginator.pageIndex = 0;
    }

    const filters = {
      email: this.merchantFilterForm.email().value(),
      full_name: this.merchantFilterForm.userName().value(),
      business_name: this.merchantFilterForm.businessName().value(),
    };
    // this.store.dispatch(userActions.updateMerchantFilteredData({ filters }));
  }

  // clearing all filters
  clearFilter() {
    this.merchantFilterForm().reset();
  }

  // manage data for updating form
  manageData(merchantData: MerchantData) {
    this.selctedMerchant.set(merchantData);
    this.merchantFormView.update((value)=> !value);
    this.testAPIs = merchantData?.user_api_setting_id?.test_ip;
    this.liveAPIS = merchantData?.user_api_setting_id?.live_ip;
    this.manageMerchantData.get('_id').patchValue(merchantData?._id);
    merchantData?.is_blocked
      ? this.manageMerchantData.get('merchantStatus').patchValue('BLOCKED')
      : this.manageMerchantData.get('merchantStatus').patchValue('ACTIVE');
    this.manageMerchantData
      .get('liveOnboardingEnabled')
      .patchValue(merchantData?.live_onboarding_enabled);
    this.manageMerchantData
      .get('testapikey')
      .patchValue(merchantData?.user_api_setting_id?.test_api_key?.status);
    this.manageMerchantData
      .get('liveapikey')
      .patchValue(merchantData?.user_api_setting_id?.live_api_key?.status);

    this.testAPIs.forEach((item) => {
      const key = item.ip_address.toString();
      this.testIps.addControl(key, new FormControl(item.status));
    });

    this.liveAPIS.forEach((item) => {
      const key = item.ip_address.toString();
      this.liveIps.addControl(key, new FormControl(item.status));
    });
  }

  //back to listing
  cancelUpdate() {
    this.merchantFormView.update((value)=> !value);
    this.manageMerchantData.reset();
    this.getLiveIpsKeys().forEach((key) => {
      this.liveIps.removeControl(key);
    });
    this.getTestIpsKeys().forEach((key) => {
      this.testIps.removeControl(key);
    });
    this.cd.detectChanges();
    this.initializePagination();
  }

  //get all testIps if available
  get testIps(): FormGroup {
    return this.manageMerchantData.get('testips') as FormGroup;
  }

  getTestIpsKeys(): string[] {
    return Object.keys(this.testIps.controls);
  }

  //get all live ips if available
  get liveIps(): FormGroup {
    return this.manageMerchantData.get('liveips') as FormGroup;
  }

  getLiveIpsKeys(): string[] {
    return Object.keys(this.liveIps.controls);
  }

  //pagination start
  gotoPage() {
    if (this.pageNumber() < 1) {
      return null;
    } else if (
      this.pageNumber() > Math.ceil(this.Paginator.length / this.pageSize())
    ) {
      return null;
    } else {
      this.Paginator.pageIndex = this.pageNumber() - 1;
      this.currentPage = this.pageNumber;
      return null;
      // this.store.dispatch(
      //   userActions.updateMerchantPaginatedData({ page: this.pageNumber })
      // );
    }
  }

  gotoFirstPageOrLastPage(pageNumber: number, totalRecords: number) {
    if (pageNumber == 1) {
      this.Paginator.pageIndex = pageNumber - 1;
      this.pageNumber.set(pageNumber) ;
      this.currentPage.set(this.Paginator.pageIndex + 1);
      // this.store.dispatch(
      //   userActions.updateMerchantPaginatedData({ page: pageNumber })
      // );
    } else {
      this.Paginator.pageIndex = Math.ceil(totalRecords / this.pageSize()) - 1;
      this.pageNumber.set(this.Paginator.pageIndex + 1);
      this.currentPage.set( this.Paginator.pageIndex + 1);
      // this.store.dispatch(
      //   userActions.updateMerchantPaginatedData({
      //     page: this.Paginator.pageIndex + 1,
      //   })
      // );
    }
  }

  //update the merchant data form
  onUpdate() {
    this.pageLoader.set(true);
    const {
      _id,
      merchantStatus,
      liveOnboardingEnabled,
      testapikey,
      liveapikey,
      testips,
      liveips,
    } = this.manageMerchantData.value;
    let testIpsData!: IpsData[];
    let liveIpsData!: IpsData[];
    if (testips) {
      testIpsData = Object.entries(testips).map(([ip, status]) => ({
        mode: 'TEST',
        ip,
        status: String(status),
      }));
    }

    if (liveips) {
      liveIpsData = Object.entries(liveips).map(([ip, status]) => ({
        mode: 'LIVE',
        ip,
        status: String(status),
      }));
    }
    const payload: UpdateMerchantPayload = {
      merchantStatus,
      liveOnboardingEnabled,
      ips: [...testIpsData, ...liveIpsData],
      apiKeys: [
        {
          ...(testapikey && {
            mode: 'TEST',
            status: testapikey,
          }),
        },
        {
          ...(liveapikey && {
            mode: 'LIVE',
            status: liveapikey,
          }),
        },
      ],
    };

    this.userService.updateMerchantData(payload, _id).subscribe({
      next: (res: any) => {
        this.pageLoader.set(false);
        const response = JSON.parse(JSON.stringify(res));
      

          // const updatedMerchant: Update<MerchantData> = {
          //   id: response.data._id!,
          //   changes: { ...response.data },
          // };
          // this.store.dispatch(
          //   userActions.updateMerchantData({
          //     updateMerchant: updatedMerchant,
          //   })
          // );
          this.cancelUpdate();
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

  //on destroy variables and unsubscribing subject
  ngOnDestroy() {
    this.clearFilter();
    this.filterData();
    // this.merchantFilterSubject.unsubscribe();
  }
}
