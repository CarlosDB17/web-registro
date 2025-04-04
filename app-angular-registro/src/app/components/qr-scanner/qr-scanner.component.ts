import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
export class QrScannerComponent implements OnInit, AfterViewInit {
  // formatos de codigo de barras soportados (en este caso solo qr)
  formats = [BarcodeFormat.QR_CODE];

  // mensaje para mostrar al usuario (exito o error)
  mensaje: string | null = null;
  error: boolean = false;

  // lista de dispositivos de camara disponibles
  availableDevices: MediaDeviceInfo[] = [];

  // dispositivo de camara seleccionado
  selectedDevice: MediaDeviceInfo | undefined;

  // controla si se muestra el contenedor de resultados
  mostrarResultado: boolean = false;

  // controla si el scanner está habilitado o no
  scannerEnabled: boolean = true;

  // controla si se está leyendo un QR
  leyendoQR: boolean = false;

  // boolean para rastrear si hay un escaneo en proceso
  escaneandoQR: boolean = false;

  // datos del usuario escaneado
  userData: any = null;

  // referencia al contenedor de resultados
  @ViewChild('resultadoContainer') resultadoContainer!: ElementRef;

  constructor(
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

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

  ngAfterViewInit(): void {
    // inicializa el escáner al cargar el componente
    this.scannerEnabled = true;
  }

  // metodo para desplazar la pantalla hacia los resultados
  desplazarHaciaResultados(): void {
    setTimeout(() => {
      if (this.resultadoContainer && this.resultadoContainer.nativeElement) {
        this.resultadoContainer.nativeElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  }

  // metodo que maneja el cambio de dispositivo de cámara
  onDeviceSelectChange(): void {
    console.log('Dispositivo cambiado:', this.selectedDevice);
  }

  // metodo para reanudar el escáner
  reanudarEscaner(): void {
    this.scannerEnabled = true;
    this.leyendoQR = false;
    this.escaneandoQR = false;
    this.cdr.detectChanges();
  }

  // metodo para escanear otro código QR
  escanearOtro(): void {
    this.mostrarResultado = false;
    this.scannerEnabled = true;
    this.mensaje = null;
    this.error = false;
    this.userData = null;
    this.leyendoQR = false;
    this.escaneandoQR = false;
    this.cdr.detectChanges();
  }

  // se ejecuta cuando se encuentra un código QR pero aún no se ha procesado completamente
  onScanComplete(result: any): void {
    console.log('onScanComplete called', result);

    // verificar si el resultado es válido y no estamos ya procesando un escaneo
    if (result && result.getText && !this.escaneandoQR && !this.mostrarResultado) {
      this.leyendoQR = true;
      this.cdr.detectChanges();
    } else {
      // Si no hay un resultado válido, asegurarse de que el mensaje "Leyendo QR..." no se muestre
      this.leyendoQR = false;
      this.cdr.detectChanges();
    }
  }

  // Se ejecuta cuando se encuentra un error al escanear
  onScanError(error: any): void {
    console.error('Error de escaneo:', error);
    this.leyendoQR = false;
    this.escaneandoQR = false;
    this.cdr.detectChanges();
  }

  // Se ejecuta cuando se encuentran cámaras disponibles
  onCamerasFound(devices: MediaDeviceInfo[]): void {
    console.log('Cámaras encontradas:', devices);
  }

  // método que define la clase CSS para el contenedor
  get estadoScannerContainer(): string {
    return this.mostrarResultado ? 'mostrar-resultados' : 'estado-inicial';
  }

  // metodo que se ejecuta cuando se escanea un codigo qr
  onCodeResult(result: string): void {
    console.log('onCodeResult called', result);
    // Evitar múltiples escaneos simultáneos
    if (this.escaneandoQR) {
      console.log('Ya hay un escaneo en proceso. Ignorando este escaneo.');
      return;
    }

    // Marcar que estamos procesando un escaneo
    this.escaneandoQR = true;
    
    // Pausar el escáner para evitar múltiples escaneos
    this.scannerEnabled = false;

    try {
      // intenta parsear el contenido del qr como un objeto json
      const scannedUserData = JSON.parse(result);
      this.userData = scannedUserData;

      // verifica que el objeto contenga los campos necesarios
      if (scannedUserData.nombre && scannedUserData.email && scannedUserData.documento_identidad && scannedUserData.fecha_nacimiento) {
        // mostrar los datos y resultados
        this.mostrarResultado = true;
        this.leyendoQR = false; // Ocultar mensaje de lectura
        this.cdr.detectChanges(); // forzar la detección de cambios
        this.desplazarHaciaResultados();
        
        // verificar primero si el usuario ya existe
        this.usuariosService.verificarUsuarioExistente(scannedUserData.documento_identidad).subscribe({
          next: (existeUsuario) => {
            if (existeUsuario) {
              // el usuario ya existe
              this.mensaje = "Este usuario ya ha sido registrado anteriormente";
              this.error = true;
              console.log('Usuario ya registrado:', scannedUserData);
            } else {
              // registra al usuario usando el servicio de usuarios
              this.usuariosService.registrarUsuario(scannedUserData).subscribe({
                next: (response) => {
                  console.log('Usuario registrado con éxito:', response);
                  this.mensaje = 'Usuario registrado correctamente';
                  this.error = false;
                },
                error: (error) => {
                  console.error('Error al registrar usuario:', error);
                  this.mensaje = 'Error al registrar usuario';
                  this.error = true;
                }
              });
            }
            // Finalizar el proceso de escaneo
            this.escaneandoQR = false;
          },
          error: (error) => {
            console.error('Error al verificar usuario existente:', error);
            this.mensaje = 'Error al verificar usuario';
            this.error = true;
            this.escaneandoQR = false;
          }
        });
      } else {
        // muestra un mensaje si el qr no contiene todos los datos requeridos
        this.mensaje = 'El QR no contiene todos los datos requeridos';
        this.error = true;
        this.mostrarResultado = true;
        this.leyendoQR = false; // Ocultar mensaje de lectura
        this.escaneandoQR = false;
        this.cdr.detectChanges();
        this.desplazarHaciaResultados();
      }
    } catch (error) {
      // maneja errores si el contenido del qr no es un json válido
      console.error('Error al procesar el QR:', error);
      this.mensaje = 'El QR no es válido';
      this.error = true;
      this.mostrarResultado = true;
      this.leyendoQR = false; // Ocultar mensaje de lectura
      this.escaneandoQR = false;
      this.cdr.detectChanges();
      this.desplazarHaciaResultados();
    }
  }
}