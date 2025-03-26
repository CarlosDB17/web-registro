import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-services/auth.service';
import { map, Observable } from 'rxjs';

export const authGuard: CanActivateFn = (): Observable<boolean> => {
  // define un guard llamado authGuard que verifica si el usuario esta autenticado
  const router = inject(Router); 
  // inyecta el servicio Router
  const authService = inject(AuthService); 
  // inyecta el servicio AuthService

  return authService.authState$.pipe(
    // devuelve un observable que verifica el estado de autenticacion del usuario
    map((user) => {
      // mapea el estado de autenticacion
      if (!user) {
        // si no hay usuario autenticado
        router.navigate(['/auth/log-in']);
        // redirige al usuario a la pagina de inicio de sesion
        return false;
        // devuelve false indicando que no puede acceder
      }
      return true;
      // devuelve true indicando que puede acceder
    })
  );
};

export const publicGuard: CanActivateFn = (): Observable<boolean> => {
  // define un guard llamado publicGuard que verifica si el usuario no esta autenticado
  const router = inject(Router); 
  // inyecta el servicio Router
  const authService = inject(AuthService); 
  // inyecta el servicio AuthService

  return authService.authState$.pipe(
    // devuelve un observable que verifica el estado de autenticacion del usuario
    map((user) => {
      // mapea el estado de autenticacion
      if (user) {
        // si hay un usuario autenticado
        router.navigate(['/']);
        // redirige al usuario a la pagina principal
        return false;
        // devuelve false indicando que no puede acceder
      }
      return true;
      // devuelve true indicando que puede acceder
    })
  );
};