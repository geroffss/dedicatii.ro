import React, { useEffect } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { code } = queryString.parse(window.location.search);

    if (code) {
      console.log('Authorization code found:', code);
      const codeVerifier = window.localStorage.getItem('code_verifier');

      if (!codeVerifier) {
        console.error('Code verifier not found in localStorage.');
        alert('Failed to log in to Spotify. Please try again later.');
        return;
      }

      console.log('Code verifier found:', codeVerifier);

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
        client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        code_verifier: codeVerifier,
      }).toString();

      console.log('Request parameters:', params);

      axios.post(
        'https://accounts.spotify.com/api/token', // Use the proxy path
        params,
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(process.env.REACT_APP_SPOTIFY_CLIENT_ID + ':' + process.env.REACT_APP_SPOTIFY_CLIENT_SECRET),
          },
        }
      )
      .then(response => {
        const { access_token } = response.data;
        console.log('Spotify access token received:', access_token);
        localStorage.setItem('spotify_access_token', access_token);
        navigate('/main');
      })
      .catch(error => {
        console.error('Spotify API Error:', error.response ? error.response.data : error.message);
        alert('Failed to log in to Spotify. Please try again later.');
      });
    } else {
      console.error('Authorization code not found in URL.');
      alert('Failed to log in to Spotify. No authorization code found.');
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Callback;