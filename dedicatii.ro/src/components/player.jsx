import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faPlay, faPause, faForward, faVolumeUp, faVolumeMute, faHeart } from '@fortawesome/free-solid-svg-icons';
import { auth, database } from '../firebaseconfig';
import { ref, onValue, get } from 'firebase/database';
import { httpsCallable, getFunctions } from 'firebase/functions';
import axios from 'axios';

function PlayerComponent() {
  const [playlist, setPlaylist] = useState([]);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [nextSong, setNextSong] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const playerRef = useRef(null);

  const functions = getFunctions(undefined, 'europe-west1');
  const setCurrentQueueBE = httpsCallable(functions, 'setCurrentQueueBE');

  const fetchAccessToken = useCallback(async () => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;
    const tokenRef = ref(database, `nova/${uid}/token/accessToken`);

    try {
      const snapshot = await get(tokenRef);
      if (snapshot.exists()) {
        setAccessToken(snapshot.val());
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
  }, []);

  const fetchYouTubeDetails = useCallback(async (videoId) => {
    if (!accessToken) return null;

    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: 'snippet',
          id: videoId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const videoDetails = response.data.items[0].snippet;
      return {
        videoID: videoId,
        title: videoDetails.title,
        artist: videoDetails.channelTitle,
        thumbnail: videoDetails.thumbnails.medium.url,
      };
    } catch (error) {
      console.error('Error fetching YouTube details:', error);
      return null;
    }
  }, [accessToken]);

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
      const currentQueueRef = ref(database, `nova/${uid}/currentQueue`);

      const unsubscribePlaylist = onValue(playlistRef, (snapshot) => {
        if (!snapshot.exists()) {
          console.error("Playlist not found");
          return;
        }

        const playlistData = snapshot.val();
        const songList = Object.entries(playlistData).map(([key, value]) => ({
          id: key,
          ...value
        }));

        setPlaylist(songList);
      });

      const unsubscribeNextSong = onValue(nextSongRef, async (snapshot) => {
        if (snapshot.exists()) {
          const nextSongVideoId = snapshot.val();
          const nextSongDetails = await fetchYouTubeDetails(nextSongVideoId);
          if (nextSongDetails) {
            setNextSong({ ...nextSongDetails, isDedication: true });
          } else {
            setNextSong({ videoID: nextSongVideoId, isDedication: true });
          }
        } else {
          setNextSong(null);
        }
      });

      const unsubscribeCurrentQueue = onValue(currentQueueRef, (snapshot) => {
        if (snapshot.exists()) {
          const queue = snapshot.val();
          setCurrentQueue(queue);
          if (queue.songs && queue.songs.length > 0) {
            setCurrentSong(queue.songs[0]);
          }
        } else {
          setCurrentQueue(null);
          setCurrentSong(null);
        }
      });

      return () => {
        unsubscribePlaylist();
        unsubscribeNextSong();
        unsubscribeCurrentQueue();
      };
    });
  }, [fetchYouTubeDetails]);

  useEffect(() => {
    fetchAccessToken();
    const cleanup = fetchPlaylistData();
    return () => {
      if (cleanup) cleanup();
    };
  }, [fetchAccessToken, fetchPlaylistData]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrev = async () => {
    if (!currentQueue || !currentQueue.songs || currentQueue.songs.length < 2) return;
    try {
      const result = await setCurrentQueueBE({ videoID: currentQueue.songs[1].videoID });
      console.log("Queue updated successfully:", result.data);
    } catch (error) {
      console.error("Error updating queue:", error);
    }
  };

  const handleNext = async () => {
    if (!currentQueue || !currentQueue.songs || currentQueue.songs.length < 2) return;
    try {
      const result = await setCurrentQueueBE({ videoID: currentQueue.songs[1].videoID });
      console.log("Queue updated successfully:", result.data);
    } catch (error) {
      console.error("Error updating queue:", error);
    }
  };

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

  const handleSongSelect = async (song) => {
    console.log("Selected song:", song.videoID);
    try {
      const result = await setCurrentQueueBE({ videoID: song.videoID });
      console.log("Queue updated successfully:", result.data);
    } catch (error) {
      console.error("Error updating queue:", error);
    }
  };

  const handleSongEnd = () => {
    handleNext();
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="player p-6 text-white m-4 bg-dedicatii-bg rounded-lg shadow-xl">
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
        <div className="md:w-1/2 flex flex-col h-72 md:h-full">
          <div className="bg-dedicatii-bg3 p-4 rounded-lg flex-grow overflow-hidden flex flex-col">
            <h4 className="text-xl font-semibold mb-4">Playlist</h4>
            {nextSong && (
              <div className="mb-4 p-2 bg-red-500 bg-opacity-20 rounded-lg">
                <h5 className="font-semibold">Urmatoarea dedicatie:</h5>
                <div className="flex items-center gap-2">
                  <img className="w-12 h-12 object-cover rounded" src={nextSong.thumbnail || 'https://via.placeholder.com/48'} alt={nextSong.title || 'Next Song'} />
                  <div>
                    <p className="font-medium">{nextSong.title || 'Loading...'}</p>
                    <p className="text-sm opacity-75">{nextSong.artist || 'Unknown artist'}</p>
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
                  {song.dedicatie && (
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
        <div className="flex justify-center items-center gap-4 bg-dedicatii-bg3 rounded-lg shadow-2xl">
          <button className=" p-2 rounded-full" onClick={handlePrev} aria-label="Previous track">
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button className=" p-2 rounded-full" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button className=" p-2 rounded-full" onClick={handleNext} aria-label="Next track">
            <FontAwesomeIcon icon={faForward} />
          </button>
          <button className="p-2 rounded-full" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
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