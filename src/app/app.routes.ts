import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./auth/auth.routes').then((route) => route.authRoutes) },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((route) => route.dashboardRoutes),
  },
];
