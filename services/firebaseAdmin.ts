import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const FIREBASE_CONFIG = {
  credential: cert({
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  }),
};

const firebaseApps = getApps();
export const appAdmin = !firebaseApps.length ? initializeApp(FIREBASE_CONFIG) : firebaseApps[0];
export const authAdmin = getAuth(appAdmin);
export const dbAdmin = getFirestore(appAdmin);
