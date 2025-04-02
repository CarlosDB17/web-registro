import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

    private authservice = inject(AuthService);
    private router = inject(Router);

  logOut(): void {
    this.authservice.logOut()
      .then(() => {
        console.log('Sesión cerrada');
        this.router.navigate(['/auth/log-in']); // redirige al usuario a la página de inicio de sesión
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]); // metodo para manejar la navegación
  }
}