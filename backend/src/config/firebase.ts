import admin from 'firebase-admin';
import { env } from './env.js';

let firebaseApp: admin.app.App | null = null;

export const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  if (env.MOCK_FIREBASE_AUTH) {
    console.log('[Firebase] Running in mock/development mode (Firebase Admin bypass active)');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY,
      }),
    });
    console.log('[Firebase] Admin SDK initialized successfully');
  } catch (error) {
    console.warn('[Firebase] Warning: Failed to initialize Admin SDK, falling back to mock mode:', error);
  }

  return firebaseApp;
};

export const getFirebaseMessaging = () => {
  if (!firebaseApp) {
    initFirebase();
  }
  if (!firebaseApp) return null;
  return admin.messaging();
};

export const getFirebaseAuth = () => {
  if (!firebaseApp) {
    initFirebase();
  }
  if (!firebaseApp) return null;
  return admin.auth();
};
