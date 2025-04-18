import { inject, Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, UserCredential } from '@angular/fire/auth';

export interface Credential {
    email: string;
    password: string;
}   

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);

    readonly authState$ = authState(this.auth);

    signUpWithEmailAndPassword(credential: Credential): Promise<UserCredential> {
        return createUserWithEmailAndPassword(this.auth, credential.email, credential.password);
    }

    logInWithEmailAndPassword(credential: Credential): Promise<UserCredential> {
        return signInWithEmailAndPassword(this.auth, credential.email, credential.password);
    }

    logOut(): Promise<void> {
        return this.auth.signOut();
    }

    // Implementación del método signInWithGoogleProvider
    async signInWithGoogleProvider(): Promise<UserCredential> {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(this.auth, provider);
    }
}