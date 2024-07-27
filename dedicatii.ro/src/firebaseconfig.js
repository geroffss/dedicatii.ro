// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjwUYt26McQIYlbHlRHABejWGSZI8GlgQ",
  authDomain: "dedicatiiro-86d49.firebaseapp.com",
  projectId: "dedicatiiro-86d49",
  storageBucket: "dedicatiiro-86d49.appspot.com",
  messagingSenderId: "959075779166",
  appId: "1:959075779166:web:ba9a34415cab42c6fbeacf",
  measurementId: "G-ZS1MRGTKVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };