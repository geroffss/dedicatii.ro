import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

const PlayerComponent = ({ accessToken }) => {
  const [playlist, setPlaylist] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (accessToken) {
      spotifyApi.setAccessToken(accessToken);

      const fetchPlaylist = async () => {
        try {
          const response = await spotifyApi.getPlaylist('37i9dQZF1DX186v583rmzp');
          setPlaylist(response.tracks.items);
        } catch (error) {
          console.error('Error fetching playlist', error);
        }
      };

      fetchPlaylist();

      // Spotify Web Playback SDK
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Spotify Player',
          getOAuthToken: cb => { cb(accessToken); },
          volume: 0.5,
        });

        player.addListener('ready', ({ device_id }) => {
          setDeviceId(device_id);
        });

        player.connect();
        setPlayer(player);
      };

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [accessToken]);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.resume();
    }
    setIsPlaying(!isPlaying);
  };

  // Other playback controls...

  return (
    <div>
      {/* Render player UI */}
    </div>
  );
};

export default PlayerComponent;
