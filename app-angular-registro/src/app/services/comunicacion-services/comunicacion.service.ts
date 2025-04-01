import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComunicacionService {
  private usuarioEditadoSource = new Subject<void>();

  // observable que otros componentes pueden suscribirse
  usuarioEditado$ = this.usuarioEditadoSource.asObservable();

  // metodo para notificar que un usuario fue editado
  notificarUsuarioEditado(): void {
    this.usuarioEditadoSource.next();
    console.log('Usuario editado notificado');
  }
}