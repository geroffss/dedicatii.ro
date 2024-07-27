import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from '../firebaseconfig';

const Login = () => {
  const handleGoogleLogin = async () => {
	const auth = getAuth(app);
	const provider = new GoogleAuthProvider();
	try {
	  await signInWithPopup(auth, provider);
	  alert('Logged in successfully!');
	} catch (error) {
	  console.error('Error during login:', error);
	  alert('Login failed. Please try again.');
	}
  };

  return (
	<div className="flex items-center justify-center min-h-screen bg-gray-100">
	  <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
		<h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
		<button
		  onClick={handleGoogleLogin}
		  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
		>
		  Sign in with Google
		</button>
	  </div>
	</div>
  );
};

export default Login;