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
  displayedColumns: string[] = ['nombre', 'email', 'documento_identidad', 'fecha_nacimiento'];

  constructor(private usuariosService: UsuariosService) {}

  // Leer y parsear el archivo CSV
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
          })).filter(usuario => this.validarUsuario(usuario)); // Filtrar usuarios válidos
        },
        error: (error) => {
          console.error('Error al leer el archivo CSV:', error);
        }
      });
    }
  }

  // Formatear la fecha al formato dd-mm-yyyy para mostrar en la tabla
formatFechaMostrar(fecha: string): string {
  const date = new Date(fecha);
  if (isNaN(date.getTime())) {
    console.error(`Fecha inválida: ${fecha}`);
    return '';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son base 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

  // Validar un usuario individual
  validarUsuario(usuario: any): boolean {
    return usuario.nombre && usuario.email && usuario.documento_identidad && usuario.fecha_nacimiento;
  }

  // Formatear la fecha al formato esperado por la API (YYYY-MM-DD)
  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      console.error(`Fecha inválida: ${fecha}`);
      return '';
    }
    return date.toISOString().split('T')[0]; // Retorna en formato YYYY-MM-DD
  }

  // Validar todos los usuarios antes de enviarlos
  validarUsuarios(): boolean {
    for (const usuario of this.usuarios) {
      if (!this.validarUsuario(usuario)) {
        alert('Todos los campos son obligatorios y deben tener un formato válido.');
        return false;
      }
    }
    return true;
  }

  // Enviar los datos a la API usando el servicio
  importarUsuarios(): void {
    if (!this.validarUsuarios()) {
      return;
    }

    this.usuariosService.importarUsuarios(this.usuarios).subscribe({
      next: (response) => {
        console.log('Usuarios importados con éxito:', response);
        alert('Usuarios importados con éxito.');
        this.usuarios = []; // Limpiar la tabla después de la importación
      },
      error: (error) => {
        console.error('Error al importar usuarios:', error);
        alert('Error al importar usuarios.');
      }
    });
  }
}