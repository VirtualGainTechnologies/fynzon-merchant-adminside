import { Routes } from '@angular/router';
import { Subadmin } from './components/subadmin/subadmin';
import { AddSubadmin } from './components/add-admin/add-subadmin';
import { Kyc } from './components/kyc/kyc';
import { Merchant } from './components/merchant/merchant';

export const homeRoutes: Routes = [
  {
    path: '',
    component: Subadmin,
  },
  { path: 'addSubadmin', component: AddSubadmin },
  { path: "kyc", component: Kyc },
  {path:"merchant", component:Merchant}
];
