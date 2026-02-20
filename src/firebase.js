// 1. Importiamo le funzioni base
import { initializeApp } from "firebase/app";

// 2. Importiamo i pezzi che ci servono per la ferramenta (Database e Login)
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// La tua configurazione (quella che mi hai incollato sopra)
const firebaseConfig = {
  apiKey: "AIzaSyBDbar-dcV883mprIi8csfFtY3bCpUId0U",
  authDomain: "ferramenta-pwa-ae73a.firebaseapp.com",
  projectId: "ferramenta-pwa-ae73a",
  storageBucket: "ferramenta-pwa-ae73a.firebasestorage.app",
  messagingSenderId: "630346449465",
  appId: "1:630346449465:web:c16df10875e5beed2143e8"
};

// 3. Inizializziamo l'app
const app = initializeApp(firebaseConfig);

// 4. Esportiamo le costanti per usarle in tutta l'app (fondamentale!)
export const db = getFirestore(app);
export const auth = getAuth(app);