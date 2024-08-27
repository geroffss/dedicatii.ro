// firebaseconfig.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBjwUYt26McQIYlbHlRHABejWGSZI8GlgQ',
  authDomain: 'dedicatiiro-86d49.firebaseapp.com',
  databaseURL:
    'https://dedicatiiro-86d49-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'dedicatiiro-86d49',
  storageBucket: 'dedicatiiro-86d49.appspot.com',
  messagingSenderId: '959075779166',
  appId: '1:959075779166:web:ba9a34415cab42c6fbeacf',
  measurementId: 'G-ZS1MRGTKVL',
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

export { app, analytics, auth, provider, database };
