import React, { useState, useEffect, useRef, useCallback } from 'react';
import CharlieTopBar from '../components/charlieTopBar';
import Modal from 'react-modal';
import { getDatabase, ref, onValue, get, child } from 'firebase/database';
import { app } from '../firebaseconfig';
import axios from 'axios';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BotBar from '../components/botbar';
import toast, { Toaster } from 'react-hot-toast';
import { PlayingNow } from '../components/playingNow';
import { CategoriesView } from '../components/categoriesView';
import { AnimatePresence, motion } from 'framer-motion';
import { SongCard } from '../components/songCard';

const API_KEY = 'AIzaSyA7Xj1W5mdDeAw2Aja47q6qa7zPPYZtT68';
const DEFAULT_VIDEO_ID = 'C27NShgTQE';
const DEFAULT_VIDEO_COUNT = 10;

export const toastStyle = {
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
    marginBottom: '84px',
  },
};

const CharliePage = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [videoDetails, setVideoDetails] = useState(null);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [newVideoId, setNewVideoId] = useState('');
  const [possibleQueue, setPossibleQueue] = useState({});
  const [filteredQueue, setFilteredQueue] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [credits, setCredits] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCurrentSongVisible, setIsCurrentSongVisible] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [isCategoriesView, setIsCategoriesView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const uid = window.location.pathname.split('/')[2];

  const observer = useRef();
  const lastSongElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreSongs();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    if (uid) {
      const db = getDatabase();
      const playlistRef = ref(db, `nova/${uid}/playlistID`);

      get(playlistRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const playlistId = snapshot.val();
            fetchPlaylist(playlistId, uid);
            fetchPossibleQueue(uid);
          } else {
            console.error('No playlist ID found');
          }
        })
        .catch((error) => {
          console.error('Error fetching playlist ID:', error);
        });
    }
  }, []);

  const fetchPlaylist = (playlistID, uid) => {
    const db = getDatabase(app);
    const playlistRef = ref(db, `nova/${uid}`);
  
    onValue(
      playlistRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log('Fetched data:', data);
  
        if (data) {
          setCurrentQueue(data.currentQueue || []);
          const songs = data.songs ? Object.values(data.songs) : [];
          setPlaylist(songs);
          setCurrentSong(data.currentSong || null);
  
          if (data.currentSong) {
            fetchVideoDetails(data.currentSong)
              .then((details) => {
                setVideoDetails(details);
              })
              .catch((error) => {
                console.error('Error fetching video details:', error);
              });
          }
        } else {
          console.log('No data found for this playlist.');
        }
      },
      {
        onlyOnce: false,
      }
    );
  };

  const fetchPossibleQueue = async (uid) => {
    setLoading(true);
    const db = getDatabase(app);
    const categories = ref(db, `nova/${uid}/categories`);
    const snapshot = await get(categories);
    const selectedCategories = snapshot.val();
    const possibleQueueRef = ref(db, `categoriiSimple/`);
    let combinedData = {};

    for (const category of selectedCategories) {
      const categoryRef = child(possibleQueueRef, category);
      const categorySnapshot = await get(categoryRef);
      if (categorySnapshot.exists()) {
        const result = categorySnapshot.val();
        combinedData[category] = result.slice(0, 10); // Load first 10 songs initially
      }
    }

    setPossibleQueue(combinedData);
    setFilteredQueue(combinedData);
    setLoading(false);
  };

  const loadMoreSongs = () => {
    setLoading(true);
    const newFilteredQueue = { ...filteredQueue };
    let loadedMore = false;

    Object.keys(newFilteredQueue).forEach((category) => {
      const currentLength = newFilteredQueue[category].length;
      const newSongs = possibleQueue[category].slice(currentLength, currentLength + 10);
      if (newSongs.length > 0) {
        newFilteredQueue[category] = [...newFilteredQueue[category], ...newSongs];
        loadedMore = true;
      }
    });

    if (loadedMore) {
      setFilteredQueue(newFilteredQueue);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  const fetchVideoDetails = async (videoId) => {
    try {
      console.log(`Fetching details for video ID: ${videoId}`);
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`,
        {
          params: {
            part: 'snippet',
            id: videoId,
            key: API_KEY,
          },
        }
      );
      if (response.data.items.length === 0) {
        console.log('No video data found for video ID:', videoId);
        return null;
      }

      const videoData = response.data.items[0].snippet;
      return {
        id: videoId,
        title: videoData.title,
        thumbnail: videoData.thumbnails.default.url,
        artist: videoData.channelTitle,
      };
    } catch (error) {
      console.error(
        'Error fetching video details for video ID:',
        videoId,
        error
      );
      return null;
    }
  };

  const addVideoToQueue = async (video) => {
    const functions = getFunctions(app, 'europe-central2');
    const urlPath = window.location.pathname;
    const pathParts = urlPath.split('/');
    const uid = pathParts[2];

    try {
      const addToSongQueue = httpsCallable(functions, 'addToSongQueue');
      toast.promise(
        addToSongQueue({ novaID: uid, song: video }),
        {
          loading: 'Se adaugă în coadă...',
          success: <b>Melodia a fost adăugată cu succes în coadă!</b>,
          error: (
            <b>
              Nu ai suficiente credite pentru a adăuga această melodie în coadă.
            </b>
          ),
        },
        toastStyle
      );
      setModalIsOpen(false);
    } catch (error) {
      toast.error(
        'Nu ai suficiente credite pentru a adăuga această melodie în coadă.'
      );
      console.error('Error adding video to queue:', error);
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

  const animation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <>
      <div
        className={`text-center bg-dedicatii-bg2 ${
          !isCategoriesView && 'min-h-screen'
        }`}
      >
        <div className="fixed top-0 left-0 right-0 z-50">
          <CharlieTopBar
            handleCategoriesClick={() => setIsCategoriesView(true)}
          />
        </div>

        <motion.div
          {...animation}
          className={`flex items-center flex-col p-4 mt-10 pt-5 ${
            (isCurrentSongVisible || isCategoriesView) && 'hidden'
          }`}
        >
          <div className="bg-t-bg-rectangle-14tvector-caut-omelodie z-0 flex items-center w-full bg-cover bg-center py-2 px-4 text-left justify-center">
            <div className="z-2 flex items-center justify-center w-full bg-white bg-opacity-10 rounded-2xl px-4 py-2 mt-1">
              <FontAwesomeIcon icon={faSearch} className="text-white" />
              <input
                className="font-inter text-center flex min-w-0 flex-grow text-xl placeholder:text-[#A4A4A4] bg-transparent outline-none text-white"
                placeholder={!searchFocus && 'Caută o melodie...'}
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
              />
            </div>
          </div>

          <div className="possible-queue rounded-[5px] mb-10 w-full">
            {Object.keys(filteredQueue).length > 0 && (
              <div className="possible-queue p-4 rounded-[5px] mb-10">
                {Object.keys(filteredQueue).map((category, catIndex) => (
                  <div key={category + catIndex} className="mb-8 w-full">
                    <h2 className="text-xl font-bold mb-4 text-white">
                      {category}
                    </h2>

                    <div className="overflow-x-auto scrollbar-hide pb-2 w-full">
                      <div className="flex gap-4 w-max">
                        {filteredQueue[category].map((video, index) =>
                          video ? (
                            <div
                              key={video.title}
                              ref={
                                index === filteredQueue[category].length - 1
                                  ? lastSongElementRef
                                  : null
                              }
                            >
                              <SongCard
                                song={video}
                                onClick={() => openDedicateModal(video)}
                              />
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {loading && <p className="text-white">Loading more songs...</p>}
          </div>
        </motion.div>

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
                  onClick={() => addVideoToQueue(selectedVideo)}
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

        <BotBar
          videoDetails={currentQueue?.songs[0]}
          setIsCurrentSongVisible={setIsCurrentSongVisible}
        />

        <Toaster position="bottom-center" reverseOrder={false} />
      </div>

      <AnimatePresence>
        {isCurrentSongVisible && <PlayingNow queue={currentQueue} />}
      </AnimatePresence>

      {isCategoriesView && (
        <CategoriesView
          onDedicateSong={(song) => openDedicateModal(song)}
          novaID={uid}
          onBackClick={() => setIsCategoriesView(false)}
          isCurrentSongVisible={isCurrentSongVisible}
        />
      )}
    </>
  );
};

export default CharliePage;