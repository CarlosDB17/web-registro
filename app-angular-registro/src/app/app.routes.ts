import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.default),
    canActivate: [authGuard], // Protege esta ruta con authGuard
  },
  {
    path: 'auth',
    children: [
      {
        path: 'sign-up',
        loadComponent: () => import('./pages/auth/sign-up/sign-up.component').then(m => m.SignUpComponent),
        canActivate: [publicGuard], // Protege esta ruta con publicGuard
      },
      {
        path: 'log-in',
        loadComponent: () => import('./pages/auth/log-in/log-in.component').then(m => m.LogInComponent),
        canActivate: [publicGuard], // Protege esta ruta con publicGuard
      },
    ],
  },
];