import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios-services/usuarios.service';
import { ComunicacionService } from '../../services/comunicacion-services/comunicacion.service';


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
  busquedaActiva: boolean = false;


  tipoBusqueda: string = 'documento_identidad';
  terminoBusqueda: string = '';
  usuarios: Usuario[] = [];
  mensajeError: string = '';
  mensajeExito: string = '';
  buscando: boolean = false;

  // variables de paginacion
  skip: number = 0;
  limit: number = 3;
  totalUsuarios: number = 0;

  // variables para edicion de usuarios
  usuarioOriginal: Partial<Usuario> = {};
  usuariosConDatosOriginales: Set<string> = new Set();
  fotoSeleccionadaArchivo: File | null = null;

  constructor(
    private usuariosService: UsuariosService,
    private comunicacionService: ComunicacionService
  ) {}

  ngOnInit(): void {}

  realizarBusqueda() {
    this.busquedaActiva = true; // Activa la clase para expandir el contenedor
  }

  limpiarBusqueda() {
    this.busquedaActiva = false; // Desactiva la clase para volver al tamaño original
  }

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
            this.realizarBusqueda(); // Activa la clase para expandir el contenedor
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
            this.realizarBusqueda(); // activa la clase para expandir el contenedor
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
            this.realizarBusqueda(); // activa la clase para expandir el contenedor
          },
          error: (error) => {
            this.manejarError(error);
          }
        });
        break;
    }
  }
  

  // metodo para calcular el total de paginas
  getTotalPaginas(): number {
    return Math.ceil(this.totalUsuarios / this.limit);
  }

  // metodo para cambiar de pagina
  cambiarPagina(direccion: number): void {
    const nuevoSkip = this.skip + direccion * this.limit;
    if (nuevoSkip >= 0 && nuevoSkip < this.totalUsuarios) {
      this.skip = nuevoSkip;
      this.buscar(); // realiza la busqueda nuevamente con la nueva pagina
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
    // resetear datos de edicion
    this.usuarioOriginal = {};
    this.usuariosConDatosOriginales.clear();

    this.limpiarBusqueda(); // limpiar la busqueda activa
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



  // metodo para almacenar los datos originales al hacer clic en cualquier campo editable
  almacenarDatosOriginales(usuario: Usuario): void {
    // si el documento de identidad original ya existe en el conjunto
    if (this.usuariosConDatosOriginales.has(this.usuarioOriginal.documento_identidad!)) {
      // eliminar el documento de identidad anterior del conjunto
      this.usuariosConDatosOriginales.delete(this.usuarioOriginal.documento_identidad!);
    }
  
    // almacenar los nuevos datos originales
    this.usuarioOriginal = { ...usuario };
    this.usuariosConDatosOriginales.add(usuario.documento_identidad);
    console.log('Datos originales almacenados:', this.usuarioOriginal);
  }

  // metodo publico para iniciar el proceso de actualizacion desde el boton
  iniciarActualizacionUsuario(usuario: Usuario): void {
    if (!this.usuarioOriginal.documento_identidad) {
      this.mensajeError = 'Primero selecciona un campo para editar.';
      this.mensajeExito = '';
      return;
    }

    console.log('Usuario a actualizar:', usuario);

    // llamar al metodo para guardar cambios con las validaciones necesarias
    this.guardarCambiosUsuario(usuario);
  }

  // metodo para verificar la unicidad antes de actualizar
  private guardarCambiosUsuario(usuario: Usuario): void {
    // Convertir el documento de identidad a mayúsculas
    usuario.documento_identidad = usuario.documento_identidad.toUpperCase();

    // primero verificamos si ha cambiado el documento de identidad
    if (usuario.documento_identidad !== this.usuarioOriginal.documento_identidad?.toUpperCase()) {
      console.log('Documento de identidad cambiado');
      console.log('Original:', this.usuarioOriginal.documento_identidad?.toUpperCase());
      console.log('Nuevo:', usuario.documento_identidad);
      
      // verificamos si el nuevo documento de identidad ya existe
      this.usuariosService.buscarPorDocumentoExacto(usuario.documento_identidad).subscribe(
        (usuarioExistente) => {
          if (usuarioExistente) {
            this.mensajeError = 'El documento de identidad ya está registrado por otro usuario.';
            this.mensajeExito = '';
            return;
          }
          // si no existe verificar el email
          this.verificarYActualizarEmail(usuario);
        },
        (error) => {
          // si el error es 404 o "Usuario no encontrado" continuamos
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
      // si el documento de identidad no cambio verificamos solo el email
      this.verificarYActualizarEmail(usuario);
    }
  }

  // metodo para verificar la unicidad del email
  private verificarYActualizarEmail(usuario: Usuario): void {
    // convertimos el email a minusculas antes de cualquier operacion
    usuario.email = usuario.email.toLowerCase();

    // verificamos si el email ha cambiado
    if (usuario.email !== this.usuarioOriginal.email?.toLowerCase()) {
      console.log('Email cambiado');
      console.log('Original:', this.usuarioOriginal.email?.toLowerCase());
      console.log('Nuevo:', usuario.email);
      
      // buscamos si el nuevo email ya existe
      this.usuariosService.buscarPorEmailExacto(usuario.email).subscribe(
        (usuarioExistente) => {
          if (usuarioExistente) {
            this.mensajeError = 'El email ya está registrado por otro usuario.';
            this.mensajeExito = '';
            return;
          }
          // si no existe actualizamos el usuario
          this.realizarActualizacionUsuario(usuario);
        },
        (error) => {
          // si el error es 404  significa que el email no esta registrado y podemos continuar
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
      // si el email no cambio actualizamos directamente
      this.realizarActualizacionUsuario(usuario);
    }
  }

  // metodo para actualizar el usuario despues de las validaciones
  private realizarActualizacionUsuario(usuario: Usuario): void {
    // detecta los cambios comparando con el usuario original
    const cambios: Partial<Usuario> = {};
    Object.keys(usuario).forEach((key) => {
      const k = key as keyof Usuario;
      
      // log detallado de comparacion de cada campo
      console.log(`Comparando ${k}:`);
      console.log('Valor original:', this.usuarioOriginal[k]);
      console.log('Valor actual:', usuario[k]);
      console.log('Son iguales:', this.usuarioOriginal[k] === usuario[k]);
      
      if (usuario[k] !== this.usuarioOriginal[k]) {
        cambios[k] = usuario[k];
      }
    });

    console.log('Cambios detectados:', cambios);

    // si no hay cambios no realiza la peticion
    if (Object.keys(cambios).length === 0) {
      this.mensajeExito = '';
      this.mensajeError = 'No se han realizado cambios.';
      return;
    }

    // envia los cambios al servicio para actualizar el usuario
    this.usuariosService.actualizarUsuario(this.usuarioOriginal.documento_identidad!, cambios).subscribe(
      (response) => {
        // actualiza la lista local con los cambios realizados
        const index = this.usuarios.findIndex(u => u.documento_identidad === this.usuarioOriginal.documento_identidad);
        if (index !== -1) {
          this.usuarios[index] = { ...this.usuarios[index], ...cambios };
        }
        console.log('Usuario actualizado correctamente');
        this.mensajeExito = response?.mensaje ?? 'Usuario actualizado correctamente';
        this.mensajeError = '';
        
        // si el documento de identidad ha cambiado y era parte del termino de busqueda, actualizar la busqueda
        if (cambios.documento_identidad && this.tipoBusqueda === 'documento_identidad' && 
            this.terminoBusqueda.toUpperCase() === this.usuarioOriginal.documento_identidad?.toUpperCase()) {
          this.terminoBusqueda = cambios.documento_identidad;
          this.buscar();
        }
        this.comunicacionService.notificarUsuarioEditado(); // notificar al servicio

      },
      (error) => {
        console.error('Error al actualizar usuario', error);
        this.mensajeExito = '';
        this.mensajeError = error.error?.detail ?? 'Error al actualizar usuario';
      }
    );
  }

  // metodo para eliminar un usuario
  eliminarUsuario(documento_identidad: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(documento_identidad).subscribe(
        () => {
          this.usuarios = this.usuarios.filter(user => user.documento_identidad !== documento_identidad);
          this.mensajeExito = 'Usuario eliminado correctamente';
          this.mensajeError = '';
          
          this.comunicacionService.notificarUsuarioEditado(); // notificar al servicio
          // actualizar contador total
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

  // funciones para gestionar fotos de usuario
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
  
      this.fotoSeleccionadaArchivo = file; // guardar el archivo seleccionado
      console.log('Foto seleccionada correctamente:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
      this.mensajeError = ''; // limpiar cualquier mensaje de error previo
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
  
      // establece el mensaje de carga personalizado
      this.mensajeExito = `Actualizando foto a ${user.nombre}...`;
      this.mensajeError = '';
  
      // llama al servicio para subir la nueva foto
      this.usuariosService.subirFoto(user.documento_identidad, file).subscribe({
        next: (response) => {
          console.log('Foto actualizada:', response);
          user.foto = response.foto; // actualiza la foto en la tabla
          this.mensajeExito = `Foto actualizada correctamente para ${user.nombre}`;
          
           // notificar al servicio que un usuario fue editado
        this.comunicacionService.notificarUsuarioEditado();
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
          // encuentra el usuario en la lista y actualiza el campo foto a vacio
          const usuario = this.usuarios.find(user => user.documento_identidad === documento_identidad);
          if (usuario) {
            usuario.foto = ''; // actualiza el campo foto para reflejar el cambio en la tabla
          }
          this.mensajeExito = 'Foto eliminada correctamente';
          this.mensajeError = '';
          this.comunicacionService.notificarUsuarioEditado(); // notificar al servicio
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
      this.fileInput.nativeElement.value = ''; // limpiar el input de archivo
    }
    this.fotoSeleccionadaArchivo = null;
    this.mensajeExito = '';
    this.mensajeError = '';
  }
}