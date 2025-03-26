import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from '../../components/registro/registro.component';
import { ListadoUsuariosComponent } from '../../components/listado-usuarios/listado-usuarios.component';
import { ConsultasComponent } from '../../components/consultas/consultas.component';
import { FormsModule } from '@angular/forms';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RegistroComponent, ListadoUsuariosComponent, ConsultasComponent, FormsModule, QrScannerComponent], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export default class HomeComponent {

  title = 'app-angular-registro';
  
  // Sección por defecto
  seccionActual: string = 'listado';

  // Método para cambiar de sección
  mostrarSeccion(seccion: string) {
    console.log('Cambiando a:', seccion); 
    this.seccionActual = seccion;
  }

  
}
