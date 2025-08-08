import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';

// It's important to check if the app is already initialized to avoid errors.
let app: App;

if (!getApps().length) {
  const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG_BASE64
    ? Buffer.from(process.env.FIREBASE_ADMIN_SDK_CONFIG_BASE64, 'base64').toString('utf-8')
    : '{}';

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Error parsing Firebase Admin SDK config:', error);
    // Fallback to a default app if initialization fails, though it will likely not work.
    // This prevents the server from crashing on startup if the config is missing/invalid.
    app = initializeApp();
  }

} else {
  app = getApp();
}

export { app };
