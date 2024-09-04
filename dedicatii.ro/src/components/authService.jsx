// authService.js
import queryString from 'query-string';

const authEndpoint = 'https://accounts.spotify.com/authorize';
const clientId = '6bd3265c38fa4100b63214871c3fc1a7'; // Replace with your Spotify client ID
const redirectUri = 'http://localhost:3000/callback'; // Replace with your redirect URI
const scopes = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
];

export const getAccessToken = () => {
  const parsedHash = queryString.parse(window.location.hash);
  return parsedHash.access_token;
};

export const getAuthUrl = () => {
  return `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
};
