import { Component } from '@angular/core';

@Component({
  selector: 'app-button-providers',
  standalone: true,
  imports: [],
  templateUrl: './button-providers.component.html',
  styleUrl: './button-providers.component.scss'
})
export class ButtonProvidersComponent {
  googleLogoUrl = 'https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp';

  onGoogleLogin() {
    // Lógica de autenticación con Google
    console.log('Iniciando sesión con Google');
  }

}