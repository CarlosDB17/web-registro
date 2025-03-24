// registro.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service'; 

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  nombre: string = '';
  email: string = '';
  dni: string = '';
  fechaNacimiento: string = '';
  mensaje: string = '';
  error: string = '';
  cargando: boolean = false;

  constructor(private usuariosService: UsuariosService) {}

  registrarUsuario() {
    if (!this.nombre || !this.email || !this.dni || !this.fechaNacimiento) {
      this.error = 'Por favor complete todos los campos';

      // reinicia la clase shake para que la animacion se reproduzca nuevamente
      this.activarShake();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    const usuario = {
      usuario: this.dni, // usando el dni como nombre de usuario
      nombre: this.nombre,
      email: this.email.toLowerCase(),
      dni: this.dni.toUpperCase(),
      fecha_nacimiento: this.fechaNacimiento,
      mensaje: ''
    };

    this.usuariosService.registrarUsuario(usuario).subscribe({
      next: (respuesta) => {
        console.log('Usuario registrado:', respuesta);
        this.mensaje = (respuesta as any)?.mensaje || 'Usuario registrado correctamente';
        this.limpiarFormulario();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.error = err.error?.detail ?? 'Error al registrar usuario. Por favor intente nuevamente.';
        this.cargando = false;

        // reinicia la clase shake para que la animacion se reproduzca nuevamente
        this.activarShake();
      }
    });
  }

  activarShake() {
    const formElement = document.querySelector('.registro-form');
    if (formElement) {
      formElement.classList.remove('shake'); // elimina la clase si ya existe
      void (formElement as HTMLElement).offsetWidth; // fuerza el reflujo para reiniciar la animacion
      formElement.classList.add('shake'); // agrega la clase nuevamente
    }
  }

  limpiarFormulario() {
    this.nombre = '';
    this.email = '';
    this.dni = '';
    this.fechaNacimiento = '';
  }
}