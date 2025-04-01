import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios-services/usuarios.service';

interface Usuario {
  usuario: any;
  nombre: string;
  email: string;
  documento_identidad: string;
  fecha_nacimiento: string;
  foto?: string;
  mensaje?: string; // Añadido para mantener consistencia con ListadoUsuariosComponent
}

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ConsultasComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  tipoBusqueda: string = 'documento_identidad';
  terminoBusqueda: string = '';
  usuarios: Usuario[] = [];
  mensajeError: string = '';
  mensajeExito: string = '';
  buscando: boolean = false;

  // Variables de paginación
  skip: number = 0;
  limit: number = 3;
  totalUsuarios: number = 0;

  // Variables para edición de usuarios
  usuarioOriginal: Partial<Usuario> = {};
  usuariosConDatosOriginales: Set<string> = new Set();
  fotoSeleccionadaArchivo: File | null = null;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {}

  buscar(): void {
    if (!this.terminoBusqueda.trim()) {
      this.mensajeError = 'Por favor, introduce un término de búsqueda';
      return;
    }

    this.mensajeError = '';
    this.mensajeExito = '';
    this.buscando = true;

    const terminoBusquedaMayusculas = this.terminoBusqueda.toUpperCase();

    switch (this.tipoBusqueda) {
      case 'documento_identidad':
        this.usuariosService.buscarPorDocumentoIdentidad(terminoBusquedaMayusculas, this.skip, this.limit).subscribe({
          next: (response) => {
            this.usuarios = response.usuarios;
            this.totalUsuarios = response.total;
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
            this.totalUsuarios = response.total;
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
            this.totalUsuarios = response.total;
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
    this.mensajeExito = '';
    this.terminoBusqueda = '';
    // Resetear datos de edición
    this.usuarioOriginal = {};
    this.usuariosConDatosOriginales.clear();
  }

  limpiarTerminoBusqueda(): void {
    this.terminoBusqueda = '';
    this.usuarios = [];
    this.mensajeError = '';
    this.mensajeExito = '';
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

  /*** FUNCIONES DE EDICIÓN DE USUARIOS ***/

  // Método para almacenar los datos originales al hacer clic en cualquier campo editable
  almacenarDatosOriginales(usuario: Usuario): void {
    if (!this.usuariosConDatosOriginales.has(usuario.documento_identidad)) {
      this.usuarioOriginal = { ...usuario };
      this.usuariosConDatosOriginales.add(usuario.documento_identidad);
      console.log('Datos originales almacenados:', this.usuarioOriginal);
    } else {
      console.log('Los datos originales ya fueron almacenados para este usuario.');
    }
  }

  // Método público para iniciar el proceso de actualización desde el botón
  iniciarActualizacionUsuario(usuario: Usuario): void {
    if (!this.usuarioOriginal.documento_identidad) {
      this.mensajeError = 'Primero selecciona un campo para editar.';
      this.mensajeExito = '';
      return;
    }

    console.log('Usuario a actualizar:', usuario);

    // Llamar al método para guardar cambios con las validaciones necesarias
    this.guardarCambiosUsuario(usuario);
  }

  // Método para verificar la unicidad antes de actualizar
  private guardarCambiosUsuario(usuario: Usuario): void {
    // Convertir el documento de identidad a mayúsculas
    usuario.documento_identidad = usuario.documento_identidad.toUpperCase();

    // Primero, verificamos si ha cambiado el documento de identidad
    if (usuario.documento_identidad !== this.usuarioOriginal.documento_identidad?.toUpperCase()) {
      console.log('Documento de identidad cambiado');
      console.log('Original:', this.usuarioOriginal.documento_identidad?.toUpperCase());
      console.log('Nuevo:', usuario.documento_identidad);
      
      // Verificamos si el nuevo documento de identidad ya existe
      this.usuariosService.buscarPorDocumentoExacto(usuario.documento_identidad).subscribe(
        (usuarioExistente) => {
          if (usuarioExistente) {
            this.mensajeError = 'El documento de identidad ya está registrado por otro usuario.';
            this.mensajeExito = '';
            return;
          }
          // Si no existe, verificar el email
          this.verificarYActualizarEmail(usuario);
        },
        (error) => {
          // Si el error es 404 o "Usuario no encontrado" continuamos
          if (error.status === 404 || error.error?.detail === 'Usuario no encontrado') {
            console.log('Documento de identidad no está registrado, continuando...');
            this.verificarYActualizarEmail(usuario);
          } else {
            console.error('Error al verificar documento de identidad', error);
            this.mensajeError = error.error?.detail ?? 'Error al verificar documento de identidad';
            this.mensajeExito = '';
          }
        }
      );
    } else {
      // Si el documento de identidad no cambió, verificamos solo el email
      this.verificarYActualizarEmail(usuario);
    }
  }

  // Método para verificar la unicidad del email
  private verificarYActualizarEmail(usuario: Usuario): void {
    // Convertimos el email a minúsculas antes de cualquier operación
    usuario.email = usuario.email.toLowerCase();

    // Verificamos si el email ha cambiado
    if (usuario.email !== this.usuarioOriginal.email?.toLowerCase()) {
      console.log('Email cambiado');
      console.log('Original:', this.usuarioOriginal.email?.toLowerCase());
      console.log('Nuevo:', usuario.email);
      
      // Buscamos si el nuevo email ya existe
      this.usuariosService.buscarPorEmailExacto(usuario.email).subscribe(
        (usuarioExistente) => {
          if (usuarioExistente) {
            this.mensajeError = 'El email ya está registrado por otro usuario.';
            this.mensajeExito = '';
            return;
          }
          // Si no existe, procedemos a actualizar el usuario
          this.realizarActualizacionUsuario(usuario);
        },
        (error) => {
          // Si el error es 404, significa que el email no está registrado y podemos continuar
          if (error.status === 404) {
            console.log('Email no está registrado, continuando...');
            this.realizarActualizacionUsuario(usuario);
          } else {
            console.error('Error al verificar email', error);
            this.mensajeError = error.error?.detail ?? 'Error al verificar email';
            this.mensajeExito = '';
          }
        }
      );
    } else {
      // Si el email no cambió, actualizamos directamente
      this.realizarActualizacionUsuario(usuario);
    }
  }

  // Método para actualizar el usuario después de las validaciones
  private realizarActualizacionUsuario(usuario: Usuario): void {
    // Detecta los cambios comparando con el usuario original
    const cambios: Partial<Usuario> = {};
    Object.keys(usuario).forEach((key) => {
      const k = key as keyof Usuario;
      
      // Log detallado de comparación de cada campo
      console.log(`Comparando ${k}:`);
      console.log('Valor original:', this.usuarioOriginal[k]);
      console.log('Valor actual:', usuario[k]);
      console.log('Son iguales:', this.usuarioOriginal[k] === usuario[k]);
      
      if (usuario[k] !== this.usuarioOriginal[k]) {
        cambios[k] = usuario[k];
      }
    });

    console.log('Cambios detectados:', cambios);

    // Si no hay cambios, no realiza la petición
    if (Object.keys(cambios).length === 0) {
      this.mensajeExito = '';
      this.mensajeError = 'No se han realizado cambios.';
      return;
    }

    // Envia los cambios al servicio para actualizar el usuario
    this.usuariosService.actualizarUsuario(this.usuarioOriginal.documento_identidad!, cambios).subscribe(
      (response) => {
        // Actualiza la lista local con los cambios realizados
        const index = this.usuarios.findIndex(u => u.documento_identidad === this.usuarioOriginal.documento_identidad);
        if (index !== -1) {
          this.usuarios[index] = { ...this.usuarios[index], ...cambios };
        }
        console.log('Usuario actualizado correctamente');
        this.mensajeExito = response?.mensaje ?? 'Usuario actualizado correctamente';
        this.mensajeError = '';
        
        // Si el documento de identidad ha cambiado y era parte del término de búsqueda, actualizar la búsqueda
        if (cambios.documento_identidad && this.tipoBusqueda === 'documento_identidad' && 
            this.terminoBusqueda.toUpperCase() === this.usuarioOriginal.documento_identidad?.toUpperCase()) {
          this.terminoBusqueda = cambios.documento_identidad;
          this.buscar();
        }
      },
      (error) => {
        console.error('Error al actualizar usuario', error);
        this.mensajeExito = '';
        this.mensajeError = error.error?.detail ?? 'Error al actualizar usuario';
      }
    );
  }

  // Método para eliminar un usuario
  eliminarUsuario(documento_identidad: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(documento_identidad).subscribe(
        () => {
          this.usuarios = this.usuarios.filter(user => user.documento_identidad !== documento_identidad);
          this.mensajeExito = 'Usuario eliminado correctamente';
          this.mensajeError = '';
          
          // Actualizar contador total
          this.totalUsuarios--;
        },
        (error) => {
          console.error('Error al eliminar usuario', error);
          this.mensajeError = error.error?.detail ?? 'Error al eliminar usuario';
          this.mensajeExito = '';
        }
      );
    }
  }

  // Funciones para gestionar fotos de usuario
  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image.heic', 'image.heif'];
  
      if (!allowedTypes.includes(file.type)) {
        this.mensajeError = 'Formato de archivo no permitido. Solo se aceptan PNG, JPG, JPEG, HEIC o HEIF.';
        this.fotoSeleccionadaArchivo = null;
        console.log('Formato de archivo no permitido:', file.type);
        return;
      }
  
      this.fotoSeleccionadaArchivo = file; // Guardar el archivo seleccionado
      console.log('Foto seleccionada correctamente:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
      this.mensajeError = ''; // Limpiar cualquier mensaje de error previo
    } else {
      console.log('No se seleccionó ningún archivo.');
    }
  }

  seleccionarFoto(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
  
  actualizarFotoUsuario(event: Event, user: Usuario): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      // Establece el mensaje de carga personalizado
      this.mensajeExito = `Actualizando foto a ${user.nombre}...`;
      this.mensajeError = '';
  
      // Llama al servicio para subir la nueva foto
      this.usuariosService.subirFoto(user.documento_identidad, file).subscribe({
        next: (response) => {
          console.log('Foto actualizada:', response);
          user.foto = response.foto; // Actualiza la foto en la tabla
          this.mensajeExito = `Foto actualizada correctamente para ${user.nombre}`;
        },
        error: (err) => {
          console.error('Error al actualizar la foto:', err);
          this.mensajeError = `Hubo un error al actualizar la foto de ${user.nombre}`;
          this.mensajeExito = '';
        }
      });
    }
  }

  eliminarFotoUsuario(documento_identidad: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar la foto de este usuario?')) {
      this.usuariosService.eliminarFoto(documento_identidad).subscribe(
        () => {
          // Encuentra el usuario en la lista y actualiza el campo foto a vacío
          const usuario = this.usuarios.find(user => user.documento_identidad === documento_identidad);
          if (usuario) {
            usuario.foto = ''; // Actualiza el campo foto para reflejar el cambio en la tabla
          }
          this.mensajeExito = 'Foto eliminada correctamente';
          this.mensajeError = '';
        },
        (error) => {
          console.error('Error al eliminar la foto', error);
          this.mensajeError = error.error?.detail ?? 'Error al eliminar la foto';
          this.mensajeExito = '';
        }
      );
    }
  }

  resetFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
      this.fotoSeleccionadaArchivo = null;
    }
  }

  limpiarFormulario(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = ''; // Limpiar el input de archivo
    }
    this.fotoSeleccionadaArchivo = null;
    this.mensajeExito = '';
    this.mensajeError = '';
  }
}