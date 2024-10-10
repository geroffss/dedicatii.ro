import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import logo from '../logo1.svg';
import LoginTopBar from '../components/loginTopBar';
import LoginBotBar from '../components/loginBotBar';
import './login.css';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const auth = getAuth();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const redirect = urlParams.get('redirect');
        if (redirect) {
            localStorage.setItem('redirectAfterLogin', redirect);
        }
    }, [location]);

                const handleGoogleSignIn = async () => {
            setLoading(true);
            setError(null);
        
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
        
                console.log('User Info:', user);
        
                const db = getFirestore();
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
        
                if (!userDoc.exists()) {
                    await setDoc(userDocRef, {
                        role: 'charlie',
                        email: user.email,
                    });
                }
        
                const realtimeDb = getDatabase();
                const userRef = ref(realtimeDb, `nova/${user.uid}`);
                await set(userRef, {
                    email: user.email,
                    displayName: user.displayName,
                    lastLogin: new Date().toISOString()
                });
                console.log('User data successfully set in Realtime Database');
        
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    const userData = userDoc.exists() ? userDoc.data() : { role: 'charlie' };
                    if (userData.role === 'charlie') {
                        navigate('/charlie');
                    } else if (userData.role === 'nova') {
                        navigate('/main');
                    }
                }
        
            } catch (error) {
                console.error('Error during sign-in:', error);
                setError('Failed to sign in. Please try again.');
            } finally {
                setLoading(false);
            }
        };

    const steps = [
        "Conectează-te cu Google",
        "Plătește la restaurant și primește codul",
        "Introdu codul pentru a revendica creditele",
        "Caută melodia în aplicație",
        "Dedică melodia folosind credite",
        "Ascultă melodia dedicată"
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-bl from-[#a856eb] via-[#d64061] to-[#211624]">
            <LoginTopBar />
            <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 mt-10">
                <div className="bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg p-6 rounded-2xl shadow-lg w-full max-w-sm">
                    <img className="w-24 h-24 mx-auto" src={logo} alt="Dedicații.ro logo" />
                    <h1 className="text-4xl font-bold mb-2 text-center text-white">Dedică.ro</h1>
                    <h2 className="text-xl font-semibold mb-6 text-center text-gray-200">Piesa ta în boxa mea</h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="flex flex-col items-center">
                        <button className="gsi-material-button w-full" onClick={handleGoogleSignIn}>
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
                    </div>
                </div>
                <motion.div 
                    className="mt-8 text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <FontAwesomeIcon icon={faChevronDown} size="2x" className="animate-bounce" />
                </motion.div>
                <motion.div 
                    className="mt-8 p-6 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                >
                    <h3 className="text-2xl font-bold mb-4 text-center text-white ">Cum funcționează</h3>
                    <ol className="list-decimal list-inside space-y-2">
                        {steps.map((step, index) => (
                            <motion.li 
                                key={index} 
                                className="text-base text-gray-200"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                            >
                                {step}
                            </motion.li>
                        ))}
                    </ol>
                </motion.div>
            </div>
            <LoginBotBar />
        </div>
    );
};

export default Login;