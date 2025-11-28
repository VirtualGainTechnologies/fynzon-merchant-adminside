import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlatformBrowserService } from '../../shared/services/platform-browser.service';

@Injectable({
  providedIn: 'root',
})
export class DataTransferService {
  private localStorage = inject(PlatformBrowserService);
  initialData = this.localStorage.getItem('subAdminData');
  private data: any = new BehaviorSubject(this.initialData);
  public subAdminDetails: Observable<any> = this.data.asObservable();

  constructor() {}

  setData(subAdminData: any) {
    this.localStorage.setItem('subAdminData', subAdminData);
    this.data.next(subAdminData);
  }
}
