import { Component, OnInit } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { UsuariosService } from '../../services/usuarios-services/usuarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [ZXingScannerModule, CommonModule, FormsModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit {
  // formatos de codigo de barras soportados (en este caso solo qr)
  formats = [BarcodeFormat.QR_CODE];

  // mensaje para mostrar al usuario (exito o error)
  mensaje: string | null = null;

  // lista de dispositivos de camara disponibles
  availableDevices: MediaDeviceInfo[] = [];

  // dispositivo de camara seleccionado
  selectedDevice: MediaDeviceInfo | undefined;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    // obtiene la lista de dispositivos de camara disponibles
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      // filtra los dispositivos para obtener solo los de tipo "videoinput" (camaras)
      this.availableDevices = devices.filter((device) => device.kind === 'videoinput');

      // selecciona la primera camara disponible por defecto
      if (this.availableDevices.length > 0) {
        this.selectedDevice = this.availableDevices[0];
      }
    });
  }

  // metodo que se ejecuta cuando se escanea un codigo qr
  onCodeResult(result: string): void {
    try {
      // intenta parsear el contenido del qr como un objeto json
      const userData = JSON.parse(result);

      // verifica que el objeto contenga los campos necesarios
      if (userData.nombre && userData.email && userData.documento_identidad && userData.fecha_nacimiento) {
        // registra al usuario usando el servicio de usuarios
        this.usuariosService.registrarUsuario(userData).subscribe({
          next: (response) => {
            console.log('usuario registrado con exito:', response);
            this.mensaje = 'Usuario registrado con exito';
            // limpia el mensaje despues de 10 segundos
            setTimeout(() => (this.mensaje = null), 10000);
          },
          error: (error) => {
            console.error('error al registrar usuario:', error);
            this.mensaje = 'error al registrar usuario';
            // limpia el mensaje despues de 10 segundos
            setTimeout(() => (this.mensaje = null), 10000);
          }
        });
      } else {
        // muestra un mensaje si el qr no contiene datos validos
        this.mensaje = 'El QR no contiene datos validos';
        setTimeout(() => (this.mensaje = null), 10000);
      }
    } catch (error) {
      // maneja errores si el contenido del qr no es un json valido
      console.error('error al procesar el qr:', error);
      this.mensaje = 'El QR no es válido';
      setTimeout(() => (this.mensaje = null), 10000);
    }
  }
}