import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faPlay, faPause, faForward, faPlus } from '@fortawesome/free-solid-svg-icons';


const API_KEY = 'AIzaSyAVaymp99OZmRWQ8ddDfGURCuvK__Qk-yc';
const PLAYLIST_ID = 'PLSptvpnLGQTiLWvdonMb7PE3zbdNh4wua';


const TEMP_SONG = {
    
  snippet: {
    title: 'Temporary Song Title',
    channelTitle: 'Temporary Artist',
    resourceId: {
      videoId: 'MAeydruvY9E'
    },
    thumbnails: {
      default: {
        url: 'https://via.placeholder.com/150'
      }
    }
  }
};

const PlayerComponent = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempSongActive, setTempSongActive] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
          params: {
            part: 'snippet',
            maxResults: 10,
            playlistId: PLAYLIST_ID,
            key: API_KEY,
          },
        });
        setPlaylist(response.data.items);
      } catch (error) {
        console.error('Error fetching playlist', error);
      }
    };

    fetchPlaylist();

    // Load YouTube IFrame Player API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('player', {
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        },
      });
    };
  }, []);

  const onPlayerReady = (event) => {
    if (playlist.length > 0) {
      event.target.loadVideoById(playlist[currentVideoIndex].snippet.resourceId.videoId);
    }
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      if (tempSongActive) {
        setTempSongActive(false);
        nextVideo();
      }
    } else {
      setIsPlaying(false);
    }
  };

  const playVideo = () => {
    playerRef.current.playVideo();
  };

  const pauseVideo = () => {
    playerRef.current.pauseVideo();
  };

  const nextVideo = () => {
    let nextIndex = (currentVideoIndex + 1) % playlist.length;
    if (tempSongActive) {
      setTempSongActive(false);
      nextIndex = currentVideoIndex;
    }
    setCurrentVideoIndex(nextIndex);
    playerRef.current.loadVideoById(playlist[nextIndex].snippet.resourceId.videoId);
  };

  const prevVideo = () => {
    let prevIndex = (currentVideoIndex - 1 + playlist.length) % playlist.length;
    if (tempSongActive) {
      setTempSongActive(false);
      prevIndex = currentVideoIndex;
    }
    setCurrentVideoIndex(prevIndex);
    playerRef.current.loadVideoById(playlist[prevIndex].snippet.resourceId.videoId);
  };

  const addTempSong = () => {
    setTempSongActive(true);
    playerRef.current.loadVideoById(TEMP_SONG.snippet.resourceId.videoId);
  };

  const currentThumbnail = tempSongActive 
    ? TEMP_SONG.snippet.thumbnails.default.url 
    : (playlist.length > 0 ? playlist[currentVideoIndex].snippet.thumbnails.default.url : 'https://via.placeholder.com/150');

  const currentTitle = tempSongActive 
    ? TEMP_SONG.snippet.title 
    : (playlist.length > 0 ? playlist[currentVideoIndex].snippet.title : 'Title Placeholder');

  const currentArtist = tempSongActive 
    ? TEMP_SONG.snippet.channelTitle 
    : (playlist.length > 0 ? playlist[currentVideoIndex].snippet.channelTitle : 'Artist Placeholder');

  return (
    <div className="player p-6 bg-gray-800 text-white rounded-lg shadow-lg max-h-screen">
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
          <ul className="playlist bg-gray-700 p-4 rounded-lg h-48 overflow-y-auto">
            {playlist.map((item, index) => (
              <li 
                key={index} 
                className="mb-2 cursor-pointer hover:bg-gray-600 p-2 rounded" 
                onClick={() => {
                  setCurrentVideoIndex(index);
                  playerRef.current.loadVideoById(item.snippet.resourceId.videoId);
                  setIsPlaying(true);
                  setTempSongActive(false);
                }}
              >
                {item.snippet.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="player-controls flex justify-center mt-6">
        <button className="prev text-white p-3 mx-3 rounded-full" onClick={prevVideo}>
          <FontAwesomeIcon icon={faBackward} />
        </button>
        {isPlaying ? (
          <button className="pause text-white p-3 mx-3 rounded-full" onClick={pauseVideo}>
            <FontAwesomeIcon icon={faPause} />
          </button>
        ) : (
          <button className="play text-white p-3 mx-3 rounded-full " onClick={playVideo}>
            <FontAwesomeIcon icon={faPlay} />
          </button>
        )}
        <button className="next text-white p-3 mx-3 rounded-full " onClick={nextVideo}>
          <FontAwesomeIcon icon={faForward} />
        </button>
        <button className="add-temp-song text-white p-3 mx-3 rounded-full " onClick={addTempSong}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      <div id="player" style={{ display: 'none' }}></div>
    </div>
  );
};

export default PlayerComponent;
