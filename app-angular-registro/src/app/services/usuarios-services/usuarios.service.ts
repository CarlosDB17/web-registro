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
  foto?: string; // Nuevo campo opcional para la foto
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  //private API_URL = "https://pf25-carlos-db-v5-302016834907.europe-west1.run.app/usuarios";
  private API_URL = "http://127.0.0.1:8000/usuarios";

  constructor(private http: HttpClient) {}

 // Obtener usuarios con paginación
obtenerUsuarios(skip: number, limit: number): Observable<{ usuarios: Usuario[]; total: number }> {
  return this.http.get<{ usuarios: Usuario[]; total: number }>(`${this.API_URL}?skip=${skip}&limit=${limit}`);
}

  // Registrar usuario
  registrarUsuario(userData: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, userData);
  }

  // Actualizar usuario
  actualizarUsuario(documento_identidad: string, updatedData: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.API_URL}/${documento_identidad}`, updatedData);
  }

  // Eliminar usuario
  eliminarUsuario(documento_identidad: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${documento_identidad}`);
  }

  // Buscar usuario por documento_identidad
  buscarPorDocumentoIdentidad(documento_identidad: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/documento/${documento_identidad}`);
  }

  // Buscar usuario por nombre
  buscarPorNombre(nombre: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/nombre/${nombre}`);
  }

  // Buscar usuario por email
  buscarPorEmail(email: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/email/${email}`);
  }

  // Subir o actualizar foto del usuario
  subirFoto(documento_identidad: string, foto: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', foto);
    return this.http.post(`${this.API_URL}/${documento_identidad}/foto`, formData);
  }

  // Obtener URL de la foto del usuario
  obtenerFoto(documento_identidad: string): Observable<{ foto: string }> {
    return this.http.get<{ foto: string }>(`${this.API_URL}/${documento_identidad}/foto`);
  }

  // Eliminar foto del usuario
  eliminarFoto(documento_identidad: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${documento_identidad}/foto`);
  }
}