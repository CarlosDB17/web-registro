import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios-services/usuarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-services/auth.service';

@Component({
  selector: 'app-log-in',
  // define el selector del componente
  standalone: true,
  // indica que el componente es independiente
  imports: [CommonModule, FormsModule],
  // define los modulos que se importan en este componente
  templateUrl: './log-in.component.html',
  // define la ruta del archivo html del componente
  styleUrl: './log-in.component.scss'
  // define la ruta del archivo de estilos del componente
})
export class LogInComponent {
  // define la clase del componente log in

  email: string = '';
  // define la propiedad email para almacenar el correo del usuario
  contrasena: string = '';
  // define la propiedad contrasena para almacenar la contrasena del usuario
  cargando: boolean = false;
  // define la propiedad cargando para indicar si hay una operacion en curso
  error: string = '';
  // define la propiedad error para almacenar mensajes de error
  mostrarContrasena: boolean = false;
  // define la propiedad mostrarContrasena para alternar la visibilidad de la contrasena

  private usuariosService = inject(UsuariosService);
  // inyecta el servicio de usuarios
  private router = inject(Router);
  // inyecta el servicio router
  private authService = inject(AuthService);
  // inyecta el servicio de autenticacion

  // metodo para mostrar u ocultar la contrasena
  togglePasswordVisibility() {
    this.mostrarContrasena = !this.mostrarContrasena;
    // alterna el valor de mostrarContrasena
  }

  // metodo asincrono para iniciar sesion
  async logIn(): Promise<void> {
    if (!this.email || !this.contrasena) {
      // verifica si los campos email o contrasena estan vacios
      this.error = 'Por favor complete todos los campos';
      // asigna un mensaje de error si los campos estan vacios
      return;
    }

    try {
      this.cargando = true;
      // establece cargando en true para indicar que la operacion esta en curso
      const credential = {
        email: this.email.toLowerCase(),
        // convierte el email a minusculas
        password: this.contrasena
        // asigna la contrasena
      };

      // utiliza el metodo de autenticacion del servicio de autenticacion
      const resultado = await this.authService.logInWithEmailAndPassword(credential);
      // espera el resultado del inicio de sesion

      if (resultado) {
        // verifica si el inicio de sesion fue exitoso
        this.router.navigate(['/']);
        // redirige al usuario a la pagina principal
      } else {
        this.error = 'Credenciales invalidas';
        // asigna un mensaje de error si las credenciales son invalidas
      }
    } catch (error) {
      console.error('Error al iniciar sesion:', error);
      // muestra un mensaje de error en consola si ocurre un error

      if (error instanceof Error) {
        // verifica si el error es una instancia de Error
        this.error = error.message || 'Error al iniciar sesion. Por favor intente nuevamente.';
        // asigna el mensaje del error o un mensaje generico
      } else {
        this.error = 'Error al iniciar sesion. Por favor intente nuevamente.';
        // asigna un mensaje generico si el error no es una instancia de Error
      }
    } finally {
      this.cargando = false;
      // establece cargando en false para indicar que la operacion ha terminado
    }
  }
}