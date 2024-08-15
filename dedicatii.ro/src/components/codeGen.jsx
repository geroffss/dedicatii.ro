import React, { useState, useEffect } from 'react';
import { auth, provider } from '../firebaseconfig';
import { getFunctions, httpsCallable } from 'firebase/functions';

const CodeGen = () => {
    const [user, setUser] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [codeToCheck, setCodeToCheck] = useState('');
    const [checkResult, setCheckResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const result = await auth.signInWithPopup(provider);
            setUser(result.user);
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    const generateCode = async () => {
        if (!user) {
            console.error('User is not logged in');
            return;
        }
    
        setLoading(true);
        setError('');
        try {
            const functions = getFunctions(undefined, 'europe-central2');
            const createCode = httpsCallable(functions, 'createCode');
            const result = await createCode({ songsCount: 5 }); // Adjust as needed
    
            if (result.data.code) {
                setGeneratedCode(result.data.code);
                setTimeLeft(60); // Start the countdown for 1 minute
            } else {
                throw new Error('Error generating code');
            }
        } catch (error) {
            console.error('Error generating code:', error);
            setError(error.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    // Countdown effect
    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0) {
            setGeneratedCode(''); // Hide the code after countdown finishes
        }

        return () => clearTimeout(timer); // Cleanup timer on component unmount or when timeLeft changes
    }, [timeLeft]);

    const checkCode = async () => {
        if (!user) {
            console.error('User is not logged in');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const functions = getFunctions(undefined, 'europe-central2');
            const checkCodeFunction = httpsCallable(functions, 'checkCode');
            const result = await checkCodeFunction({ code: codeToCheck });

            if (result.data.valid) {
                setCheckResult(`Code is valid. Song count: ${result.data.count}`);
            } else {
                setCheckResult('Code is invalid.');
            }
        } catch (error) {
            console.error('Error checking code:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="code-gen-container items-center font-inter flex flex-col md:flex-row gap-5 text-center font-medium rounded-lg leading-normal tracking-[0px] bg-dedicatii-bg3 text-white p-6 shadow-2xl">
            {!user ? (
                <button 
                    onClick={signInWithGoogle} 
                    className="flex items-center justify-center rounded-[5px] bg-dedicatii-button3 shadow-md hover:bg-blue-600"
                >
                    <div className="flex w-36 flex-shrink-0 flex-col justify-center pb-0.5 text-center">
                        <div className="flex items-center justify-center text-white">
                            <h2 className="text-center">Sign In with Google</h2>
                        </div>
                    </div>
                </button>
            ) : (
                <>
                    <button 
                        onClick={generateCode} 
                        className={`flex items-center justify-center rounded-[5px] bg-dedicatii-button3 shadow-md hover:bg-dedicatii-button2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        <div className="flex w-36 flex-shrink-0 flex-col justify-center pb-0.5 text-center">
                            <div className="flex items-center justify-center text-white">
                                <h2 className="text-center">{loading ? 'Se genereaza...' : 'Genereaza cod'}</h2>
                            </div>
                        </div>
                    </button>
                </>
            )}
            {generatedCode && (
                <div className="flex items-center justify-center flex-col">
                    <div className="flex items-center justify-center rounded-[5px] bg-zinc-800 px-11 text-neutral-400">
                        <p className="text-center flex flex-row gap-2">Codul generat: <p className="text-white"> {generatedCode}</p></p>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        Codul va dispărea în {timeLeft} secunde
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeGen;
