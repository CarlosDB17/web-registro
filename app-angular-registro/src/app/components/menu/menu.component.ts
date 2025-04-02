import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {

  private authservice = inject(AuthService);
  private router = inject(Router);
  currentRoute: string = ''; // variable para almacenar la ruta actual

  ngOnInit(): void {
    this.currentRoute = this.router.url; // ruta inicial
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url; // actualiza la ruta cuando cambia
      }
    });
  }

  logOut(): void {
    this.authservice.logOut()
      .then(() => {
        console.log('Sesión cerrada');
        this.router.navigate(['/auth/log-in']); // redirige al usuario a la página de inicio de sesion
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]); // metodo para manejar la navegacion
  }
}