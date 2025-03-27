import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; 

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { firebaseConfig } from '../../firebase.config'; // Importa la configuración


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"pf25-carlos-db","appId":"1:302016834907:web:5738505c9a6f5fd8cb7e7e","storageBucket":"pf25-carlos-db.firebasestorage.app","apiKey":"AIzaSyC6y_F7hO3u7FFOODPaT-m6WqK3DExyxTQ","authDomain":"pf25-carlos-db.firebaseapp.com","messagingSenderId":"302016834907","measurementId":"G-E85ZY92GXM"})), provideAuth(() => getAuth()) 
  ]
};
