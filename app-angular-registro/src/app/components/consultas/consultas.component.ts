import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

interface Usuario {
  usuario: any;
  nombre: string;
  email: string;
  dni: string;
  fecha_nacimiento: string;
}

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ConsultasComponent implements OnInit {
  tipoBusqueda: string = 'dni';
  terminoBusqueda: string = '';
  usuarios: Usuario[] = [];
  mensajeError: string = '';
  buscando: boolean = false;

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {
  }

  buscar(): void {
    if (!this.terminoBusqueda.trim()) {
      this.mensajeError = 'Por favor, introduce un término de búsqueda';
      return;
    }

    this.mensajeError = '';
    this.buscando = true;
    
    switch (this.tipoBusqueda) {
      case 'dni':
        this.usuariosService.buscarPorDNI(this.terminoBusqueda).subscribe({
          next: (usuario) => {
            this.usuarios = [usuario];
            this.buscando = false;
          },
          error: (error) => {
            this.manejarError(error);
          }
        });
        break;
      
      case 'nombre':
        this.usuariosService.buscarPorNombre(this.terminoBusqueda).subscribe({
          next: (usuarios) => {
            this.usuarios = usuarios;
            this.buscando = false;
          },
          error: (error) => {
            this.manejarError(error);
          }
        });
        break;
      
      case 'email':
        this.usuariosService.buscarPorEmail(this.terminoBusqueda).subscribe({
          next: (usuario) => {
            this.usuarios = [usuario];
            this.buscando = false;
          },
          error: (error) => {
            this.manejarError(error);
          }
        });
        break;
    }
  }

  manejarError(error: any): void {
    this.buscando = false;
    if (error.status === 404) {
      this.mensajeError = 'No se encontraron usuarios con ese criterio';
      this.usuarios = [];
    } else {
      this.mensajeError = 'Error al buscar usuarios: ' + (error.message || 'Error desconocido');
    }
    console.error('Error en la búsqueda:', error);
  }

  limpiarResultados(): void {
    this.usuarios = [];
    this.mensajeError = '';
    this.terminoBusqueda = '';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES');
    } catch {
      return fecha;
    }
  }
}