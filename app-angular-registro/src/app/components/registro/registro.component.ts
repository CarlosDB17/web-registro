// registro.component.ts
import { Component, ViewChild, ElementRef, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios-services/usuarios.service'; 

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  nombre: string = '';
  email: string = '';
  documento_identidad: string = ''; // cambiado de dni a documentoIdentidad
  fechaNacimiento: string = '';
  mensaje: string = '';
  error: string = '';
  foto: File | null = null;
  fotoCapturada: boolean = false; // Indica si la foto fue capturada desde la cámara

  fotoUrl: string | null = null; // Almacena la URL de la foto capturada

  

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fotoPreview') fotoPreview!: ElementRef;


  @Output() activarCamara = new EventEmitter<void>();
  @Output() desactivarCamara = new EventEmitter<void>();

  mostrarCamara: boolean = false;
  stream: MediaStream | null = null;

  cargando: boolean = false;

  constructor(private usuariosService: UsuariosService, private cdr: ChangeDetectorRef) {}

  registrarUsuario() {
    if (!this.nombre || !this.email || !this.documento_identidad || !this.fechaNacimiento) {
      this.error = 'Por favor complete todos los campos';

      // reinicia la clase shake para que la animacion se reproduzca nuevamente
      this.activarShake();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    // Registrar al usuario sin la foto
    const usuario = {
      usuario: this.documento_identidad, // usando documento_identidad como nombre de usuario / clave primaria
      nombre: this.nombre,
      email: this.email.toLowerCase(),
      documento_identidad: this.documento_identidad.toUpperCase(), // cambiado dni a documento_identidad
      fecha_nacimiento: this.fechaNacimiento,
      foto: '', // Inicialmente vacío
      mensaje: ''
    };

    this.usuariosService.registrarUsuario(usuario).subscribe({
      next: (respuesta) => {
        console.log('Usuario registrado:', respuesta);

        // Si hay una foto seleccionada, subirla
        if (this.foto) {
          this.usuariosService.subirFoto(this.documento_identidad, this.foto).subscribe({
            next: (fotoResponse) => {
              console.log('Foto subida:', fotoResponse);

              // Actualizar el campo foto del usuario con la URL devuelta
              const updatedData = { foto: fotoResponse.foto };
              this.usuariosService.actualizarUsuario(this.documento_identidad, updatedData).subscribe({
                next: () => {
                  console.log('Campo foto actualizado correctamente');
                  this.mensaje = 'Usuario registrado correctamente con foto';
                  this.limpiarFormulario();
                  this.cargando = false;
                },
                error: (err) => {
                  console.error('Error al actualizar el campo foto:', err);
                  this.error = 'Usuario registrado, pero hubo un error al asociar la foto.';
                  this.cargando = false;
                }
              });
            },
            error: (err) => {
              console.error('Error al subir la foto:', err);
              this.error = 'Usuario registrado, pero hubo un error al subir la foto.';
              this.cargando = false;
            }
          });
        } else {
          this.mensaje = 'Usuario registrado correctamente';
          this.limpiarFormulario();
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.error = err.error?.detail ?? 'Error al registrar usuario. Por favor intente nuevamente.';
        this.cargando = false;

        // reinicia la clase shake para que la animacion se reproduzca nuevamente
        this.activarShake();
      }
    });
  }

  activarShake() {
    const formElement = document.querySelector('.registro-form');
    if (formElement) {
      formElement.classList.remove('shake'); // elimina la clase si ya existe
      void (formElement as HTMLElement).offsetWidth; // fuerza el reflujo para reiniciar la animacion
      formElement.classList.add('shake'); // agrega la clase nuevamente
    }
  }

  limpiarFormulario() {
    this.nombre = '';
    this.email = '';
    this.documento_identidad = ''; 
    this.fechaNacimiento = '';
    this.foto = null; // Limpia la foto seleccionada o capturada
    this.fotoCapturada = false; // Reinicia el estado de la foto capturada
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.foto = input.files[0];
      this.fotoCapturada = false; // Marcar que la foto no fue capturada desde la cámara
      console.log('Archivo seleccionado:', this.foto);
    }
  }

  abrirCamara(): Promise<void> {
    console.log('Intentando abrir la cámara...');
    if (this.foto) {
      alert('Ya hay una foto seleccionada. Por favor, elimínela antes de abrir la cámara.');
      return Promise.resolve(); // Salir del método si ya hay una foto seleccionada
    }
  
    try {
      // Limpiar la foto anterior
      if (this.fotoUrl) {
        console.log('Liberando URL de la foto anterior:', this.fotoUrl);
        URL.revokeObjectURL(this.fotoUrl); // Liberar la URL anterior
        this.fotoUrl = null; // Limpiar la URL de la foto
      }
  
      // Forzar la limpieza del atributo src del <img>
      if (this.fotoPreview && this.fotoPreview.nativeElement) {
        this.fotoPreview.nativeElement.src = ''; // Limpiar el atributo src
        console.log('Atributo src del <img> limpiado.');
      }
  
      this.fotoCapturada = false; // Reiniciar el estado de la foto capturada
      this.mostrarCamara = true; // Mostrar la cámara
      this.cdr.detectChanges(); // Forzar la actualización del DOM
      console.log('Estado después de limpiar: fotoUrl =', this.fotoUrl, ', fotoCapturada =', this.fotoCapturada);
  
      // Acceder a la cámara
      return navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480
        }
      }).then((stream) => {
        console.log('Cámara abierta con éxito, stream:', stream);
        this.stream = stream;
  
        this.activarCamara.emit(); // Notifica al componente padre que la cámara está activa
  
        // Esperar a que el DOM se actualice
        setTimeout(() => {
          if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.srcObject = this.stream;
            console.log('Stream asignado al elemento <video>.');
          }
        });
      }).catch((error) => {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Por favor, asegúrese de dar los permisos necesarios.');
      });
    } catch (error) {
      console.error('Error inesperado al abrir la cámara:', error);
      return Promise.reject(error);
    }
  }
  
  eliminarFoto(): void {
    if (this.fotoUrl) {
      console.log('Liberando URL de la foto:', this.fotoUrl);
      URL.revokeObjectURL(this.fotoUrl); // Liberar la URL de la foto
      this.fotoUrl = null;
    }
    this.foto = null; // Eliminar la foto seleccionada
    this.fotoCapturada = false; // Reiniciar el estado de la foto capturada
    console.log('Foto eliminada.');
  }

  capturarFoto(): void {
    console.log('Intentando capturar foto...');
    if (this.videoElement && this.canvasElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
  
      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log('Canvas configurado: width =', canvas.width, ', height =', canvas.height);
  
      // Dibujar el frame actual del video en el canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log('Frame dibujado en el canvas.');
  
        // Convertir el canvas a un archivo
        canvas.toBlob((blob) => {
          if (blob) {
            this.foto = new File([blob], 'foto.jpg', { type: 'image/jpeg' });
            this.fotoCapturada = true; // Marcar que la foto fue capturada desde la cámara
            console.log('Foto capturada:', this.foto);
  
            // Crear un enlace temporal para mostrar la imagen
            const url = URL.createObjectURL(blob);
            console.log('URL generada para la foto:', url);
  
            // Asignar la URL a la propiedad fotoUrl
            if (this.fotoUrl) {
              console.log('Liberando URL anterior:', this.fotoUrl);
              URL.revokeObjectURL(this.fotoUrl); // Liberar la URL anterior
            }
            this.fotoUrl = url;
            console.log('Nueva fotoUrl asignada:', this.fotoUrl);
  
            // Cerrar la cámara después de capturar la foto
            this.cerrarCamara();
          } else {
            console.error('No se pudo generar el blob de la foto.');
          }
        }, 'image/jpeg', 0.95);
      } else {
        console.error('No se pudo obtener el contexto del canvas.');
      }
    } else {
      console.error('Elementos videoElement o canvasElement no disponibles.');
    }
  }

  cerrarCamara(): void {
    console.log('Intentando cerrar la cámara...');
    if (this.stream) {
      console.log('Deteniendo tracks del stream...');
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('Stream detenido.');
      this.desactivarCamara.emit(); // Notifica al componente padre que la cámara está desactivada
    }
    this.mostrarCamara = false; // Asegúrate de que esta propiedad se actualice
    console.log('Estado después de cerrar la cámara: mostrarCamara =', this.mostrarCamara);
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

}