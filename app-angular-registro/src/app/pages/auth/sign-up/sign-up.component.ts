import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios-services/usuarios.service';
import { AuthService, Credential } from '../../../services/auth-services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  nombre: string = '';
  email: string = '';
  password: string = '';
  documento_identidad: string = ''; // cambiado de dni a documentoIdentidad
  fechaNacimiento: string = '';
  mensaje: string = '';
  error: string = '';
  cargando: boolean = false;

  constructor(private usuariosService: UsuariosService) {}
  private authService = inject(AuthService);

  registrarUsuario() {
    if (!this.nombre || !this.email || !this.documento_identidad || !this.fechaNacimiento) { // cambiado dni a documentoIdentidad
      this.error = 'Por favor complete todos los campos';

      // reinicia la clase shake para que la animación se reproduzca nuevamente
      this.activarShake();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    const usuario = {
      usuario: this.documento_identidad, // usando documento_identidad como nombre de usuario / clave primaria
      nombre: this.nombre,
      email: this.email.toLowerCase(),
      password: this.password,
      documento_identidad: this.documento_identidad.toUpperCase(), // cambiado dni a documento_identidad
      fecha_nacimiento: this.fechaNacimiento,
      mensaje: ''
    };

    const credential : Credential = {
      email: usuario.email || '',
      password: usuario.password || ''
    };

    this.authService.signUpWithEmailAndPassword(credential);
    console.log('Usuario a registrar:', usuario);
    console.log('Credenciales:', credential);
    console.log('UsuarioService:', this.usuariosService);

    const UserCredential = this.usuariosService.registrarUsuario(usuario).subscribe({
      next: (respuesta) => {
        console.log('UserCredential:', UserCredential);
        console.log('Usuario registrado:', respuesta);
        this.mensaje = (respuesta as any)?.mensaje || 'Usuario registrado correctamente';
        this.limpiarFormulario();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.error = err.error?.detail ?? 'Error al registrar usuario. Por favor intente nuevamente.';
        this.cargando = false;

        // reinicia la clase shake para que la animación se reproduzca nuevamente
        this.activarShake();
      }
    });
  }

  activarShake() {
    const formElement = document.querySelector('.registro-form');
    if (formElement) {
      formElement.classList.remove('shake'); // elimina la clase si ya existe
      void (formElement as HTMLElement).offsetWidth; // fuerza el reflujo para reiniciar la animación
      formElement.classList.add('shake'); // agrega la clase nuevamente
    }
  }

  limpiarFormulario() {
    this.nombre = '';
    this.email = '';
    this.documento_identidad = ''; // cambiado dni a documento_identidad
    this.fechaNacimiento = '';
    this.password = '';
  }


}
