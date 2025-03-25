// usuarios.service.ts (updated)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Usuario {
  mensaje: string;
  usuario: any;
  nombre: string;
  email: string;
  documento_identidad: string; // cambiado de dni a documento_identidad
  fecha_nacimiento: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private API_URL = "https://pf25-carlos-db-v4-302016834907.europe-west1.run.app/usuarios";
  //private API_URL = "http://127.0.0.1:8000/usuarios";

  constructor(private http: HttpClient) {}

  // Obtener usuarios
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL);
  }

  // Registrar usuario
  registrarUsuario(userData: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, userData);
  }

  // Actualizar usuario
  actualizarUsuario(documento_identidad: string, updatedData: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.API_URL}/${documento_identidad}`, updatedData); // Cambiado dni a documento_identidad
  }

  // Eliminar usuario
  eliminarUsuario(documento_identidad: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${documento_identidad}`); // Cambiado dni a documento_identidad
  }

  // Buscar usuario por documento_identidad
  buscarPorDocumentoIdentidad(documento_identidad: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/documento/${documento_identidad}`); // Cambiado dni a documento_identidad
  }

  // Buscar usuario por nombre
  buscarPorNombre(nombre: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/nombre/${nombre}`);
  }

  // Buscar usuario por email
  buscarPorEmail(email: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/email/${email}`);
  }
}