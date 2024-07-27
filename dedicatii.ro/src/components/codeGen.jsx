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
        <div className="code-gen-container p-4 bg-gray-800 text-white rounded-lg shadow-lg max-w-md mx-auto">
            {!user ? (
                <button 
                    onClick={signInWithGoogle} 
                    className="bg-blue-500 text-white p-2 rounded-lg shadow-md hover:bg-blue-600"
                >
                    Sign In with Google
                </button>
            ) : (
                <>
                    <button 
                        onClick={generateCode} 
                        className={`bg-green-500 text-white p-2 rounded-lg shadow-md hover:bg-green-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Code'}
                    </button>
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Enter code to check"
                            value={codeToCheck}
                            onChange={(e) => setCodeToCheck(e.target.value)}
                            className="p-2 rounded-lg text-black"
                        />
                        <button 
                            onClick={checkCode} 
                            className={`bg-blue-500 text-white p-2 rounded-lg shadow-md hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Checking...' : 'Check Code'}
                        </button>
                    </div>
                </>
            )}
            {generatedCode && <p className="mt-4 text-center">Generated Code: {generatedCode}</p>}
            {checkResult && (
                <div className="mt-4 text-center">
                    <p className={checkResult.startsWith('Code is valid') ? 'text-green-500' : 'text-red-500'}>
                        {checkResult}
                    </p>
                </div>
            )}
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </div>
    );
};

export default CodeGen;
