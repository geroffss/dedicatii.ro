import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faPlay, faPause, faForward } from '@fortawesome/free-solid-svg-icons';
import { auth, database } from '../firebaseconfig';
import { ref, get, set, remove } from 'firebase/database';

function PlayerComponent({ onSongChange }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playlistID, setPlaylistID] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('Title Placeholder');
  const [currentArtist, setCurrentArtist] = useState('Artist Placeholder');
  const [currentThumbnail, setCurrentThumbnail] = useState('https://via.placeholder.com/150');
  const [accessToken, setAccessToken] = useState(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const uid = user.uid;
        const playlistRef = ref(database, `nova/${uid}/playlistID`);
        const tokenRef = ref(database, `nova/${uid}/token`);
        try {
          const [playlistSnapshot, tokenSnapshot] = await Promise.all([
            get(playlistRef),
            get(tokenRef)
          ]);
          if (playlistSnapshot.exists()) {
            setPlaylistID(playlistSnapshot.val());
            console.log('Playlist ID fetched from database');
          } else {
            console.error('Playlist ID not found in database');
          }
          if (tokenSnapshot.exists()) {
            setAccessToken(tokenSnapshot.val());
            console.log('Access token fetched from database');
          } else {
            console.error('Access token not found in database');
          }
        } catch (error) {
          console.error('Error fetching data', error);
        }
      } else {
        console.error('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (playlistID && accessToken) {
      const fetchPlaylist = async () => {
        try {
          const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            params: {
              part: 'snippet',
              maxResults: 500,
              playlistId: playlistID,
            },
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          setPlaylist(response.data.items);
        } catch (error) {
          console.error('Error fetching playlist', error);
          if (error.response && error.response.status === 401) {
            console.error('Access token may have expired. Please re-authenticate.');
            // Here you might want to implement a token refresh mechanism
          }
        }
      };

      fetchPlaylist();
    }
  }, [playlistID, accessToken]);

  useEffect(() => {
    if (auth.currentUser && accessToken) {
      const uid = auth.currentUser.uid;
      const currentSongRef = ref(database, `nova/${uid}/currentSong`);

      const fetchCurrentSongDetails = async () => {
        try {
          const currentSongSnap = await get(currentSongRef);
          if (currentSongSnap.exists()) {
            const videoId = currentSongSnap.val();
            setCurrentVideoId(videoId);

            // Fetch video details from YouTube API
            const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
              params: {
                part: 'snippet',
                id: videoId,
              },
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            });

            const videoData = response.data.items[0];
            const rawTitle = videoData.snippet.title.split(' - ')[1];
            const cleanedTitle = rawTitle.replace(/official video|music video|lyrics|official music video/gi, '').trim();
            setCurrentTitle(cleanedTitle);         
            setCurrentArtist(videoData.snippet.channelTitle);
            setCurrentThumbnail(videoData.snippet.thumbnails.default.url);
          } else {
            console.error('Current song not found in database');
          }
        } catch (error) {
          console.error('Error fetching current song details', error);
        }
      };

      fetchCurrentSongDetails();
    }
  }, [currentVideoId, accessToken]);

  useEffect(() => {
    if (playlist.length > 0 && onSongChange && playlistID) {
      const currentVideoId = playlist[currentVideoIndex]?.snippet?.resourceId?.videoId;
      const uid = auth.currentUser?.uid;
      if (uid && currentVideoId) {
        const currentSongRef = ref(database, `nova/${uid}/currentSong`);
        set(currentSongRef, currentVideoId);

        onSongChange(playlistID, currentVideoId);
        setCurrentVideoId(currentVideoId);
      }
    }
  }, [currentVideoIndex, playlist, playlistID, onSongChange]);

  const playNextOrNextInPlaylist = async () => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const nextSongRef = ref(database, `nova/${uid}/nextSong`);

      try {
        const nextSongSnapshot = await get(nextSongRef);
        let nextSongId = null;

        if (nextSongSnapshot.exists()) {
          nextSongId = nextSongSnapshot.val();
          console.log(`Next song ID from database: ${nextSongId}`);
          await remove(nextSongRef); // Remove the nextSong entry after getting it
        } else {
          // If nextSong doesn't exist, move to the next song in the playlist
          let nextIndex = (currentVideoIndex + 1) % playlist.length;
          nextSongId = playlist[nextIndex]?.snippet?.resourceId?.videoId;
          setCurrentVideoIndex(nextIndex);
          console.log(`Playing next song in playlist: ${playlist[nextIndex]?.snippet?.title}`);
        }

        if (nextSongId) {
          setCurrentVideoId(nextSongId); // Update the currentVideoId to play the next song
          const currentSongRef = ref(database, `nova/${uid}/currentSong`);
          await set(currentSongRef, nextSongId);
        } else {
          console.error('No next song ID available to set as current song.');
        }
      } catch (error) {
        console.error('Error accessing nextSong from database', error);
      }
    }
  };

  const handlePlayPause = () => {
    if (!isPlaying && playerRef.current) {
      playerRef.current.getInternalPlayer().unMute();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    if (playlist.length > 0) {
      let prevIndex = (currentVideoIndex - 1 + playlist.length) % playlist.length;
      setCurrentVideoIndex(prevIndex);
      console.log('Previous video', playlist[prevIndex].snippet.title);
    }
  };

  const handleNext = () => {
    playNextOrNextInPlaylist();
  };

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeek = (event) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="player p-6 text-white m-4 bg-dedicatii-bg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Now Playing</h2>
      <div className="flex flex-col md:flex-row">
        <div className="font-inter flex flex-col md:flex-row w-full items-center justify-center gap-5 rounded-lg pb-2 pt-2 text-center text-base text-white mb-6 md:mb-0">
          <div className="bg-dedicatii-bg3 flex flex-col items-center justify-center text-center p-2 md:p-4 rounded-lg flex-shrink-0 w-full md:w-1/2">
            <img
              src={currentThumbnail}
              alt={`Album art for ${currentTitle}`}
              className="h-32 w-32 md:h-52 md:w-52 rounded-lg object-cover shadow-2xl"
            />
            <div className="pt-2 md:pt-3 font-medium w-full">
              <h3 className="text-lg md:text-2xl font-semibold">{currentTitle}</h3>
            </div>
            <div className="text-sm md:text-base font-light">{currentArtist}</div>
          </div>
          <div className="md:w-1/2 w-full flex flex-col items-center">
            <ul className="playlist bg-dedicatii-bg3 h-80 md:h-72 p-4 rounded-lg overflow-y-auto w-full">
              {playlist.map((item, index) => (
                <li
                  key={index}
                  className={`mb-2 cursor-pointer hover:bg-gray-600 p-2 rounded ${index === currentVideoIndex ? 'bg-gray-800' : ''}`}
                  onClick={() => setCurrentVideoIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <img className="w-12 h-12 object-cover" src={item.snippet.thumbnails.default.url} alt={item.snippet.title} />
                    <span>{item.snippet.title}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="time-controls px-4 mt-4 flex items-center justify-center w-full">
        <span className="text-white mr-3">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full"
          aria-label="Seek"
        />
        <span className="text-white ml-3">
          {formatTime(duration)}
        </span>
      </div>
      <div className="player-controls flex justify-center">
        <button className="prev text-white p-3 mx-3 rounded-full" onClick={handlePrev} aria-label="Previous track">
          <FontAwesomeIcon icon={faBackward} />
        </button>
        <button className={`playpause text-white p-3 mx-3 rounded-full ${isPlaying ? 'pause' : 'play'}`} onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <button className="next text-white p-3 mx-3 rounded-full" onClick={handleNext} aria-label="Next track">
          <FontAwesomeIcon icon={faForward} />
        </button>
      </div>
      <ReactPlayer
        ref={playerRef}
        url={currentVideoId ? `https://www.youtube.com/watch?v=${currentVideoId}` : ''}
        playing={isPlaying}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={playNextOrNextInPlaylist}
        width="0"
        height="0"
        config={{
          youtube: {
            playerVars: {
              autoplay: 1,
              controls: 0,
              showinfo: 0,
              modestbranding: 1,
            },
          },
        }}
        onStart={() => {
          if (playerRef.current) {
            playerRef.current.getInternalPlayer().unMute();
          }
        }}
      />
    </div>
  );
}

export default PlayerComponent;