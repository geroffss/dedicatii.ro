import React from 'react';
import { auth, provider } from '../firebaseconfig'; // Adjust the path as necessary
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc} from "firebase/firestore";
import logo from '../logo1.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const Login = () => {
  const handleGoogleSignIn = async () => {
      try {
          const result = await signInWithPopup(auth, provider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          console.log('User Info:', user);
  
          const db = getFirestore();
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
  
          if (!userDoc.exists()) {
              await setDoc(userDocRef, {
                  role: 'charlie'
              });
              window.location.href = '/charlie';
          } else {
              const userData = userDoc.data();
              if (userData.role === 'charlie') {
                  window.location.href = '/charlie';
              } else if (userData.role === 'nova') {
                  window.location.href = '/main';
              }
          }
      } catch (error) {
          console.error('Error during sign-in:', error);
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-[#a856eb] via-[#d64061] to-[#211624]">
    <div className="bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-sm w-full">
      <img className="w-[136px] h-[136px] mx-auto" src={logo} alt="Placeholder" />
      <h1 className="text-4xl font-bold mb-2 text-center text-white">dedicatii.ro</h1>
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-200">Alege-ți melodia preferată și ascult-o în boxele localului</h2>
      <button
  className="w-full border text-white py-3 px-4 rounded-lg flex items-center justify-center"
  onClick={handleGoogleSignIn}
>
  <FontAwesomeIcon icon={faGoogle} className="mr-2" />
  Sign in with Google
</button>
    </div>
  </div>
  );
};

export default Login;