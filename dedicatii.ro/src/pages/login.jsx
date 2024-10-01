import React, { useState } from 'react';
import { auth } from '../firebaseconfig'; // Adjust the path as necessary
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import logo from '../logo1.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import LoginTopBar from '../components/loginTopBar';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
    provider.addScope('https://www.googleapis.com/auth/youtube.force-ssl');
const handleGoogleSignIn = async () => {
  setLoading(true);
  setError(null);

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;
    console.log(credential);
    console.log(result.user);
    const refreshToken = result.user.refreshToken;
    const user = result.user;

    // Calculate token expiration (default to 1 hour if not provided)
    const expiresIn = credential.expirationTime ? credential.expirationTime : 3600;
    const expirationTime = Date.now() + expiresIn * 1000;

    console.log('User Info:', user);

    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        role: 'charlie',
        email: user.email,
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

    const realtimeDb = getDatabase();
    const tokenRef = ref(realtimeDb, `nova/${user.uid}/token`);
    await set(tokenRef, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expirationTime: expirationTime
    });
    console.log('Access Token, Refresh Token, and Expiration Time successfully set in Realtime Database');

    fetchYouTubeData(accessToken);

  } catch (error) {
    console.error('Error during sign-in:', error);
    setError('Failed to sign in. Please try again.');
  } finally {
    setLoading(false);
  }
};

    const fetchYouTubeData = async (token) => {
        try {
            const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch YouTube data');
            }

            const data = await response.json();
            console.log('YouTube Channel Data:', data);
        } catch (error) {
            console.error('Error fetching YouTube data:', error);
            setError('Failed to fetch YouTube data. Please try again.');
        }
    };

    return (
        <div className="flex items-center flex-col justify-center min-h-screen bg-gradient-to-bl from-[#a856eb] via-[#d64061] to-[#211624]">
            <LoginTopBar />
            <div className="bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-sm w-full">
                <img className="w-[136px] h-[136px] mx-auto" src={logo} alt="Dedicații.ro logo" />
                <h1 className="text-4xl font-bold mb-2 text-center text-white">Dedicații.ro</h1>
                <h2 className="text-xl font-semibold mb-6 text-center text-gray-200">Piesa ta în boxa mea</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <button
                    className={`w-full text-white py-3 px-4 rounded-lg flex items-center justify-center ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} ${loading ? 'cursor-not-allowed' : ''}`}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    {loading ? (
                        <span>Loading...</span>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faGoogle} className="mr-2" />
                            Login Client
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Login;
