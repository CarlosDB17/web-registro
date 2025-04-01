import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios-services/usuarios.service';

interface Usuario {
  usuario: any;
  nombre: string;
  email: string;
  documento_identidad: string;
  fecha_nacimiento: string;
  foto?: string; // Nuevo campo opcional para la foto
}

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ConsultasComponent implements OnInit {
  tipoBusqueda: string = 'documento_identidad';
  terminoBusqueda: string = '';
  usuarios: Usuario[] = [];
  mensajeError: string = '';
  buscando: boolean = false;

  // Variables de paginación
  skip: number = 0;
  limit: number = 3;
  totalUsuarios: number = 0;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {}

  buscar(): void {
    if (!this.terminoBusqueda.trim()) {
      this.mensajeError = 'Por favor, introduce un término de búsqueda';
      return;
    }

    this.mensajeError = '';
    this.buscando = true;

    const terminoBusquedaMayusculas = this.terminoBusqueda.toUpperCase();

    switch (this.tipoBusqueda) {
      case 'documento_identidad':
        this.usuariosService.buscarPorDocumentoIdentidad(terminoBusquedaMayusculas, this.skip, this.limit).subscribe({
          next: (response) => {
            this.usuarios = response.usuarios;
            this.totalUsuarios = response.total; // Total de usuarios devuelto por la API
            this.buscando = false;
          },
          error: (error) => {
            this.manejarError(error);
          }
        });
        break;

      case 'nombre':
        this.usuariosService.buscarPorNombre(this.terminoBusqueda, this.skip, this.limit).subscribe({
          next: (response) => {
            this.usuarios = response.usuarios;
            this.totalUsuarios = response.total; // Total de usuarios devuelto por la API
            this.buscando = false;
          },
          error: (error) => {
            this.manejarError(error);
          }
        });
        break;

      case 'email':
        this.usuariosService.buscarPorEmail(this.terminoBusqueda, this.skip, this.limit).subscribe({
          next: (response) => {
            this.usuarios = response.usuarios;
            this.totalUsuarios = response.total; // Total de usuarios devuelto por la API
            this.buscando = false;
          },
          error: (error) => {
            this.manejarError(error);
          }
        });
        break;
    }
  }

  // Método para calcular el total de páginas
  getTotalPaginas(): number {
    return Math.ceil(this.totalUsuarios / this.limit);
  }

  // Método para cambiar de página
  cambiarPagina(direccion: number): void {
    const nuevoSkip = this.skip + direccion * this.limit;
    if (nuevoSkip >= 0 && nuevoSkip < this.totalUsuarios) {
      this.skip = nuevoSkip;
      this.buscar(); // Realiza la búsqueda nuevamente con la nueva página
    }
  }

  manejarError(error: any): void {
    this.buscando = false;

    if (error.status === 404 || (error.status === 500 && error.error?.detail?.includes('404'))) {
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

  limpiarTerminoBusqueda(): void {
    this.terminoBusqueda = '';
    this.usuarios = [];
    this.mensajeError = '';
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