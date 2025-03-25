import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from "../../services/usuarios.service";

interface Usuario {
  mensaje: string;
  usuario: any;
  nombre: string;
  email: string;
  documento_identidad: string; // Cambiado de dni a documento_identidad
  fecha_nacimiento: string;
}

@Component({
  selector: 'app-listado-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-usuarios.component.html',
  styleUrls: ['./listado-usuarios.component.scss']
})
export class ListadoUsuariosComponent implements OnInit {
  usuarios: Usuario[] = []; // lista de usuarios
  mensaje: string = ''; // mensaje de exito
  error: string = ''; // mensaje de error
  cargando: boolean = false; // indica si se estan cargando los usuarios
  formularioEnviado: boolean = false; // propiedad para saber si se intento enviar el formulario


  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    // se ejecuta al inicializar el componente y carga los usuarios
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true; // activa el indicador de carga
    this.usuariosService.obtenerUsuarios().subscribe(
      (data) => {
        this.usuarios = data; // asigna los usuarios obtenidos
        this.mensaje = 'Usuarios cargados correctamente';
        this.error = '';
        this.cargando = false; // desactiva el indicador de carga
      },
      (error) => {
        console.error('error al obtener usuarios', error);
        this.error = error.error?.detail ?? 'error al cargar usuarios';
        this.mensaje = '';
        this.cargando = false; // desactiva el indicador de carga
      }
    );
  }

  registrarUsuario(form: any): void {
    if (!form.valid) {
      this.error = 'Completa todos los campos.'; // Mensaje de error si el formulario no es válido
      this.mensaje = '';
      return;
    }
  
    // Si el formulario es válido, continúa con el registro
    const userData: Usuario = form.value;
    this.usuariosService.registrarUsuario(userData).subscribe(
      (response) => {
        console.log('usuario registrado:', response);
        const nuevoUsuario = response.usuario; // obtiene el usuario registrado
        this.usuarios.push(nuevoUsuario); // agrega el nuevo usuario a la lista
        this.mensaje = response?.mensaje ?? 'Usuario registrado correctamente';
        this.error = '';
        form.reset(); // limpia el formulario
      },
      (error) => {
        console.error('error al registrar usuario', error);
        this.error = error.error?.detail ?? 'error al registrar usuario';
        this.mensaje = '';
      }
    );
  }

  actualizarUsuario(usuario: Usuario): void {
    // actualiza un usuario existente enviando solo los cambios detectados
    this.usuariosService.buscarPorDocumentoIdentidad(usuario.documento_identidad).subscribe(
      (usuarioOriginal) => {
        // detecta los cambios comparando con el usuario original
        const cambios: Partial<Usuario> = {};
        Object.keys(usuario).forEach((key) => {
          const k = key as keyof Usuario;
          if (usuario[k] !== usuarioOriginal[k]) {
            cambios[k] = usuario[k];
          }
        });
  
        // si no hay cambios, no realiza la peticion
        if (Object.keys(cambios).length === 0) {
          this.mensaje = '';
          this.error = 'no se han realizado cambios.';
          return;
        }
  
        // envia los cambios al servicio para actualizar el usuario
        this.usuariosService.actualizarUsuario(usuario.documento_identidad, cambios).subscribe(
          (response) => {
            // actualiza la lista local con los cambios realizados
            const index = this.usuarios.findIndex(u => u.documento_identidad === usuario.documento_identidad);
            if (index !== -1) {
              this.usuarios[index] = { ...this.usuarios[index], ...cambios };
            }
            console.log('usuario actualizado correctamente');
            this.mensaje = response?.mensaje ?? 'Usuario actualizado correctamente';
            this.error = '';
          },
          (error) => {
            console.error('error al actualizar usuario', error);
            this.mensaje = '';
            this.error = error.error?.detail ?? 'error al actualizar usuario';
          }
        );
      },
      (error) => {
        console.error('error al obtener el usuario original', error);
        this.mensaje = '';
        this.error = error.error?.detail ?? 'Error al obtener el usuario original';
      }
    );
  }
  
  eliminarUsuario(documento_identidad: string): void {
    // elimina un usuario por su documento_identidad
    this.usuariosService.eliminarUsuario(documento_identidad).subscribe(
      () => {
        // elimina el usuario de la lista local
        this.usuarios = this.usuarios.filter(user => user.documento_identidad !== documento_identidad);
        this.mensaje = 'usuario eliminado correctamente';
        this.error = '';
      },
      (error) => {
        console.error('error al eliminar usuario', error);
        this.error = error.error?.detail ?? 'Error al eliminar usuario';
        this.mensaje = '';
      }
    );
  }
}