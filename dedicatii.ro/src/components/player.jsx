import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faPlay, faPause, faForward } from '@fortawesome/free-solid-svg-icons';
import { auth, database } from '../firebaseconfig';
import { ref, onValue, get, set, remove } from 'firebase/database';

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
  const playerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const uid = user.uid;
        const playlistRef = ref(database, `nova/${uid}/playlistID`);
        try {
          const playlistSnapshot = await get(playlistRef);
          if (playlistSnapshot.exists()) {
            setPlaylistID(playlistSnapshot.val());
            console.log('Playlist ID fetched from database');
          } else {
            console.error('Playlist ID not found in database');
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
    if (playlistID && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const playlistRef = ref(database, `playlistNova/${uid}/${playlistID}`);

      const unsubscribe = onValue(playlistRef, (snapshot) => {
        if (snapshot.exists()) {
          const playlistData = snapshot.val();
          setPlaylist(Object.values(playlistData));
        } else {
          console.error('Playlist not found in database');
        }
      });

      return () => unsubscribe();
    }
  }, [playlistID]);

  useEffect(() => {
    if (playlist.length > 0) {
      const currentSong = playlist[currentVideoIndex];
      setCurrentVideoId(currentSong.videoID);
      setCurrentTitle(currentSong.title);
      setCurrentArtist(currentSong.artist);
      setCurrentThumbnail(currentSong.thumbnail);
    }
  }, [currentVideoIndex, playlist]);

  useEffect(() => {
    if (playlist.length > 0 && onSongChange && playlistID) {
      const currentVideoId = playlist[currentVideoIndex]?.videoID;
      const uid = auth.currentUser?.uid;
      if (uid && currentVideoId) {
        const currentSongRef = ref(database, `nova/${uid}/currentSong`);

        remove(currentSongRef)
          .then(() => {
            set(currentSongRef, currentVideoId);
            onSongChange(playlistID, currentVideoId);
            setCurrentVideoId(currentVideoId);
          })
          .catch((error) => {
            console.error('Error removing current song:', error);
          });
      }
    }
  }, [currentVideoIndex, playlist, playlistID, onSongChange]);

    const playNextOrNextInPlaylist = async () => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const nextSongRef = ref(database, `nova/${uid}/nextSong`);
      const currentSongRef = ref(database, `nova/${uid}/currentSong`);
  
      try {
        const nextSongSnapshot = await get(nextSongRef);
        let nextSongId = null;
  
        if (nextSongSnapshot.exists()) {
          nextSongId = nextSongSnapshot.val();
          console.log(`Next song ID from database: ${nextSongId}`);
          await remove(nextSongRef);
        } else {
          let nextIndex = (currentVideoIndex + 1) % playlist.length;
          nextSongId = playlist[nextIndex]?.videoID;
          setCurrentVideoIndex(nextIndex);
          console.log(`Playing next song in playlist: ${playlist[nextIndex]?.title}`);
        }
  
        if (nextSongId) {
          // First, remove the current song
          await remove(currentSongRef);
  
          // Then, set the new current song
          await set(currentSongRef, nextSongId);
  
          // Update the local state
          setCurrentVideoId(nextSongId);
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
      console.log('Previous video', playlist[prevIndex].title);
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

  const setNextSong = () => {
    
  }

  
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
            <ul className="playlist bg-dedicatii-bg3 h-80 md:h-72 p-4 rounded-lg overflow-auto w-full">
              {playlist.map((item, index) => (
                <li
                  key={index}
                  className={`mb-2 cursor-pointer hover:bg-gray-600 p-2 rounded ${index === currentVideoIndex ? 'bg-gray-800' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <img className="w-12 h-12 object-cover" src={item.thumbnail} alt={item.title} />
                    <span>{item.title}</span>
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