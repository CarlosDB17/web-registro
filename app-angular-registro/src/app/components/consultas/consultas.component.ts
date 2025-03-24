import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

interface Usuario {
  usuario: any;
  nombre: string;
  email: string;
  documento_identidad: string; // Cambiado de dni a documento_identidad
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
  tipoBusqueda: string = 'documento_identidad'; // Cambiado de dni a documento_identidad
  terminoBusqueda: string = ''; // termino ingresado para buscar
  usuarios: Usuario[] = []; // lista de usuarios encontrados
  mensajeError: string = ''; // mensaje de error
  buscando: boolean = false; // indica si se esta buscando

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {
    // metodo que se ejecuta al inicializar el componente
  }

  buscar(): void {
    // realiza la busqueda segun el tipo seleccionado
    if (!this.terminoBusqueda.trim()) {
      this.mensajeError = 'por favor, introduce un termino de busqueda';
      return;
    }

    this.mensajeError = '';
    this.buscando = true;
    
    const terminoBusquedaMayusculas = this.terminoBusqueda.toUpperCase();

    switch (this.tipoBusqueda) {
      case 'documento_identidad': // Cambiado de dni a documento_identidad
        // busca usuario por documento_identidad
        this.usuariosService.buscarPorDocumentoIdentidad(terminoBusquedaMayusculas).subscribe({
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
        // busca usuarios por nombre
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
        // busca usuarios por email
        this.usuariosService.buscarPorEmail(this.terminoBusqueda).subscribe({
          next: (usuarios) => {
            console.log('respuesta del servicio:', usuarios); 
            this.usuarios = Array.isArray(usuarios) ? usuarios : [usuarios]; // asegura que siempre sea un array
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
    // maneja los errores de la busqueda
    this.buscando = false;

    if (error.status === 404 || (error.status === 500 && error.error?.detail?.includes('404'))) {
      this.mensajeError = 'no se encontraron usuarios con ese criterio';
      this.usuarios = [];
    } else {
      this.mensajeError = 'error al buscar usuarios: ' + (error.message || 'error desconocido');
    }

    console.error('error en la busqueda:', error);
  }

  limpiarResultados(): void {
    // limpia los resultados de la busqueda
    this.usuarios = [];
    this.mensajeError = '';
    this.terminoBusqueda = '';
  }

  limpiarTerminoBusqueda() {
    // limpia el termino de busqueda y los resultados
    this.terminoBusqueda = '';
    this.usuarios = [];
    this.mensajeError = '';
  }
  

  formatearFecha(fecha: string): string {
    // formatea una fecha en formato legible
    if (!fecha) return 'n/a';
    
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES');
    } catch {
      return fecha;
    }
  }
}