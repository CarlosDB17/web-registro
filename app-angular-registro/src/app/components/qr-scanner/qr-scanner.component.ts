import { Component, OnInit } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [ZXingScannerModule, CommonModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit {
  formats = [BarcodeFormat.QR_CODE];
  mensaje: string | null = null;
  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    // Obtener la lista de dispositivos de cámara
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      this.availableDevices = devices.filter((device) => device.kind === 'videoinput');
      if (this.availableDevices.length > 0) {
        this.selectedDevice = this.availableDevices[0]; // Seleccionar la primera cámara por defecto
      }
    });
  }

  onCodeResult(result: string): void {
    try {
      const userData = JSON.parse(result);

      if (userData.nombre && userData.email && userData.dni && userData.fecha_nacimiento) {
        this.usuariosService.registrarUsuario(userData).subscribe({
          next: (response) => {
            console.log('Usuario registrado con éxito:', response);
            this.mensaje = 'Usuario registrado con éxito';
            setTimeout(() => (this.mensaje = null), 5000);
          },
          error: (error) => {
            console.error('Error al registrar usuario:', error);
            this.mensaje = 'Error al registrar usuario';
            setTimeout(() => (this.mensaje = null), 5000);
          }
        });
      } else {
        this.mensaje = 'El QR no contiene datos válidos';
        setTimeout(() => (this.mensaje = null), 5000);
      }
    } catch (error) {
      console.error('Error al procesar el QR:', error);
      this.mensaje = 'El QR no es válido';
      setTimeout(() => (this.mensaje = null), 5000);
    }
  }
}