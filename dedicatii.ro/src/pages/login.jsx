import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseconfig';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../logo1.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import LoginTopBar from '../components/loginTopBar';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const provider = new GoogleAuthProvider();

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