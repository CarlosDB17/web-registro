import { Component } from '@angular/core';
import { UsuariosService } from '../../services/usuarios-services/usuarios.service';
import * as Papa from 'papaparse';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-csv',
  standalone: true,
  imports: [NgIf, MatTableModule, MatButtonModule],
  templateUrl: './csv.component.html',
  styleUrls: ['./csv.component.scss']
})
export class CsvComponent {
  usuarios: any[] = [];
  usuariosPaginados: any[] = [];
  displayedColumns: string[] = ['nombre', 'email', 'documento_identidad', 'fecha_nacimiento'];

  // variables para la paginacion
  paginaActual: number = 0;
  limitePorPagina: number = 3;

  constructor(private usuariosService: UsuariosService) {}

  // leer y parsear el archivo csv
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          this.usuarios = result.data.map((row: any) => ({
            nombre: row.nombre?.trim(),
            email: row.email?.trim(),
            documento_identidad: row.documento_identidad?.trim(),
            fecha_nacimiento: this.formatFecha(row.fecha_nacimiento?.trim())
          })).filter(usuario => this.validarUsuario(usuario)); // filtrar usuarios validos
          this.actualizarUsuariosPaginados();
        },
        error: (error) => {
          console.error('Error al leer el archivo CSV:', error);
        }
      });
    }
  }

  // actualizar los usuarios mostrados en la pagina actual
  actualizarUsuariosPaginados(): void {
    const inicio = this.paginaActual * this.limitePorPagina;
    const fin = inicio + this.limitePorPagina;
    this.usuariosPaginados = this.usuarios.slice(inicio, fin);
  }

  // cambiar de pagina
  cambiarPagina(direccion: number): void {
    this.paginaActual += direccion;
    this.actualizarUsuariosPaginados();
  }

  // obtener el total de paginas
  getTotalPaginas(): number {
    return Math.ceil(this.usuarios.length / this.limitePorPagina);
  }

  // formatear la fecha al formato dd-mm-yyyy para mostrar en la tabla
  formatFechaMostrar(fecha: string): string {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      console.error(`Fecha invalida: ${fecha}`);
      return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // los meses son base 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // validar un usuario individual
  validarUsuario(usuario: any): boolean {
    return usuario.nombre && usuario.email && usuario.documento_identidad && usuario.fecha_nacimiento;
  }

  // formatear la fecha al formato esperado por la api (yyyy-mm-dd)
  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      console.error(`Fecha invalida: ${fecha}`);
      return '';
    }
    return date.toISOString().split('T')[0]; // retorna en formato yyyy-mm-dd
  }

  // validar todos los usuarios antes de enviarlos
  validarUsuarios(): boolean {
    for (const usuario of this.usuarios) {
      if (!this.validarUsuario(usuario)) {
        alert('Todos los campos son obligatorios y deben tener un formato valido.');
        return false;
      }
    }
    return true;
  }

  // enviar los datos a la api usando el servicio
  importarUsuarios(): void {
    if (!this.validarUsuarios()) {
      return;
    }

    this.usuariosService.importarUsuarios(this.usuarios).subscribe({
      next: (response) => {
        console.log('Usuarios importados con exito:', response);
        alert('Usuarios importados con exito.');
        this.usuarios = []; // limpiar la tabla despues de la importacion
        this.actualizarUsuariosPaginados(); // actualizar la tabla paginada
      },
      error: (error) => {
        console.error('Error al importar usuarios:', error);
        alert('Error al importar usuarios.');
      }
    });
  }
}