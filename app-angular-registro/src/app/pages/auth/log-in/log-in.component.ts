import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios-services/usuarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-services/auth.service';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  email: string = '';
  contrasena: string = '';
  cargando: boolean = false;
  error: string = '';
  mostrarContrasena: boolean = false;

  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private authService = inject(AuthService);

  /*
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

    this.usuariosService.iniciarSesion(usuario).subscribe({
      next: (respuesta) => {
        console.log('Inicio de sesión exitoso:', respuesta);
        this.cargando = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        this.error = err.error?.detail ?? 'Error al iniciar sesión. Por favor intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  */

  // Método para mostrar/ocultar la contraseña
  togglePasswordVisibility() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  async logIn(): Promise<void> {
    if (!this.email || !this.contrasena) {
      this.error = 'Por favor complete todos los campos';
      return;
    }

    try {
      this.cargando = true;
      const credential = {
        email: this.email.toLowerCase(),
        password: this.contrasena
      };

      // Utiliza el método de autenticación del servicio de autenticación
      const resultado = await this.authService.logInWithEmailAndPassword(credential);
      
      // Maneja el resultado del inicio de sesión
      if (resultado) {
        this.router.navigate(['/']);
      } else {
        this.error = 'Credenciales inválidas';
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Manejo de errores más específico
      if (error instanceof Error) {
        this.error = error.message || 'Error al iniciar sesión. Por favor intente nuevamente.';
      } else {
        this.error = 'Error al iniciar sesión. Por favor intente nuevamente.';
      }
    } finally {
      this.cargando = false;
    }
  }
}