import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from "../../services/usuarios-services/usuarios.service";

interface Usuario {
  mensaje: string;
  usuario: any;
  nombre: string;
  email: string;
  documento_identidad: string;
  fecha_nacimiento: string;
  foto?: string; // Nuevo campo opcional para la foto
}

@Component({
  selector: 'app-listado-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-usuarios.component.html',
  styleUrls: ['./listado-usuarios.component.scss']
})
export class ListadoUsuariosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  usuarios: Usuario[] = [];
  mensaje: string = '';
  error: string = '';
  cargando: boolean = false;
  formularioEnviado: boolean = false;
  
  // almacena los datos originales del usuario antes de la edicion
  usuarioOriginal: Partial<Usuario> = {};

  // set para rastrear usuarios cuyos datos originales ya se han almacenado
  usuariosConDatosOriginales: Set<string> = new Set();
  fotoSeleccionada: string | undefined;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService.obtenerUsuarios().subscribe(
      (data) => {
        this.usuarios = data;
        this.mensaje = 'Usuarios cargados correctamente';
        this.error = '';
        this.cargando = false;
      },
      (error) => {
        console.error('Error al obtener usuarios', error);
        this.error = error.error?.detail ?? 'Error al cargar usuarios';
        this.mensaje = '';
        this.cargando = false;
      }
    );
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
      this.error = 'Primero selecciona un campo para editar.';
      return;
    }

    console.log('Usuario a actualizar:', usuario);

    // Llamar al metodo para guardar cambios con las validaciones necesarias
    this.guardarCambiosUsuario(usuario);
  }

  registrarUsuario(form: any): void {
    if (!form.valid) {
      this.error = 'Completa todos los campos.';
      this.mensaje = '';
      console.error('Formulario inválido:', form.value);
      return;
    }

    const userData: Usuario = form.value;
    console.log('Datos enviados al servidor:', userData);

    this.usuariosService.registrarUsuario(userData).subscribe(
      (response) => {
        console.log('Usuario registrado:', response);
        const nuevoUsuario = response.usuario;
        this.usuarios.push(nuevoUsuario);
        this.mensaje = response?.mensaje ?? 'Usuario registrado correctamente';
        this.error = '';
        form.reset();
      },
      (error) => {
        console.error('Error al registrar usuario', error);
        console.error('Detalles del error:', error.error);
        this.error = error.error?.detail ?? 'Error al registrar usuario';
        this.mensaje = '';
      }
    );
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic', 'image/heif'];

      if (!allowedTypes.includes(file.type)) {
        this.error = 'Formato de archivo no permitido. Solo se aceptan PNG, JPG, JPEG, HEIC o HEIF.';
        return;
      }

      // Si el archivo es válido, puedes procesarlo aquí
      const reader = new FileReader();
      reader.onload = () => {
        // Aquí puedes guardar la foto en una variable o enviarla al servidor
        this.fotoSeleccionada = reader.result as string; // Guardar la foto como base64 si es necesario
      };
      reader.readAsDataURL(file);

      this.error = ''; // Limpiar cualquier mensaje de error previo
    }
  }

  // metodo para verificar la unicidad antes de actualizar
  private guardarCambiosUsuario(usuario: Usuario): void {
    // primero, verificamos si ha cambiado el documento de identidad
    if (usuario.documento_identidad !== this.usuarioOriginal.documento_identidad) {
      console.log('Documento de identidad cambiado');
      console.log('Original:', this.usuarioOriginal.documento_identidad);
      console.log('Nuevo:', usuario.documento_identidad);
      
      // verificamos si el nuevo documento de identidad ya existe
      this.usuariosService.buscarPorDocumentoIdentidad(usuario.documento_identidad).subscribe(
        (usuarioExistente) => {
          if (usuarioExistente) {
            this.error = 'El documento de identidad ya está registrado por otro usuario.';
            return;
          }
          // si no existe,verificar el email
          this.verificarYActualizarEmail(usuario);
        },
        (error) => {
          // si el error es 404 o "Usuario no encontrado" continuamos
          if (error.status === 404 || error.error?.detail === 'Usuario no encontrado') {
            console.log('Documento de identidad no está registrado, continuando...');
            this.verificarYActualizarEmail(usuario);
          } else {
            console.error('Error al verificar documento de identidad', error);
            this.error = error.error?.detail ?? 'Error al verificar documento de identidad';
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
    // verificamos si el email ha cambiado
    if (usuario.email !== this.usuarioOriginal.email) {
      console.log('Email cambiado');
      console.log('Original:', this.usuarioOriginal.email);
      console.log('Nuevo:', usuario.email);
      
      // buscamos si el nuevo email ya existe
      this.usuariosService.buscarPorEmail(usuario.email).subscribe(
        (usuarioExistente) => {
          if (usuarioExistente) {
            this.error = 'El email ya está registrado por otro usuario.';
            return;
          }
          // si no existe, procedemos a actualizar el usuario
          this.realizarActualizacionUsuario(usuario);
        },
        (error) => {
          console.error('Error al verificar email', error);
          this.error = error.error?.detail ?? 'Error al verificar email';
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
      this.mensaje = '';
      this.error = 'No se han realizado cambios.';
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
        this.mensaje = response?.mensaje ?? 'Usuario actualizado correctamente';
        this.error = '';
      },
      (error) => {
        console.error('Error al actualizar usuario', error);
        this.mensaje = '';
        this.error = error.error?.detail ?? 'Error al actualizar usuario';
      }
    );
  }

  eliminarUsuario(documento_identidad: string): void {
    this.usuariosService.eliminarUsuario(documento_identidad).subscribe(
      () => {
        this.usuarios = this.usuarios.filter(user => user.documento_identidad !== documento_identidad);
        this.mensaje = 'Usuario eliminado correctamente';
        this.error = '';
      },
      (error) => {
        console.error('Error al eliminar usuario', error);
        this.error = error.error?.detail ?? 'Error al eliminar usuario';
        this.mensaje = '';
      }
    );
  }
  
  eliminarFotoUsuario(documento_identidad: string): void {
    this.usuariosService.eliminarFoto(documento_identidad).subscribe(
      () => {
        // Encuentra el usuario en la lista y actualiza el campo foto a vacío
        const usuario = this.usuarios.find(user => user.documento_identidad === documento_identidad);
        if (usuario) {
          usuario.foto = ''; // Actualiza el campo foto para reflejar el cambio en la tabla
        }
        this.mensaje = 'Foto eliminada correctamente';
        this.error = '';
      },
      (error) => {
        console.error('Error al eliminar la foto', error);
        this.error = error.error?.detail ?? 'Error al eliminar la foto';
        this.mensaje = '';
      }
    );
  }



  seleccionarFoto(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
  
  actualizarFotoUsuario(event: Event, user: Usuario): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      // Establece el mensaje de carga personalizado
      this.mensaje = `Actualizando foto a ${user.nombre}...`;
      this.error = '';
  
      // Llama al servicio para subir la nueva foto
      this.usuariosService.subirFoto(user.documento_identidad, file).subscribe({
        next: (response) => {
          console.log('Foto actualizada:', response);
          user.foto = response.foto; // Actualiza la foto en la tabla
          this.mensaje = `Foto actualizada correctamente para ${user.nombre}`;
        },
        error: (err) => {
          console.error('Error al actualizar la foto:', err);
          this.error = `Hubo un error al actualizar la foto de ${user.nombre}`;
          this.mensaje = '';
        }
      });
    }
  }


  
}