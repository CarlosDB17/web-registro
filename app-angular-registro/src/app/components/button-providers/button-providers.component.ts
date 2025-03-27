import { Component, inject, Provider } from '@angular/core';
import { Auth, AuthProvider, GoogleAuthProvider, UserCredential, authState, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { AuthService } from '../../services/auth-services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button-providers',
  standalone: true,
  imports: [],
  templateUrl: './button-providers.component.html',
  styleUrl: './button-providers.component.scss'
})
export class ButtonProvidersComponent {
  googleLogoUrl = 'https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp';
  private _authService = inject(AuthService);
  private _router = inject(Router);

  providerAction(provider: string): void {
    if (provider === 'google') {
      this.signUpWithGoogle();
    }
  }

  async signUpWithGoogle() {
    try {
      const result = await this._authService.signInWithGoogleProvider();
      this._router.navigate(['/']);
    } catch (error) {
      console.log('Error al iniciar sesión con Google:', error);
    }
  }
}