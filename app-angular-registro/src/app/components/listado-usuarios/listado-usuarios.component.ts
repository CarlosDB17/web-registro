import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from "../../services/usuarios-services/usuarios.service";
import { ConsultasComponent } from '../consultas/consultas.component';
import { ComunicacionService } from '../../services/comunicacion-services/comunicacion.service';


interface Usuario {
  mensaje: string;
  usuario: any;
  nombre: string;
  email: string;
  documento_identidad: string;
  fecha_nacimiento: string;
  foto?: string; 
}

@Component({
  selector: 'app-listado-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ConsultasComponent],
  templateUrl: './listado-usuarios.component.html',
  styleUrls: ['./listado-usuarios.component.scss']
})
export class ListadoUsuariosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  usuarios: Usuario[] = [];
  mensaje: string = '';
  error: string = '';
  cargando: boolean = false;

    // variables de paginación
    skip: number = 0;
    limit: number = 3;
    totalUsuarios: number = 0;

  
  // almacena los datos originales del usuario antes de la edicion
  usuarioOriginal: Partial<Usuario> = {};

  // set para rastrear usuarios cuyos datos originales ya se han almacenado
  usuariosConDatosOriginales: Set<string> = new Set();
  fotoSeleccionada: string | undefined;
  fotoSeleccionadaArchivo: File | null = null;

  constructor(
    private usuariosService: UsuariosService,
    private comunicacionService: ComunicacionService
  ) {}
  

  ngOnInit(): void {
  // Suscribirse al evento de usuario editado
  this.comunicacionService.usuarioEditado$.subscribe(() => {
    this.obtenerUsuarios();
  });


    this.obtenerUsuarios();
  }

  private setMensaje(tipo: 'exito' | 'error', texto: string): void {
    if (tipo === 'exito') {
      this.mensaje = texto;
      this.error = ''; // Limpia el mensaje de error
    } else if (tipo === 'error') {
      this.error = texto;
      this.mensaje = ''; // Limpia el mensaje de éxito
    }
  }

  // Método para obtener usuarios con paginación
  obtenerUsuarios(): void {
    
    this.cargando = true;
    this.usuariosService.obtenerUsuarios(this.skip, this.limit).subscribe({
      next: (response: any) => {
        this.usuarios = response.usuarios;
        this.totalUsuarios = response.total; // Total de usuarios devuelto por la API
        this.setMensaje('exito', 'Usuarios cargados correctamente');
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener usuarios', err);
        this.setMensaje('error', 'Error al cargar usuarios');
        this.cargando = false;
      }
    });
  }

  // Método para cambiar de página
  cambiarPagina(direccion: number): void {
    const nuevoSkip = this.skip + direccion * this.limit;
    if (nuevoSkip >= 0 && nuevoSkip < this.totalUsuarios) {
      this.skip = nuevoSkip;
      this.obtenerUsuarios();
    }
  }

  // Método para cargar usuarios (sin paginación, si es necesario)
  cargarUsuarios(): void {
    this.obtenerUsuarios();
  }



  // metodo para almacenar los datos originales al hacer clic en cualquier data-label
  almacenarDatosOriginales(usuario: Usuario): void {
    if (!this.usuariosConDatosOriginales.has(usuario.documento_identidad)) {
      this.usuarioOriginal = { ...usuario };
      this.usuariosConDatosOriginales.add(usuario.documento_identidad);
      console.log('Datos originales almacenados:', this.usuarioOriginal);
    } else {
      console.log('Los datos originales ya fueron almacenados para este usuario.');
    }
  }

  // metodo publico para iniciar el proceso de actualizacion desde el boton
  iniciarActualizacionUsuario(usuario: Usuario): void {
    if (!this.usuarioOriginal.documento_identidad) {
      this.setMensaje('error', 'Primero selecciona un campo para editar.');
      return;
    }

    console.log('Usuario a actualizar:', usuario);

    // llamar al metodo para guardar cambios con las validaciones necesarias
    this.guardarCambiosUsuario(usuario);
  }

  resetFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
      this.fotoSeleccionadaArchivo = null;
    }
  }




  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image.heic', 'image.heif'];
  
      if (!allowedTypes.includes(file.type)) {
        this.setMensaje('error', 'Formato de archivo no permitido. Solo se aceptan PNG, JPG, JPEG, HEIC o HEIF.');
        this.fotoSeleccionadaArchivo = null;
        console.log('Formato de archivo no permitido:', file.type);
        return;
      }
  
      this.fotoSeleccionadaArchivo = file; // guardar el archivo seleccionado
      console.log('Foto seleccionada correctamente:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
      this.error = ''; //limpiar cualquier mensaje de error previo
    } else {
      console.log('No se seleccionó ningún archivo.');
    }
  }

  subirFotoUsuario(documento_identidad: string): void {
    if (!this.fotoSeleccionadaArchivo) {
      console.error('No hay foto seleccionada para subir.');
      this.cargando = false;
      return;
    }
  
    this.usuariosService.subirFoto(documento_identidad.toUpperCase(), this.fotoSeleccionadaArchivo).subscribe({
      next: (fotoResponse) => {
        console.log('Foto subida:', fotoResponse);
  
        // actualizar el campo foto del usuario con la URL devuelta
        const updatedData = { foto: fotoResponse.foto };
        this.usuariosService.actualizarUsuario(documento_identidad.toUpperCase(), updatedData).subscribe({
          next: () => {
            console.log('Campo foto actualizado correctamente');
            this.setMensaje('exito', 'Usuario registrado correctamente con foto');
            this.limpiarFormulario();
            this.cargando = false;
          },
          error: (err) => {
            console.error('Error al actualizar el campo foto:', err);
            this.setMensaje('error', 'Usuario registrado, pero hubo un error al asociar la foto.');
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al subir la foto:', err);
        this.setMensaje('error', 'Usuario registrado, pero hubo un error al subir la foto.');
        this.cargando = false;
      }
    });
  }

  // metodo para verificar la unicidad antes de actualizar
  private guardarCambiosUsuario(usuario: Usuario): void {
    // convertir el documento de identidad a mayúsculas
    usuario.documento_identidad = usuario.documento_identidad.toUpperCase();

    // primero, verificamos si ha cambiado el documento de identidad
    if (usuario.documento_identidad !== this.usuarioOriginal.documento_identidad?.toUpperCase()) {
      console.log('Documento de identidad cambiado');
      console.log('Original:', this.usuarioOriginal.documento_identidad?.toUpperCase());
      console.log('Nuevo:', usuario.documento_identidad);
      
      // verificamos si el nuevo documento de identidad ya existe
      this.usuariosService.buscarPorDocumentoExacto(usuario.documento_identidad).subscribe(
        (usuarioExistente) => {
          if (usuarioExistente) {
            this.setMensaje('error', 'El documento de identidad ya está registrado por otro usuario.');
            return;
          }
          // si no existe, verificar el email
          this.verificarYActualizarEmail(usuario);
        },
        (error) => {
          // si el error es 404 o "Usuario no encontrado" continuamos
          if (error.status === 404 || error.error?.detail === 'Usuario no encontrado') {
            console.log('Documento de identidad no está registrado, continuando...');
            this.verificarYActualizarEmail(usuario);
          } else {
            console.error('Error al verificar documento de identidad', error);
            this.setMensaje('error', 'Error al verificar documento de identidad.');
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
    // convertimos el email a minúsculas antes de cualquier operación
    usuario.email = usuario.email.toLowerCase();

    // verificamos si el email ha cambiado
    if (usuario.email !== this.usuarioOriginal.email?.toLowerCase()) {
      console.log('Email cambiado');
      console.log('Original:', this.usuarioOriginal.email?.toLowerCase());
      console.log('Nuevo:', usuario.email);
      
      // buscamos si el nuevo email ya existe usando el nuevo método buscarPorEmailExacto
      this.usuariosService.buscarPorEmailExacto(usuario.email).subscribe(
        (usuarioExistente) => {
          if (usuarioExistente) {
            console.log('Email ya registrado:', usuarioExistente);
            this.setMensaje('error', 'El email ya está registrado por otro usuario.');
            return;
          }
          // si no existe, procedemos a actualizar el usuario
          this.realizarActualizacionUsuario(usuario);
        },
        (error) => {
          // si el error es 404, significa que el email no está registrado y podemos continuar
          if (error.status === 404) {
            console.log('Email no está registrado, continuando...');
            this.realizarActualizacionUsuario(usuario);
          } else {
            console.error('Error al verificar email', error);
            this.setMensaje('error', 'Error al verificar email.');
          }
        }
      );
    } else {
      // si el email no cambio, actualizamos directamente
      this.realizarActualizacionUsuario(usuario);
    }
  }

  // metodo para actualizar el usuario después de las validaciones
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

    // si no hay cambios, no realiza la peticion
    if (Object.keys(cambios).length === 0) {
      this.setMensaje('error', 'No se han realizado cambios.');
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
        this.setMensaje('exito', 'Usuario actualizado correctamente');
    
        // Refresca la tabla
        //this.obtenerUsuarios();
      },
      (error) => {
        console.error('Error al actualizar usuario', error);
        this.setMensaje('error', 'Error al actualizar usuario');
      }
    );
  }

  eliminarUsuario(documento_identidad: string): void {
    this.usuariosService.eliminarUsuario(documento_identidad).subscribe(
      () => {
        this.usuarios = this.usuarios.filter(user => user.documento_identidad !== documento_identidad);
        this.setMensaje('exito', 'Usuario eliminado correctamente.');
      },
      (error) => {
        console.error('Error al eliminar usuario', error);
        this.setMensaje('error', 'Error al eliminar usuario.');
      }
    );
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
          this.setMensaje('exito', 'Foto eliminada correctamente.');
        },
        (error) => {
          console.error('Error al eliminar la foto', error);
          this.setMensaje('error', 'Error al eliminar la foto.'); 
        }
      );
    }
  }
limpiarFormulario(): void {
  this.fileInput.nativeElement.value = ''; // limpiar el input de archivo
  this.fotoSeleccionadaArchivo = null;
  this.mensaje = '';
  this.error = '';
}

  seleccionarFoto(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
  
  actualizarFotoUsuario(event: Event, user: Usuario): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      // establece el mensaje de carga personalizado

      this.setMensaje('exito', 'Actualizando foto a ${user.nombre}...');

  
      // llama al servicio para subir la nueva foto
      this.usuariosService.subirFoto(user.documento_identidad, file).subscribe({
        next: (response) => {
          console.log('Foto actualizada:', response);
          user.foto = response.foto; // Actualiza la foto en la tabla
          this.setMensaje('exito', `Foto actualizada correctamente para ${user.nombre}`);
      
          // refresca la tabla
          this.obtenerUsuarios();
        },
        error: (err) => {
          console.error('Error al actualizar la foto:', err);
          this.setMensaje('error', `Hubo un error al actualizar la foto de ${user.nombre}`);
        }
      });
    }
  }
  

  getTotalPaginas(): number {
    return Math.ceil(this.totalUsuarios / this.limit);
  }

}