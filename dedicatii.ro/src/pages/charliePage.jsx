import React, { useState, useEffect } from 'react';
import CharlieTopBar from '../components/charlieTopBar';
import Modal from 'react-modal';
import QrScanner from 'react-qr-scanner';
import { getDatabase, ref, onValue, update, get, push } from 'firebase/database'; // Added push
import { app } from '../firebaseconfig';
import axios from 'axios';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BotBar from '../components/botbar';

const API_KEY = 'AIzaSyAVaymp99OZmRWQ8ddDfGURCuvK__Qk-yc';
const DEFAULT_VIDEO_ID = 'C27NShgTQE';
const DEFAULT_VIDEO_COUNT = 10;

const CharliePage = () => {
    const [playlist, setPlaylist] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [videoDetails, setVideoDetails] = useState(null);
    const [newVideoId, setNewVideoId] = useState('');
    const [possibleQueue, setPossibleQueue] = useState([]);

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
        } catch (error) {
            console.error('Error adding video to queue:', error);
        }
    };

    return (
        <div className="text-center bg-dedicatii-bg2">
                    <CharlieTopBar />

        <div className="flex items-center flex-col p-4">
        <div
            className="font-inter w-full text-2xl font-bold text-white"
            >
            Melodii disponibile
        </div>
         <div className="bg-t-bg-rectangle-14tvector-caut-omelodie z-0 flex flex-grow items-center self-stretch bg-cover bg-center py-2 px-4 text-left justify-center"
            >
            <div className="z-2 flex items-center justify-center w-3/2 bg-white bg-opacity-10 rounded-2xl px-4">
                <FontAwesomeIcon icon={faSearch} className="text-white" />
                <input
                className="font-inter text-center flex min-w-0 flex-grow text-xl leading-normal tracking-normal text-white placeholder:text-white bg-transparent"
                placeholder="Caută o melodie"
                type="text"
                />
            </div>
            </div>
            {possibleQueue.length > 0 && (
            <div className="possible-queue p-4 rounded-[5px] mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {possibleQueue.map((video, index) => (
                    video ? (
                    <div 
                        key={video.id + index} 
                        className="font-inter flex flex-col items-center justify-between gap-y-[5px] rounded-[5px] bg-[#dcdcdc19] pb-2.5 pl-[17px] pr-4 pt-[15px] text-center leading-[normal] tracking-[0px] text-white shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        <aside className="flex h-32 w-32 flex-shrink-0 flex-col items-center pr-0.5">
                        <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            className="h-32 w-32 flex-shrink-0 rounded-[5px] object-cover object-center text-center mb-4" 
                            loading="lazy"
                        />
                        </aside>
                        <div className="flex flex-col items-center">
                        <h2 className="self-stretch pt-2 font-medium">{video.title}</h2>
                        <div className="font-light">{video.artist}</div>
                        </div>
                        <button 
                        className="bg-dedicatii-button3 text-white py-2 px-4 rounded mt-4 w-full transition-colors duration-300"
                        onClick={() => {
                            console.log(video.id);
                            addVideoToQueue(video.id);
                        }}
                        >
                        Dedică
                        </button>
                    </div>
                    ) : null
                ))}
          </div>
        </div>
        )}
        </div>

            <BotBar videoDetails={videoDetails} />
        </div>
    );
};

export default CharliePage;
