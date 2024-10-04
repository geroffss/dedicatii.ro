import React, { useState } from 'react';
import { auth } from '../firebaseconfig'; // Adjust the path as necessary
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import '../pages/login.css'; // Adjust the path as necessary
import LoginBotBar from './loginBotBar';
import img from '../imgs/developed-with-youtube-sentence-case-light.png'; // Adjust the path as necessary

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
            <div className="absolute h-screen top-0 left-0 w-max shadow-lg z-30 bg-dedicatii-bg3">
                <div className="font-inter flex h-full w-full flex-shrink-0 gap-5 flex-col items-center overflow-clip text-start font-medium text-white p-2">
                    <h1 className="w-full text-center text-2xl font-bold mb-4">Login Restaurant</h1>

                    <button className="gsi-material-button" onClick={handleGoogleSignIn}>
                        <div className="gsi-material-button-state"></div>
                        <div className="gsi-material-button-content-wrapper">
                            <div className="gsi-material-button-icon">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                </svg>
                            </div>
                            <span className="gsi-material-button-contents">Sign in with Google</span>
                            <span style={{ display: 'none' }}>Sign in with Google</span>
                        </div>
                    </button>

                    <div className="flex-grow"></div> {/* Spacer to push LoginBotBar to the bottom */}
                    <LoginBotBar />
                </div>
            </div>
        )
    );
};

export default HamburgerMenuLogin;