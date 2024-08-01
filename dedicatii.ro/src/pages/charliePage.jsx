import React, { useState, useEffect } from 'react';
import CharlieTopBar from '../components/charlieTopBar';
import Modal from 'react-modal';
import QrScanner from 'react-qr-scanner';
import { getDatabase, ref, onValue, update, get, push } from 'firebase/database'; // Added push
import { app } from '../firebaseconfig';
import axios from 'axios';
import { getFunctions, httpsCallable } from 'firebase/functions';

const API_KEY = 'AIzaSyAVaymp99OZmRWQ8ddDfGURCuvK__Qk-yc';
const DEFAULT_VIDEO_ID = 'C27NShgTQE';
const DEFAULT_VIDEO_COUNT = 10;

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
    const [newVideoId, setNewVideoId] = useState('');
    const [possibleQueue, setPossibleQueue] = useState([]);

    useEffect(() => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setIsMediaSupported(false);
        }
    }, []);

    useEffect(() => {
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        const playlistId = pathParts[2];
        const uid = pathParts[3];

        if (playlistId && uid) {
            fetchPlaylist(playlistId, uid);
            fetchPossibleQueue(uid);
        }
    }, []);

    const fetchPlaylist = (playlistID, uid) => {
        const db = getDatabase(app);
        const playlistRef = ref(db, `nova/${uid}`);

        onValue(playlistRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const songs = data.songs ? Object.values(data.songs) : [];
                setPlaylist(songs);
                setCurrentSong(data.currentSong || null);
                if (data.currentSong) {
                    fetchVideoDetails(data.currentSong).then(setVideoDetails);
                }
            } else {
                console.log('No data found for this playlist.');
            }
        }, {
            onlyOnce: false
        });
    };

    const fetchPossibleQueue = async (uid) => {
        const db = getDatabase(app);
        const possibleQueueRef = ref(db, `nova/${uid}/possibleQueue`);
    
        try {
            console.log('Fetching possible queue for UID:', uid);
            const snapshot = await get(possibleQueueRef);
            let data = snapshot.val();
    
            if (!data || Object.keys(data).length === 0) {
                console.log('No data found, using default values.');
                data = Array.from({ length: DEFAULT_VIDEO_COUNT }, () => DEFAULT_VIDEO_ID);
            } else {
                console.log('Data found:', data);
                data = Object.values(data);
            }
    
            const details = await Promise.all(data.map(id => fetchVideoDetails(id)));
            const filteredDetails = details.filter(video => video !== null);
    
            if (filteredDetails.length === 0) {
                console.log('No valid video details found in the possible queue.');
            } else {
                console.log('Filtered Possible Queue Details:', filteredDetails);
            }
    
            setPossibleQueue(filteredDetails);
        } catch (error) {
            console.error('Error fetching possible queue:', error);
        }
    };

    const fetchVideoDetails = async (videoId) => {
        try {
            console.log(`Fetching details for video ID: ${videoId}`);
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                params: {
                    part: 'snippet',
                    id: videoId,
                    key: API_KEY
                }
            });    
            if (response.data.items.length === 0) {
                console.log('No video data found for video ID:', videoId);
                return null;
            }
    
            const videoData = response.data.items[0].snippet;
            return {
                id: videoId,
                title: videoData.title,
                thumbnail: videoData.thumbnails.default.url,
                artist: videoData.channelTitle
            };
        } catch (error) {
            console.error('Error fetching video details for video ID:', videoId, error);
            return null;
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
            console.log('Scanned QR code result:', data);
            setQrResult(data.text);
            setIsQRModalOpen(false);
            if (data.text.startsWith('http')) {
                window.location.href = data.text;
            } else {
                alert('Scanned data is not a URL.');
            }
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

    const addVideoToQueue = async (videoId) => {
        const functions = getFunctions(app, 'europe-central2');
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        const uid = pathParts[3];
    
        try {
            const addToSongQueue = httpsCallable(functions, 'addToSongQueue');
            const result = await addToSongQueue({ novaID: uid, songID: videoId });
            console.log(videoId)
            console.log('Video added to queue successfully:', result.data);
        } catch (error) {
            console.error('Error adding video to queue:', error);
        }
    };

    return (
        <div className="text-center">
            <CharlieTopBar />
            {videoDetails && (
                <div className="current-song mt-8">
                    <h3 className="text-xl">Currently Playing</h3>
                    <p><strong>Title:</strong> {videoDetails.title}</p>
                    <p><strong>Artist:</strong> {videoDetails.artist}</p>
                </div>
            )}
            <div className="flex flex-col items-center">
                <div className="flex gap-5">
                <button 
                    className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                    onClick={handleRedeemCode}
                >
                    Redeem Code
                </button>
                <button 
                    className="bg-green-500 text-white py-2 px-4 rounded mb-4"
                    onClick={handleScanQRCode}
                >
                    Scan QR Code
                </button>
                </div>
                {possibleQueue.length > 0 && (
                <div className="possible-queue mt-8 bg-gray-100 p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl mb-6 font-semibold text-center">Possible Queue</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {possibleQueue.map((video, index) => (
                            video ? (
                                <div 
                                    key={video.id + index} 
                                    className="flex-none p-4 border rounded-lg shadow-md flex flex-col justify-between bg-white hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div>
                                        <img 
                                            src={video.thumbnail} 
                                            alt={video.title} 
                                            className="w-full h-32 object-cover mb-4 rounded" 
                                        />
                                        <p className="font-bold text-lg">{video.title}</p>
                                        <p className="text-gray-600">{video.artist}</p>
                                    </div>
                                    <button 
                                        className="bg-purple-500 text-white py-2 px-4 rounded mt-4 w-full hover:bg-purple-600 transition-colors duration-300"
                                        onClick={() => {
                                            console.log(video.id);
                                            addVideoToQueue(video.id);
                                        }}
                                    >
                                        Add to Queue
                                    </button>
                                </div>
                            ) : null
                ))}
        </div>
    </div>
)}
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
