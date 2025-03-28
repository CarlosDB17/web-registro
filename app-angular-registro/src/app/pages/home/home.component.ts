import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from '../../components/registro/registro.component';
import { ListadoUsuariosComponent } from '../../components/listado-usuarios/listado-usuarios.component';
import { ConsultasComponent } from '../../components/consultas/consultas.component';
import { FormsModule } from '@angular/forms';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';
import { AuthService } from '../../services/auth-services/auth.service';
import { Router } from '@angular/router';
// importa el servicio router para manejar la navegacion

@Component({
  selector: 'app-home',
  // define el selector del componente
  standalone: true,
  // indica que el componente es independiente
  imports: [CommonModule, RouterOutlet, RegistroComponent, ListadoUsuariosComponent, ConsultasComponent, FormsModule, QrScannerComponent], 
  // define los modulos y componentes que se importan en este componente
  templateUrl: './home.component.html',
  // define la ruta del archivo html del componente
  styleUrls: ['./home.component.scss']
  // define la ruta del archivo de estilos del componente
})
export default class HomeComponent {
  // define la clase del componente home

  private authservice = inject(AuthService);
  // inyecta el servicio de autenticacion
  private router = inject(Router);
  // inyecta el servicio router

  

  logOut(): void {
    // metodo para cerrar sesion
    this.authservice.logOut()
      .then(() => {
        console.log('sesion cerrada');
        // muestra un mensaje en consola al cerrar sesion
        this.router.navigate(['/auth/log-in']);
        // redirige al usuario a la pagina de inicio de sesion
      })
      .catch((error) => {
        console.error('error al cerrar sesion:', error);
        // muestra un mensaje de error en consola si falla el cierre de sesion
      });    
  }

  title = 'app-angular-registro';
  // define el titulo de la aplicacion

  seccionActual: string = 'registro';
  // define la seccion actual por defecto
  camaraActiva: boolean = false; // Indica si la cámara está activa

  mostrarSeccion(seccion: string): void {
    // metodo para cambiar de seccion
    console.log('cambiando a:', seccion); 
    // muestra en consola la seccion a la que se cambia
    this.seccionActual = seccion;
    // actualiza la seccion actual

    // Si la sección activa es "registro", verifica si la cámara está activa
    if (seccion === 'registro') {
      this.camaraActiva = false; // Por defecto, la cámara no está activa
    }
  }

  activarCamara(): void {
    this.camaraActiva = true; // Activa la cámara
  }

  desactivarCamara(): void {
    this.camaraActiva = false; // Desactiva la cámara
  }
}
