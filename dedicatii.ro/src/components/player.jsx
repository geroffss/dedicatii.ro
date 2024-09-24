import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faPlay, faPause, faForward, faVolumeUp, faVolumeMute, faHeart } from '@fortawesome/free-solid-svg-icons';
import { auth, database } from '../firebaseconfig';
import { ref, onValue, get } from 'firebase/database';
import { httpsCallable, getFunctions } from 'firebase/functions';

function PlayerComponent() {
  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [nextSong, setNextSong] = useState(null);
  const playerRef = useRef(null);

  const functions = getFunctions(undefined, 'europe-central2');
  const setCurrentQueueBE = httpsCallable(functions, 'setCurrentQueueBE');

  const fetchPlaylistData = useCallback(() => {
    if (!auth.currentUser) {
      console.error("User not authenticated");
      return;
    }

    const uid = auth.currentUser.uid;
    const playlistIdRef = ref(database, `nova/${uid}/playlistID`);

    get(playlistIdRef).then((playlistIdSnapshot) => {
      if (!playlistIdSnapshot.exists()) {
        console.error("Playlist ID not found");
        return;
      }

      const playlistId = playlistIdSnapshot.val();
      const playlistRef = ref(database, `playlistNova/${uid}/${playlistId}`);
      const nextSongRef = ref(database, `nova/${uid}/nextSong`);
      const currentSongRef = ref(database, `nova/${uid}/currentSong`);

      const unsubscribePlaylist = onValue(playlistRef, (snapshot) => {
        if (!snapshot.exists()) {
          console.error("Playlist not found");
          return;
        }

        const playlistData = snapshot.val();
        const songList = Object.entries(playlistData).map(([key, value]) => ({
          id: key,
          ...value,
          isDedication: false
        }));

        setPlaylist(songList);
      });

      const unsubscribeNextSong = onValue(nextSongRef, (snapshot) => {
        if (snapshot.exists()) {
          const nextSongId = snapshot.val();
          const nextSongData = playlist.find(song => song.videoID === nextSongId);
          if (nextSongData) {
            setNextSong({ ...nextSongData, isDedication: true });
          }
        } else {
          setNextSong(null);
        }
      });

      const unsubscribeCurrentSong = onValue(currentSongRef, (snapshot) => {
        if (snapshot.exists()) {
          const currentSongId = snapshot.val();
          const currentSongData = playlist.find(song => song.videoID === currentSongId);
          if (currentSongData) {
            setCurrentSong(currentSongData);
          }
        } else {
          setCurrentSong(null);
        }
      });

      return () => {
        unsubscribePlaylist();
        unsubscribeNextSong();
        unsubscribeCurrentSong();
      };
    });
  }, [playlist]);

  useEffect(() => {
    const cleanup = fetchPlaylistData();
    return () => {
      if (cleanup) cleanup();
    };
  }, [fetchPlaylistData]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrev = useCallback(async () => {
    if (playlist.length === 0 || !currentSong) return;
    const currentIndex = playlist.findIndex(song => song.videoID === currentSong.videoID);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevSong = playlist[prevIndex];
    try {
      const result = await setCurrentQueueBE({ videoID: prevSong.videoID });
      console.log("Queue updated successfully:", result.data);
    } catch (error) {
      console.error("Error updating queue:", error);
    }
  }, [playlist, currentSong, setCurrentQueueBE]);

  const handleNext = useCallback(async () => {
    if (playlist.length === 0 || !currentSong) return;
    const currentIndex = playlist.findIndex(song => song.videoID === currentSong.videoID);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextSong = playlist[nextIndex];
    try {
      const result = await setCurrentQueueBE({ videoID: nextSong.videoID });
      console.log("Queue updated successfully:", result.data);
    } catch (error) {
      console.error("Error updating queue:", error);
    }
  }, [playlist, currentSong, setCurrentQueueBE]);

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVolume(isMuted ? 1 : 0);
  };

  const handleSongSelect = useCallback(async (song) => {
    try {
      const result = await setCurrentQueueBE({ videoID: song.videoID });
      console.log("Queue updated successfully:", result.data);
    } catch (error) {
      console.error("Error updating queue:", error);
    }
  }, [setCurrentQueueBE]);

  const handleSongEnd = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="player p-6 text-white m-4 bg-dedicatii-bg rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Now Playing</h2>
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-300px)]">
        <div className="md:w-1/2 h-full flex flex-col">
          <div className="bg-dedicatii-bg3 flex flex-col items-center justify-center text-center p-4 rounded-lg flex-grow">
            <img
              src={currentSong?.thumbnail || 'https://via.placeholder.com/150'}
              alt={`Album art for ${currentSong?.title}`}
              className="w-full max-w-xs rounded-lg object-cover shadow-2xl mb-4"
            />
            <h3 className="text-2xl font-semibold mb-2">{currentSong?.title || 'No song selected'}</h3>
            <p className="text-lg opacity-75">{currentSong?.artist || 'Unknown artist'}</p>
            {currentSong?.isDedication && (
              <div className="mt-2 text-red-500">
                <FontAwesomeIcon icon={faHeart} className="mr-2" />
                Dedicație
              </div>
            )}
          </div>
        </div>
        <div className="md:w-1/2 h-full flex flex-col">
          <div className="bg-dedicatii-bg3 p-4 rounded-lg flex-grow overflow-hidden flex flex-col">
            <h4 className="text-xl font-semibold mb-4">Playlist</h4>
            {nextSong && (
              <div className="mb-4 p-2 bg-red-500 bg-opacity-20 rounded-lg">
                <h5 className="font-semibold">Next Dedication:</h5>
                <div className="flex items-center gap-2">
                  <img className="w-12 h-12 object-cover rounded" src={nextSong.thumbnail} alt={nextSong.title} />
                  <div>
                    <p className="font-medium">{nextSong.title}</p>
                    <p className="text-sm opacity-75">{nextSong.artist}</p>
                  </div>
                  <FontAwesomeIcon icon={faHeart} className="text-red-500 ml-auto" />
                </div>
              </div>
            )}
            <ul className="overflow-auto flex-grow space-y-2">
              {playlist.map((song) => (
                <li
                  key={song.id}
                  className={`p-2 rounded flex items-center gap-2 cursor-pointer hover:bg-dedicatii-bg/10 transition-colors ${
                    song.videoID === currentSong?.videoID ? 'bg-dedicatii-bg/20' : ''
                  }`}
                  onClick={() => handleSongSelect(song)}
                >
                  <img className="w-12 h-12 object-cover rounded" src={song.thumbnail} alt={song.title} />
                  <div className="flex-grow">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm opacity-75">{song.artist}</p>
                  </div>
                  {song.isDedication && (
                    <FontAwesomeIcon icon={faHeart} className="text-red-500" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
          />
          <span className="text-sm">{formatTime(duration)}</span>
        </div>
        <div className="flex justify-center items-center gap-4">
          <button className="bg-dedicatii-bg3 p-2 rounded-full" onClick={handlePrev} aria-label="Previous track">
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button className="bg-dedicatii-bg3 p-2 rounded-full" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button className="bg-dedicatii-bg3 p-2 rounded-full" onClick={handleNext} aria-label="Next track">
            <FontAwesomeIcon icon={faForward} />
          </button>
          <button className="bg-dedicatii-bg3 p-2 rounded-full" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-32"
          />
        </div>
      </div>
      <ReactPlayer
        ref={playerRef}
        url={currentSong ? `https://www.youtube.com/watch?v=${currentSong.videoID}` : ''}
        playing={isPlaying}
        volume={volume}
        muted={isMuted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleSongEnd}
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
      />
    </div>
  );
}

export default PlayerComponent;