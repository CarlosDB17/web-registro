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
  
  // controla si se está procesando los datos
  verificandoDatos: boolean = false;

  // mensaje de verificación
  mensajeVerificacion: string = '';

  // Bandera para rastrear si hay un escaneo en proceso
  escaneandoQR: boolean = false;

  // datos del usuario escaneado
  userData: any = null;

  // referencia al contenedor de resultados
  @ViewChild('resultadoContainer') resultadoContainer!: ElementRef;

  // último código QR procesado
  ultimoCodigoProcesado: string | null = null;

  // bandera para evitar procesar múltiples códigos en intervalos cortos
  procesando: boolean = false;

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
    // Inicializa el escáner al cargar el componente
    this.scannerEnabled = true;
  }

  // método para desplazar la pantalla hacia los resultados
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

  // método que maneja el cambio de dispositivo de cámara
  onDeviceSelectChange(): void {
    console.log('Dispositivo cambiado:', this.selectedDevice);
  }

  // método para reanudar el escáner
  reanudarEscaner(): void {
    this.scannerEnabled = true;
    this.leyendoQR = false;
    this.escaneandoQR = false;
    this.mostrarResultado = false; // Ocultar los datos del usuario
    this.mensaje = null;
    this.error = false;
    this.userData = null;
    this.verificandoDatos = false;
    this.mensajeVerificacion = '';
    this.cdr.detectChanges();
  }

  // método para escanear otro código QR
  escanearOtro(): void {
    this.mostrarResultado = false;
    this.scannerEnabled = true;
    this.mensaje = null;
    this.error = false;
    this.userData = null;
    this.leyendoQR = false;
    this.escaneandoQR = false;
    this.verificandoDatos = false;
    this.mensajeVerificacion = '';
    this.cdr.detectChanges();
  }

  // Se ejecuta cuando se encuentra un código QR pero aún no se ha procesado completamente
  onScanComplete(result: any): void {
    // Verificar si el resultado es válido y no estamos ya procesando un escaneo
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
    // Validar si el código QR ya fue procesado
    if (this.ultimoCodigoProcesado === result) {
      console.log('Código QR ya procesado, ignorando...');
      return;
    }

    // Evitar procesar múltiples códigos en intervalos cortos
    if (this.procesando) {
      console.log('Ya se está procesando un código QR, ignorando...');
      return;
    }

    // Validar el formato del código QR
    if (!this.esCodigoQRValido(result)) {
      console.log('Código QR no válido, ignorando...');
      return;
    }

    // Marcar como procesando y almacenar el último código procesado
    this.procesando = true;
    this.ultimoCodigoProcesado = result;

    // Procesar el código QR
    this.procesarCodigoQR(result);

    // Reanudar el escáner después de un tiempo
    setTimeout(() => {
      this.procesando = false;
    }, 2000); // Evitar procesar por 2 segundos
  }

  esCodigoQRValido(codigo: string): boolean {
    try {
      const data = JSON.parse(codigo);
      return data && data.nombre && data.email && data.documento_identidad && data.fecha_nacimiento;
    } catch {
      return false;
    }
  }

  procesarCodigoQR(result: string): void {
    console.log('Procesando código QR:', result);
    // Pausar el escáner temporalmente
    this.scannerEnabled = false; 

    try {
      const scannedUserData = JSON.parse(result);
      this.userData = scannedUserData;

      if (scannedUserData.nombre && scannedUserData.email && scannedUserData.documento_identidad && scannedUserData.fecha_nacimiento) {
        // Mostrar los datos y cambiar el estado a "verificando datos"
        this.mostrarResultado = true;
        this.leyendoQR = false;
        this.verificandoDatos = true;
        this.mensajeVerificacion = 'Comprobando datos del QR...';
        this.cdr.detectChanges();
        this.desplazarHaciaResultados();

        // Pequeña pausa para mostrar el mensaje "Comprobando datos del QR..."
        setTimeout(() => {
          // Verificar si el usuario ya existe
          this.verificandoDatos = true;
          this.mensajeVerificacion = 'Verificando si el usuario ya está registrado...';
          this.cdr.detectChanges();
          
          this.usuariosService.verificarUsuarioExistente(scannedUserData.documento_identidad).subscribe({
            next: (existeUsuario) => {
              if (existeUsuario) {
                // El usuario ya existe
                this.mensaje = "Este usuario ya ha sido registrado anteriormente";
                this.error = true;
                this.verificandoDatos = false;
                this.mensajeVerificacion = '';
                console.log('Usuario ya registrado:', scannedUserData);
              } else {
                // Registrar al usuario
                this.verificandoDatos = true;
                this.mensajeVerificacion = 'Registrando usuario...';
                this.cdr.detectChanges();
                
                this.usuariosService.registrarUsuario(scannedUserData).subscribe({
                  next: () => {
                    this.mensaje = 'Usuario registrado correctamente';
                    this.error = false;
                    this.verificandoDatos = false;
                    this.mensajeVerificacion = '';
                  },
                  error: () => {
                    this.mensaje = 'Error al registrar usuario';
                    this.error = true;
                    this.verificandoDatos = false;
                    this.mensajeVerificacion = '';
                  }
                });
              }
              // No reactivamos el scanner aquí para que el usuario pueda ver los resultados
            },
            error: () => {
              this.mensaje = 'Error al verificar usuario';
              this.error = true;
              this.verificandoDatos = false;
              this.mensajeVerificacion = '';
            }
          });
        }, 800); // Mostrar el mensaje "Comprobando datos del QR..." durante 800ms
      } else {
        // Datos incompletos en el QR
        this.mensaje = 'El QR no contiene todos los datos requeridos';
        this.error = true;
        this.mostrarResultado = true;
        this.leyendoQR = false;
        this.verificandoDatos = false;
        this.mensajeVerificacion = '';
        this.cdr.detectChanges();
        this.desplazarHaciaResultados();
      }
    } catch (error) {
      // QR no válido
      console.error('Error al procesar el QR:', error);
      this.mensaje = 'El QR no es válido';
      this.error = true;
      this.mostrarResultado = true;
      this.leyendoQR = false;
      this.verificandoDatos = false;
      this.mensajeVerificacion = '';
      this.cdr.detectChanges();
      this.desplazarHaciaResultados();
    }
  }
}