import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from "../../services/usuarios.service";

interface Usuario {
  usuario: any;
  nombre: string;
  email: string;
  dni: string;
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
  usuarios: Usuario[] = [];

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.obtenerUsuarios().subscribe(
      (data) => this.usuarios = data,
      (error) => console.error('error al obtener usuarios', error)
    );
  }

  registrarUsuario(form: any): void {
    const userData: Usuario = form.value;
    this.usuariosService.registrarUsuario(userData).subscribe(
      (response) => {
        console.log('usuario registrado:', response); // verifica que datos devuelve el backend
        const nuevoUsuario = response.usuario; // extrae el objeto usuario de la respuesta
        this.usuarios.push(nuevoUsuario); // añade el usuario al arreglo
        alert('usuario registrado correctamente'); // alerta de exito
        form.reset(); // limpia el formulario despues de registrar
      },
      (error) => {
        console.error('error al registrar usuario', error);
        alert('error al registrar usuario'); // alerta de error
      }
    );
  }

  actualizarUsuario(usuario: Usuario): void {
    this.usuariosService.actualizarUsuario(usuario.dni, usuario).subscribe(
      () => {
        const index = this.usuarios.findIndex(u => u.dni === usuario.dni);
        if (index !== -1) {
          this.usuarios[index] = usuario; // actualiza el usuario en el arreglo
        }
        console.log('usuario actualizado');
        alert('usuario actualizado correctamente'); // alerta de exito
      },
      (error) => {
        console.error('error al actualizar usuario', error);
        alert('error al actualizar usuario'); // alerta de error
      }
    );
  }

  eliminarUsuario(dni: string): void {
    this.usuariosService.eliminarUsuario(dni).subscribe(
      () => {
        this.usuarios = this.usuarios.filter(user => user.dni !== dni);
        alert('usuario eliminado correctamente'); // alerta de exito
      },
      (error) => {
        console.error('error al eliminar usuario', error);
        alert('error al eliminar usuario'); // alerta de error
      }
    );
  }
}
