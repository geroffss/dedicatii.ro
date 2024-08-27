import React, { useState, useEffect } from 'react';
import CharlieTopBar from '../components/charlieTopBar';
import Modal from 'react-modal';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { app } from '../firebaseconfig';
import axios from 'axios';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BotBar from '../components/botbar';

const API_KEY = 'AIzaSyDbmgasA-HpdTpzpR0NyG2viXY_A7WlAE0';
const DEFAULT_VIDEO_ID = 'C27NShgTQE';
const DEFAULT_VIDEO_COUNT = 10;

const CharliePage = () => {
    const [playlist, setPlaylist] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [videoDetails, setVideoDetails] = useState(null);
    const [newVideoId, setNewVideoId] = useState('');
    const [possibleQueue, setPossibleQueue] = useState({});
    const [filteredQueue, setFilteredQueue] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [credits, setCredits] = useState(0);
    const [searchTerm, setSearchTerm] = useState(''); // Track search input

    useEffect(() => {
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        const uid = pathParts[2];
    
        if (uid) {
            const db = getDatabase();
            const playlistRef = ref(db, `nova/${uid}/playlistID`);
    
            get(playlistRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const playlistId = snapshot.val();
                    fetchPlaylist(playlistId, uid);
                    fetchPossibleQueue(uid);
                } else {
                    console.error("No playlist ID found");
                }
            }).catch((error) => {
                console.error("Error fetching playlist ID:", error);
            });
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
        const possibleQueueRef = ref(db, `categoriiSimple/`);
        let combinedData = {};
    
        try {
            console.log('Fetching possible queue for UID:', uid);
            const snapshot = await get(possibleQueueRef);
            const categories = snapshot.val();

            if (!categories || Object.keys(categories).length === 0) {
                console.log('No categories found, using default values.');
                combinedData['Default'] = Array.from({ length: DEFAULT_VIDEO_COUNT }, () => DEFAULT_VIDEO_ID);
            } else {
                console.log('Categories found:', categories);
    
                Object.entries(categories).forEach((category) => {
                    combinedData[category[0]] = [];
                    combinedData[category[0]].push(...Object.values(category[1]));
                })
            }
    
            if (Object.keys(combinedData).length === 0) {
                console.log('No data found in any category, using default values.');
                combinedData['Default'] = Array.from({ length: DEFAULT_VIDEO_COUNT }, () => DEFAULT_VIDEO_ID);
            } else {
                console.log('Combined Data:', combinedData);
            }
            setPossibleQueue(combinedData);
            setFilteredQueue(combinedData); // Initialize the filteredQueue with the full possibleQueue
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

    const addVideoToQueue = async (videoId) => {
        const functions = getFunctions(app, 'europe-central2');
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        const uid = pathParts[2];
    
        try {
            const addToSongQueue = httpsCallable(functions, 'addToSongQueue');
            const result = await addToSongQueue({ novaID: uid, songID: videoId });
            console.log(videoId)
            console.log('Video added to queue successfully:', result.data);
            alert('Melodia a fost adăugată cu succes în coadă!');   
            setModalIsOpen(false);
        } catch (error) {
            console.error('Error adding video to queue:', error);
            alert('Nu ai suficiente credite pentru a adăuga această melodie în coadă.');
        }
    };

    const openDedicateModal = (video) => {
        setSelectedVideo(video);
        setModalIsOpen(true);
    };

    const handleSearch = (event) => {
        const searchQuery = event.target.value.toLowerCase();
        setSearchTerm(searchQuery);

        const filteredResults = {};

        Object.keys(possibleQueue).forEach((category) => {
            const filteredVideos = possibleQueue[category].filter((video) =>
                video.title.toLowerCase().includes(searchQuery)
            );

            if (filteredVideos.length > 0) {
                filteredResults[category] = filteredVideos;
            }
        });

        setFilteredQueue(filteredResults);
    };

    return (
        <div className="text-center bg-dedicatii-bg2 min-h-screen">
                 <div className="fixed top-0 left-0 right-0 z-50">
                <CharlieTopBar />
            </div>

            <div className="flex items-center flex-col p-4 mt-10 pt-5">
                <div className="font-inter w-full text-2xl font-bold text-white">
                    Melodii disponibile
                </div>

                <div className="bg-t-bg-rectangle-14tvector-caut-omelodie z-0 flex items-center w-full bg-cover bg-center py-2 px-4 text-left justify-center">
                    <div className="z-2 flex items-center justify-center w-full bg-white bg-opacity-10 rounded-2xl px-4 py-2 mt-1">
                        <FontAwesomeIcon icon={faSearch} className="text-white" />
                        <input
                            className="font-inter text-center flex min-w-0 flex-grow text-xl placeholder:text-[#A4A4A4] bg-transparent"
                            placeholder="Caută o melodie"
                            type="text"
                            value={searchTerm} // Bind searchTerm to the input field
                            onChange={handleSearch} // Call handleSearch on input change
                        />
                    </div>
                </div>

                <div className="possible-queue rounded-[5px] mb-10 w-full">
                    {Object.keys(filteredQueue).length > 0 && (
                        <div className="possible-queue p-4 rounded-[5px] mb-10">
                            {console.log(Object.keys(filteredQueue), 'HERE')}
                            {Object.keys(filteredQueue).map((category, catIndex) => (
                                <div key={category + catIndex} className="mb-8 w-full">
                                    <h2 className="text-xl font-bold mb-4 text-white">
                                        {category}
                                    </h2>

                                    {/* Horizontal scrolling container */}
                                    <div className="overflow-x-auto scrollbar-hide pb-2 w-full">
                                        <div className="flex gap-4 w-max">
                                            {filteredQueue[category].map((video, index) =>
                                                video ? (
                                                    <div
                                                        key={video.title + index}
                                                        className="font-inter flex flex-col items-center gap-y-2 rounded bg-gray-800 bg-[#D9D9D9] bg-opacity-10 py-2 text-center text-white shadow-md hover:shadow-lg transition-shadow duration-300 w-[158px] h-[252px]"
                                                    >
                                                        <aside className="flex h-[125px] w-full flex-shrink-0 flex-col items-center">
                                                            <img
                                                                src={video.thumbnail}
                                                                alt={video.title}
                                                                className="h-[125px] w-[122px] flex-shrink-0 rounded-md object-cover object-center"
                                                                loading="lazy"
                                                                onClick={() => openDedicateModal(video)}
                                                            />
                                                        </aside>
                                                        <div className="flex flex-col items-center">
                                                            <h2 className="self-stretch font-medium text-base w-[140px] line-clamp-1">
                                                                {video.title}
                                                            </h2>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <h2 className="self-stretch font-light text-sm w-[140px] line-clamp-1">
                                                                {video.artist}
                                                            </h2>
                                                        </div>
                                                        <button
                                                            className="bg-[#D9D9D9] bg-opacity-10 text-white py-2 px-4 rounded-md w-[138px] transition-colors duration-300 mb-1"
                                                            onClick={() => openDedicateModal(video)}
                                                        >
                                                            Dedică
                                                        </button>
                                                    </div>
                                                ) : null
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-full text-center -translate-y-1/2 bg-dedicatii-bg p-4 rounded shadow-lg max-w-md mx-auto z-40 text-white"
                overlayClassName="fixed inset-0 bg-black bg-opacity-80 z-40"
            >
                {selectedVideo && (
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-4">
                            {selectedVideo.title}
                        </h2>
                        <p>Acest video costă 1 credit.</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                className="bg-dedicatii-button3 text-white py-2 px-4 rounded mt-4"
                                onClick={() => addVideoToQueue(selectedVideo.id)}
                            >
                                Confirmă
                            </button>
                            <button
                                className="bg-dedicatii-button1 text-white py-2 px-4 rounded mt-4"
                                onClick={() => setModalIsOpen(false)}
                            >
                                Anulează
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <BotBar videoDetails={videoDetails} />
        </div>
    );
};

export default CharliePage;
