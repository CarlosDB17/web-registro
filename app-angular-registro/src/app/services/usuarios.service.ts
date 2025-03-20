import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Usuario {
  nombre: string;
  email: string;
  dni: string;
  fecha_nacimiento: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private API_URL = "https://pf25-carlos-db-302016834907.europe-west1.run.app/usuarios";

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
  actualizarUsuario(dni: string, updatedData: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.API_URL}/${dni}`, updatedData);
  }

  // Eliminar usuario
  eliminarUsuario(dni: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${dni}`);
  }
}
