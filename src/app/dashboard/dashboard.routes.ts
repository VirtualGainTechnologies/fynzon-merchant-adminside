import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.routes').then((routes) => routes.homeRoutes),
      },
    ],
  },
];
