// registro.component.ts
import { Component, ViewChild, ElementRef, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios-services/usuarios.service'; 
import { MenuComponent } from '../menu/menu.component'; // Importa el componente MenuComponent
import { Router } from '@angular/router'; // importa Router para la navegación
import { AuthService } from '../../services/auth-services/auth.service'; // importa AuthService para la autenticación


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule,MenuComponent], // agrega el componente MenuComponent a las importaciones
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
  fotoCapturada: boolean = false; // indica si la foto fue capturada desde la camara

  fotoUrl: string | null = null; // almacena la URL de la foto capturada

  

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fotoPreview') fotoPreview!: ElementRef;
  @ViewChild('registroContainer') registroContainer!: ElementRef;

  private desplazarHaciaRegistroContainer(): void {
    window.scrollTo({
      top: document.body.scrollHeight, // Desplaza hasta el final de la página
      behavior: 'smooth' // Desplazamiento suave

    });
    console.log('Desplazando hacia el contenedor de registro...');
  }

  @Output() activarCamara = new EventEmitter<void>();
  @Output() desactivarCamara = new EventEmitter<void>();

  mostrarCamara: boolean = false;
  stream: MediaStream | null = null;

  cargando: boolean = false;

  constructor(private usuariosService: UsuariosService, private cdr: ChangeDetectorRef) {}

  get estadoRegistroContainer(): string {
    if (this.mostrarCamara && !this.fotoCapturada) {
      return 'camara-abierta';
    } else if (this.fotoCapturada) {
      return 'foto-capturada';
    } else {
      return 'estado-inicial';
    }
  }

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

    // registrar al usuario sin la foto
    const usuario = {
      usuario: this.documento_identidad, // usando documento_identidad como nombre de usuario / clave primaria
      nombre: this.nombre,
      email: this.email.toLowerCase(),
      documento_identidad: this.documento_identidad.toUpperCase(), // cambiado dni a documento_identidad
      fecha_nacimiento: this.fechaNacimiento,
      foto: '', // inicialmente vacio
      mensaje: ''
    };

    this.usuariosService.registrarUsuario(usuario).subscribe({
      next: (respuesta) => {
        console.log('Usuario registrado:', respuesta);

        // si hay una foto seleccionada, subirla
        if (this.foto) {
          this.subirFotoUsuario();
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

  subirFotoUsuario() {
    if (!this.foto) {
      console.error('No hay foto seleccionada para subir.');
      return;
    }

    // llamar al método subirFoto del servicio
    this.usuariosService.subirFoto(this.documento_identidad.toUpperCase(), this.foto).subscribe({
      next: (fotoResponse) => {
        console.log('Foto subida:', fotoResponse);

        // actualizar el campo foto del usuario con la URL devuelta
        const updatedData = { foto: fotoResponse.foto };
        this.usuariosService.actualizarUsuario(this.documento_identidad.toUpperCase(), updatedData).subscribe({
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
    this.foto = null; // limpia la foto seleccionada o capturada
    this.fotoCapturada = false; // reinicia el estado de la foto capturada
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.foto = input.files[0];
      this.fotoCapturada = false; // marcar que la foto no fue capturada desde la camara
      console.log('Archivo seleccionado:', this.foto);
    }
  }

  abrirCamara(): Promise<void> {
    console.log('Intentando abrir la cámara...');
    if (this.foto) {
      console.log('Ya hay una foto seleccionada. Eliminando la foto anterior...');
      this.eliminarFoto(); // eliminar la foto anterior
    }
  
    try {
      // limpiar la foto anterior
      if (this.fotoUrl) {
        console.log('Liberando URL de la foto anterior:', this.fotoUrl);
        URL.revokeObjectURL(this.fotoUrl); // borrar la URL anterior
        this.fotoUrl = null; // borrar la URL de la foto
      }
  
      // forzar la limpieza del atributo src del <img>
      if (this.fotoPreview && this.fotoPreview.nativeElement) {
        this.fotoPreview.nativeElement.src = ''; // limpiar el atributo src
        console.log('Atributo src del <img> limpiado.');
      }
  
      this.fotoCapturada = false; // reiniciar el estado de la foto capturada
      this.mostrarCamara = true; // mostrar la camara
      this.cdr.detectChanges(); // forzar la actualización del DOM
  
      // Retrasar el desplazamiento para asegurarse de que el DOM esté actualizado
      setTimeout(() => {
        this.desplazarHaciaRegistroContainer(); // Desplazar la vista
      }, 200); // Ajustar el tiempo si es necesario
  
      console.log('Estado después de limpiar: fotoUrl =', this.fotoUrl, ', fotoCapturada =', this.fotoCapturada);
  
      // acceder a la camara
      return navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480
        }
      }).then((stream) => {
        console.log('Cámara abierta con éxito, stream:', stream);
        this.stream = stream;
  
        this.activarCamara.emit(); // notifica al componente padre que la camara esta activa
  
        // esperar a que el DOM se actualice
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
    // borrar la foto anterior
    if (this.fotoUrl) {
      console.log('Liberando URL de la foto anterior:', this.fotoUrl);
      URL.revokeObjectURL(this.fotoUrl); // borrar la URL anterior
      this.fotoUrl = null; // borrar la URL de la foto
    }
  
    // forzar la limpieza del atributo src del <img>
    if (this.fotoPreview && this.fotoPreview.nativeElement) {
      this.fotoPreview.nativeElement.src = ''; // borrar el atributo src
      console.log('Atributo src del <img> limpiado.');
    }
  
    this.foto = null; // eliminar la foto seleccionada o capturada
    this.fotoCapturada = false; // reiniciar el estado de la foto capturada
  
    // dessseleccionar la foto en caso de que haya sido seleccionada desde el PC/galeria
    const inputFileElement = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (inputFileElement) {
      inputFileElement.value = ''; // reiniciar el valor del input file
      console.log('Input file reiniciado.');
    }
  
    console.log('Foto eliminada.');
  
    // forzar la deteccion de cambios
    this.cdr.detectChanges();
  }

  capturarFoto(): void {
    console.log('Intentando capturar foto...');
    if (this.videoElement && this.canvasElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
  
      // configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log('Canvas configurado: width =', canvas.width, ', height =', canvas.height);
  
      // dibujar el frame actual del video en el canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log('Frame dibujado en el canvas.');
  
        // convertir el canvas a un archivo
        canvas.toBlob((blob) => {
          if (blob) {
            this.foto = new File([blob], 'foto.jpg', { type: 'image/jpeg' });
            this.fotoCapturada = true; // marcar que la foto fue capturada desde la camara
            console.log('Foto capturada:', this.foto);
  
            // crear un enlace temporal para mostrar la imagen
            const url = URL.createObjectURL(blob);
            console.log('URL generada para la foto:', url);
  
            // asignar la URL a la propiedad fotoUrl
            if (this.fotoUrl) {
              console.log('Liberando URL anterior:', this.fotoUrl);
              URL.revokeObjectURL(this.fotoUrl); // borrar la URL anterior
            }
            this.fotoUrl = url;
            console.log('Nueva fotoUrl asignada:', this.fotoUrl);
  
            // cerrar la camara despues de capturar la foto
            this.cerrarCamara();
            this.desplazarHaciaRegistroContainer(); // Desplazar la vista
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
      this.desactivarCamara.emit(); // notifica al componente padre que la camara esta desactivada
    }
    this.mostrarCamara = false; // ocultar la camara
    console.log('Estado después de cerrar la cámara: mostrarCamara =', this.mostrarCamara);
    this.cdr.detectChanges(); // forzar la deteccion de cambios
    this.desplazarHaciaRegistroContainer(); // Desplazar la vista
  }

}