import { FirebaseApp, initializeApp } from "firebase/app";
import { AppCheck, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { Auth, getAuth } from "firebase/auth";
import { collection, doc, Firestore, getFirestore } from "firebase/firestore";

const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export let app: FirebaseApp;
export let auth: Auth;
export let db: Firestore;
export let appCheck: AppCheck;

if (typeof window !== "undefined") {
  app = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_GRECAPTCHA_SITE_KEY as string),
    isTokenAutoRefreshEnabled: true,
  });
  db = getFirestore(app);
}

export const generateUid = () => doc(collection(db, "uid")).id;
