import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideServiceWorker } from '@angular/service-worker';

const firebaseConfig = {
  apiKey: 'AIzaSyC_vNyLX8GRh6Elli26swC4EUNj2jrCtGY',
  authDomain: 'namaz-tracker-5bc01.firebaseapp.com',
  projectId: 'namaz-tracker-5bc01',
  storageBucket: 'namaz-tracker-5bc01.firebasestorage.app',
  messagingSenderId: '389367813862',
  appId: '1:389367813862:web:66636c817bb32b627f8d27',
  measurementId: 'G-N02YGQ4NES',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]), // Angular SSR motoru hata vermesin diye boş bir yönlendirme verdik
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
