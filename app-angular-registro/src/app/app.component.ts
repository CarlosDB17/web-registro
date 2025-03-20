import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from './components/registro/registro.component';
import { ListadoUsuariosComponent } from './components/listado-usuarios/listado-usuarios.component';
import { ConsultasComponent } from './components/consultas/consultas.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RegistroComponent, ListadoUsuariosComponent, ConsultasComponent, FormsModule], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app-angular-registro';
  
  // Sección por defecto
  seccionActual: string = 'registro';

  // Método para cambiar de sección
  mostrarSeccion(seccion: string) {
    console.log('Cambiando a:', seccion); 
    this.seccionActual = seccion;
  }
}
