import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';

import { Field, form, required, submit } from '@angular/forms/signals';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, startWith, Subscription } from 'rxjs';
import { SubAdminModel } from '../../../models/subadminModel';
import { UserService } from '../../../services/user.service';
import { PlatformBrowserService } from '../../../../shared/services/platform-browser.service';
import { FormsModule } from '@angular/forms';
import { DataTransferService } from '../../../services/dataTransfer.service';

interface SubadminData {
  role: string;
  email: string;
}

@Component({
  selector: 'app-subadmin',
  standalone: true,
  imports: [Field, CommonModule, MatPaginatorModule, RouterModule, FormsModule],
  templateUrl: './subadmin.html',
  styleUrl: './subadmin.scss',
})
export class Subadmin implements OnInit, AfterViewInit {
  subAdminModel = signal<SubadminData>({
    email: '',
    role: 'ALL',
  });

  subadminForm = form(this.subAdminModel, (fieldPath) => {
    required(fieldPath.role);
  });
  pageLoader = signal<boolean>(false);

  pageNumber = signal<number>(0);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(5);
  roles = signal<string[]>(['ALL', 'SUB-ADMIN-LEVEL-1', 'SUB-ADMIN-LEVEL-2', 'SUB-ADMIN-LEVEL-3']);
  private filterDataBasedonEmailSubject!: Subscription;
  subAdminList = signal<any | null>(null);
  //dependancies
  private userService = inject(UserService);
  private platform = inject(PlatformBrowserService);

  private DataService = inject(DataTransferService);

  @ViewChild('subAdminPagination') subAdminPaginator!: MatPaginator;

  constructor() {}

  ngOnInit(): void {
    if (this.platform.isBrowser) {
      this.pageLoader.set(true);
      combineLatest({
        subadmin: this.userService.getSubAdminData(),
      }).subscribe((res) => {
        this.subAdminList.set(res.subadmin.data);
        console.log(this.subAdminList());
        this.pageLoader.set(false);
      });
    }
  }

  ngAfterViewInit() {
    // this.subAdminPaginator.page.pipe(startWith({})).subscribe(() => {
    // });
  }

  filterData() {
    this.subAdminPaginator.pageIndex = 0;
    const filters = {
      role: this.subadminForm.role().value(),
      email: this.subadminForm.role().value(),
    };
  }

  clearFilter() {
    this.subadminForm.email().value.set('');
    this.subadminForm.role().value.set('ALL');
    this.filterData();
  }

  TransferData(data: any) {
    this.DataService.setData(data);
  }

  //pagination start
  gotoPage() {
    if (this.pageNumber() == 0) {
      return null;
    } else {
      this.subAdminPaginator.pageIndex = this.pageNumber() - 1;
      return null;
    }
  }

  gotoFirstPageOrLastPage(page: number, totalRecords: number) {
    if (page == 1) {
      this.subAdminPaginator.pageIndex = page - 1;
    } else {
      this.subAdminPaginator.pageIndex = Math.ceil(totalRecords / this.pageSize()) - 1;
    }
  }

  ngOnDestroy() {
    this.clearFilter();
    // this.filterDataBasedonEmailSubject.unsubscribe();
  }
}
