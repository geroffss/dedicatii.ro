import React, { useState } from 'react';
import { auth } from '../firebaseconfig'; // Adjust the path as necessary
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const HamburgerMenuLogin = ({ isOpen, toggleMenu, handleCategoriesClick }) => {
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
        isOpen && (
            <div className="absolute h-screen top-0 left-0 w-max shadow-lg z-30 bg-dedicatii-bg3 p-2">
                <div className="font-inter flex h-full w-full flex-shrink-0 flex-col items-center overflow-clip text-start font-medium text-white">
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
                            Login Restaurant
                        </>
                    )}
                </button>
                </div>
            </div>
        )
    );
};

export default HamburgerMenuLogin;
