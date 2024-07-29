import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faPlay, faPause, faForward } from '@fortawesome/free-solid-svg-icons';
import { auth, database } from '../firebaseconfig';
import { ref, get } from 'firebase/database';

const API_KEY = 'AIzaSyAVaymp99OZmRWQ8ddDfGURCuvK__Qk-yc';

const PlayerComponent = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playlistID, setPlaylistID] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const uid = user.uid;
        const playlistRef = ref(database, `nova/${uid}/playlistID`);
        try {
          const snapshot = await get(playlistRef);
          if (snapshot.exists()) {
            setPlaylistID(snapshot.val());
            console.log('Playlist ID fetched from database');
          } else {
            console.error('Playlist ID not found in database');
          }
        } catch (error) {
          console.error('Error fetching playlist ID', error);
        }
      } else {
        console.error('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (playlistID) {
      const fetchPlaylist = async () => {
        try {
          const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            params: {
              part: 'snippet',
              maxResults: 10,
              playlistId: playlistID,
              key: API_KEY,
            },
          });
          setPlaylist(response.data.items);
        } catch (error) {
          console.error('Error fetching playlist', error);
        }
      };

      fetchPlaylist();
    }
  }, [playlistID]);

  const handlePlayPause = () => {
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
    if (playlist.length > 0) {
      let nextIndex = (currentVideoIndex + 1) % playlist.length;
      setCurrentVideoIndex(nextIndex);
      console.log('Next video', playlist[nextIndex].snippet.title);
    }
  };

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
    setDuration(state.duration || duration); 
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

  const currentVideo = playlist.length > 0 ? playlist[currentVideoIndex]?.snippet?.resourceId?.videoId : '';
  const currentThumbnail = playlist.length > 0 ? playlist[currentVideoIndex]?.snippet?.thumbnails?.default?.url : 'https://via.placeholder.com/150';
  const currentTitle = playlist.length > 0 ? playlist[currentVideoIndex]?.snippet?.title : 'Title Placeholder';
  const currentArtist = playlist.length > 0 ? playlist[currentVideoIndex]?.snippet?.channelTitle : 'Artist Placeholder';

  const playerRef = useRef(null);

  return (
    <div className="player p-6 bg-gray-900 text-white shadow-lg max-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center">Now Playing</h2>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col items-center mb-6 md:mb-0">
          <img
            src={currentThumbnail}
            alt="Album Art"
            className="w-48 h-48 mb-4 rounded-lg shadow-md"
          />
          <div className="text-center">
            <h3 className="text-2xl font-semibold">{currentTitle}</h3>
            <p className="text-lg text-gray-300">{currentArtist}</p>
          </div>
        </div>
        <div className="flex-1 md:ml-6">
          <h3 className="text-2xl font-semibold mb-4">Playlist</h3>
          <ul className="playlist bg-gray-700 p-4 rounded-lg h-48 overflow-y-auto w-fit">
            {playlist.map((item, index) => (
              <li
                key={index}
                className={`mb-2 cursor-pointer hover:bg-gray-600 p-2 rounded ${index === currentVideoIndex ? 'bg-gray-800' : ''}`}
                onClick={() => setCurrentVideoIndex(index)}
              >
                {item.snippet.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="player-controls flex justify-center mt-6">
        <button className="prev text-white p-3 mx-3 rounded-full" onClick={handlePrev}>
          <FontAwesomeIcon icon={faBackward} />
        </button>
        <button className={`playpause text-white p-3 mx-3 rounded-full ${isPlaying ? 'pause' : 'play'}`} onClick={handlePlayPause}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <button className="next text-white p-3 mx-3 rounded-full" onClick={handleNext}>
          <FontAwesomeIcon icon={faForward} />
        </button>
      </div>
      <div className="time-controls mt-6 flex items-center justify-center">
        <span className="text-white mr-3">{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full"
        />
        <span className="text-white ml-3">{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
      </div>
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${currentVideo}`}
        playing={isPlaying}
        onProgress={handleProgress}
        onDuration={handleDuration}
        width="0"
        height="0"
        muted={false}
        config={{
          youtube: {
            playerVars: {
              autoplay: 1, // Enable autoplay
              controls: 0,
              showinfo: 0,
              modestbranding: 1,
            },
          },
        }}
      />
    </div>
  );
};

export default PlayerComponent;
