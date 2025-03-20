import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from "../../services/usuarios.service";

interface Usuario {
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
      (error) => console.error('Error al obtener usuarios', error)
    );
  }

  registrarUsuario(form: any): void {
    const userData: Usuario = form.value;
    this.usuariosService.registrarUsuario(userData).subscribe(
      (nuevoUsuario) => {
        this.usuarios.push(nuevoUsuario);
        form.reset();
      },
      (error) => console.error('Error al registrar usuario', error)
    );
  }

  actualizarUsuario(usuario: Usuario): void {
    this.usuariosService.actualizarUsuario(usuario.dni, usuario).subscribe(
      () => console.log('Usuario actualizado'),
      (error) => console.error('Error al actualizar usuario', error)
    );
  }

  eliminarUsuario(dni: string): void {
    this.usuariosService.eliminarUsuario(dni).subscribe(
      () => this.usuarios = this.usuarios.filter(user => user.dni !== dni),
      (error) => console.error('Error al eliminar usuario', error)
    );
  }
}
