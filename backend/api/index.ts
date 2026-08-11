import { createApp } from '../src/app.js';
import { initFirebase } from '../src/config/firebase.js';

// Initialize Firebase for serverless environment
try {
  initFirebase();
} catch (error) {
  console.error('Firebase initialization error in Vercel:', error);
}

// Create the Express app
const app = createApp();

// Export the app for Vercel
export default app;
