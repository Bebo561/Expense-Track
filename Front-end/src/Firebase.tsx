// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH_FyWadKBU2soHo_t2QPXNieRzBg2NxI",
  authDomain: "expresstrack-c6bf2.firebaseapp.com",
  projectId: "expresstrack-c6bf2",
  storageBucket: "expresstrack-c6bf2.appspot.com",
  messagingSenderId: "605080118629",
  appId: "1:605080118629:web:81d5e002834d9946e36d8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();