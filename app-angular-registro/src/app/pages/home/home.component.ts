import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-services/auth.service';
import { Router } from '@angular/router';
import { MenuComponent } from '../../components/menu/menu.component'; // Importa MenuComponent


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenuComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export default class HomeComponent {
  private authservice = inject(AuthService);
  private router = inject(Router);

  camaraActiva: boolean = false; // Indica si la cámara está activa

  logOut(): void {
    this.authservice.logOut()
      .then(() => {
        console.log('Sesión cerrada');
        this.router.navigate(['/auth/log-in']); // Redirige al usuario a la página de inicio de sesión
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  }

  activarCamara(): void {
    this.camaraActiva = true; // Activa la cámara
    console.log('Cámara activada');
  }

  desactivarCamara(): void {
    this.camaraActiva = false; // Desactiva la cámara
    console.log('Cámara desactivada');
  }
}
