import React, { useState, useEffect } from 'react';
import CharlieTopBar from '../components/charlieTopBar';
import Modal from 'react-modal';
import QrScanner from 'react-qr-scanner';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebaseconfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import axios from 'axios'; // For making HTTP requests

const API_KEY = 'AIzaSyAVaymp99OZmRWQ8ddDfGURCuvK__Qk-yc';

const CharliePage = () => {
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrResult, setQrResult] = useState('');
    const [cameraMode, setCameraMode] = useState('environment');
    const [redeemCode, setRedeemCode] = useState('');
    const [isMediaSupported, setIsMediaSupported] = useState(true);
    const [playlist, setPlaylist] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [videoDetails, setVideoDetails] = useState(null);

    useEffect(() => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setIsMediaSupported(false);
        }
    }, []);

    useEffect(() => {
        // Extract playlistID and UID from URL
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        const playlistId = pathParts[2]; // Assuming URL is like /charlie/playlistID
        const uid = pathParts[3];

        if (playlistId && uid) {
            fetchPlaylist(playlistId, uid);
        }
    }, []);

    const fetchPlaylist = (playlistID, uid) => {
        const db = getDatabase(app);

        // Use the UID in the database path
        const playlistRef = ref(db, `nova/${uid}`);

        // Listen to real-time updates
        onValue(playlistRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const songs = data.songs ? Object.values(data.songs) : [];
                setPlaylist(songs);
                setCurrentSong(data.currentSong || null);
                console.log('Playlist:', data);

                // Fetch video details if currentSong is updated
                if (data.currentSong) {
                    fetchVideoDetails(data.currentSong);
                }
            } else {
                console.log('No data found for this playlist.');
            }
        }, {
            onlyOnce: false // Listen for real-time updates
        });
    };

    const fetchVideoDetails = async (videoId) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                params: {
                    part: 'snippet',
                    id: videoId,
                    key: API_KEY
                }
            });

            const videoData = response.data.items[0]?.snippet;
            if (videoData) {
                setVideoDetails({
                    title: videoData.title,
                    artist: videoData.channelTitle // Assuming channelTitle as artist
                });
            } else {
                console.log('No video data found.');
            }
        } catch (error) {
            console.error('Error fetching video details:', error);
        }
    };

    const handleRedeemCode = () => {
        setIsRedeemModalOpen(true);
    };

    const handleScanQRCode = () => {
        setIsQRModalOpen(true);
    };

    const handleQRScan = (data) => {
        if (data) {
            setQrResult(data.text);
            setIsQRModalOpen(true);
        }
    };

    const handleQRError = (error) => {
        console.error(error);
    };

    const toggleCameraMode = () => {
        setCameraMode((prevMode) => (prevMode === 'environment' ? 'user' : 'environment'));
    };

    const handleRedeemSubmit = async () => {
        const functions = getFunctions(app, 'europe-central2');
        const redeemCodeFunction = httpsCallable(functions, 'redeemCode');

        try {
            const result = await redeemCodeFunction({ code: redeemCode });
            console.log('Code redeemed successfully:', result.data);
        } catch (error) {
            console.error('Error redeeming code:', error);
        }

        setIsRedeemModalOpen(false);
    };

    return (
        <div className="text-center">
            <CharlieTopBar />
            <h1 className="text-2xl md:text-4xl mb-4">Charlie's Page</h1>
            {videoDetails && (
                <div className="current-song mt-8">
                    <h3 className="text-xl">Currently Playing</h3>
                    <p><strong>Title:</strong> {videoDetails.title}</p>
                </div>
            )}            <div className="flex flex-col items-center">
                <button 
                    className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                    onClick={handleRedeemCode}
                >
                    Redeem Code
                </button>
                <button 
                    className="bg-green-500 text-white py-2 px-4 rounded"
                    onClick={handleScanQRCode}
                >
                    Scan QR Code
                </button>
            </div>

            <Modal
                isOpen={isRedeemModalOpen}
                onRequestClose={() => setIsRedeemModalOpen(false)}
                contentLabel="Redeem Code Modal"
                className="bg-white p-4 rounded shadow-lg max-w-md mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <h2 className="text-xl mb-4">Redeem Code</h2>
                <input 
                    type="text" 
                    placeholder="Enter your code" 
                    className="border p-2 w-full mb-4"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                />
                <button 
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                    onClick={handleRedeemSubmit}
                >
                    Submit
                </button>
            </Modal>

            <Modal
                isOpen={isQRModalOpen}
                onRequestClose={() => setIsQRModalOpen(false)}
                contentLabel="Scan QR Code Modal"
                className="bg-white p-4 rounded shadow-lg max-w-md mx-auto"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <h2 className="text-xl mb-4">Scan QR Code</h2>
                {isMediaSupported ? (
                    <QrScanner
                        delay={300}
                        onError={handleQRError}
                        onScan={handleQRScan}
                        style={{ width: '100%' }}
                        constraints={{
                            video: { facingMode: { exact: cameraMode } }
                        }}
                    />
                ) : (
                    <p className="text-red-500">QR scanning is not supported in this browser.</p>
                )}
                {qrResult && <p className="mt-4">Scanned Result: {qrResult}</p>}
                <button 
                    className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
                    onClick={toggleCameraMode}
                >
                    Switch Camera
                </button>
                <button 
                    className="bg-red-500 text-white py-2 px-4 rounded mt-4"
                    onClick={() => setIsQRModalOpen(false)}
                >
                    Close
                </button>
            </Modal>

            
        </div>
    );
};

export default CharliePage;
