import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Para redirigir al registro si es necesario
import { UsuariosService } from '../../../services/usuarios-services/usuarios.service'; // Asegúrate de tener el servicio de usuarios
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, FormsModule], // Agregar CommonModule y FormsModule
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  email: string = '';
  contrasena: string = '';
  cargando: boolean = false;
  error: string = '';
  mostrarContrasena: boolean = false;

  constructor(private usuariosService: UsuariosService, private router: Router) {}

  // Método para iniciar sesión
  iniciarSesion() {
    if (!this.email || !this.contrasena) {
      this.error = 'Por favor complete todos los campos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const usuario = {
      email: this.email.toLowerCase(),
      contrasena: this.contrasena
    };

    // Suponiendo que tu servicio de usuarios tenga un método para autenticar
    this.usuariosService.iniciarSesion(usuario).subscribe({
      next: (respuesta) => {
        console.log('Inicio de sesión exitoso:', respuesta);
        this.cargando = false;
        // Aquí puedes redirigir al usuario a la página principal después de un inicio exitoso
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        this.error = err.error?.detail ?? 'Error al iniciar sesión. Por favor intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  // Método para mostrar/ocultar la contraseña
  togglePasswordVisibility() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }
}