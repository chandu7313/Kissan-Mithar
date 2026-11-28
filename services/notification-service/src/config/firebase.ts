import admin from 'firebase-admin';
import { env } from './env.js';

let firebaseApp: admin.app.App | null = null;

export const initFirebase = () => {
  if (firebaseApp) return firebaseApp;
  if (env.MOCK_FIREBASE_AUTH || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
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
  } catch {
    // Non-fatal in mock/sandbox
  }

  return firebaseApp;
};

export const getFirebaseMessaging = () => {
  if (!firebaseApp) initFirebase();
  return firebaseApp ? admin.messaging() : null;
};
