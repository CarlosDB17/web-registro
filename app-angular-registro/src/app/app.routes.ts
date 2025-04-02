import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard], // Protege la ruta raíz
    loadComponent: () => import('./pages/home/home.component').then(m => m.default),
    children: [
      {
        path: '',
        redirectTo: 'listado', // Redirige automáticamente a /listado
        pathMatch: 'full',
      },
      {
        path: 'registro',
        loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent),
      },
      {
        path: 'listado',
        loadComponent: () => import('./components/listado-usuarios/listado-usuarios.component').then(m => m.ListadoUsuariosComponent),
      },
      {
        path: 'qr',
        loadComponent: () => import('./components/qr-scanner/qr-scanner.component').then(m => m.QrScannerComponent),
      },
      {
        path: 'consultas',
        loadComponent: () => import('./components/consultas/consultas.component').then(m => m.ConsultasComponent),
      },
    ],
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
  {
    path: '**',
    redirectTo: '', // Redirige a la página principal si la ruta no existe
  },
];