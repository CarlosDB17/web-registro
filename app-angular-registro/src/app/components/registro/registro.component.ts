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
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    // crear objeto de usuario según la interfaz definida en el servicio
    const usuario = {
      usuario: this.dni, // usando el dni como nombre de usuario
      nombre: this.nombre,
      email: this.email,
      dni: this.dni,
      fecha_nacimiento: this.fechaNacimiento
    };

    this.usuariosService.registrarUsuario(usuario).subscribe({
      next: (respuesta) => {
        console.log('Usuario registrado:', respuesta);
        this.mensaje = 'Usuario registrado correctamente';
        this.limpiarFormulario();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.error = err.error?.message || 'Error al registrar usuario. Por favor intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  limpiarFormulario() {
    this.nombre = '';
    this.email = '';
    this.dni = '';
    this.fechaNacimiento = '';
  }
}