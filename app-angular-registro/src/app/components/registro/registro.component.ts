import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  registrarUsuario() {
    console.log('Registrando usuario:', {
      nombre: this.nombre,
      email: this.email,
      dni: this.dni,
      fechaNacimiento: this.fechaNacimiento
    });
    alert('Registro exitoso!');
  }
}
