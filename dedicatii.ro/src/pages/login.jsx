import React, { useEffect } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import logo from '../logo1.svg';

const Login = () => {
  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID; // Accessing environment variable
  const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET; // Accessing environment variable
  const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI; // Accessing environment variable
  const SCOPES = 'user-read-private user-read-email playlist-read-private user-modify-playback-state streaming';
  const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
  const navigate = useNavigate();
  const db = getFirestore();
  console.log('Spotify client ID:', CLIENT_ID); // Log the client ID

  // Function to generate a random string
  const generateRandomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  // Function to generate code challenge from code verifier
  const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const handleSpotifyLogin = async () => {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store the code verifier in localStorage
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = queryString.stringify({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    const authUrl = `${SPOTIFY_AUTHORIZE_URL}?${params}`;
    console.log('Redirecting to Spotify authorization:', authUrl); // Log the full authorization URL
    window.location.href = authUrl;
  };

  useEffect(() => {
    console.log('Current URL:', window.location.href); // Log the full URL
    const { code } = queryString.parse(window.location.search);
    console.log('Parsed query string:', queryString.parse(window.location.search)); // Log the parsed query string

    if (code) {
      console.log('Authorization code found:', code);

      const codeVerifier = window.localStorage.getItem('code_verifier');

      if (!codeVerifier) {
        console.error('Code verifier not found in localStorage.');
        return;
      }

      axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: codeVerifier,
        }).toString(),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
          },
        }
      )
      .then(response => {
        const { access_token } = response.data;
        console.log('Spotify access token received:', access_token);
        localStorage.setItem('spotify_access_token', access_token);
        fetchSpotifyUserProfile(access_token);  // Get user profile after successful login
      })
      .catch(error => {
        console.error('Spotify API Error:', error.response ? error.response.data : error.message);
      });
    } else {
      console.error('Authorization code not found in URL.');
    }
  }, [navigate]);

  const fetchSpotifyUserProfile = async (accessToken) => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const userProfile = response.data;
      console.log('Spotify user profile:', userProfile);
      const { email } = userProfile;
      const userDocRef = doc(db, 'users', email);

      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('User does not exist in Firestore, creating new user document');
        await setDoc(userDocRef, { email, role: 'user' });
        navigate('/user');
      } else {
        const userData = userDoc.data();
        console.log('User data from Firestore:', userData);
        if (userData.role === 'charlie') {
          navigate('/charlie');
        } else if (userData.role === 'nova') {
          navigate('/main');
        } else {
          navigate('/user');
        }
      }
    } catch (error) {
      console.error('Error fetching Spotify user profile:', error);
      alert('Failed to retrieve Spotify user data. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-[#a856eb] via-[#d64061] to-[#211624]">
      <div className="bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-sm w-full">
        <img className="w-[136px] h-[136px] mx-auto" src={logo} alt="Dedicații Logo" />
        <h1 className="text-4xl font-bold mb-2 text-center text-white">Dedicații.ro</h1>
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-200">Piesa ta în boxele localului</h2>
        <button
          className="w-full border border-white text-white py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105"
          onClick={handleSpotifyLogin}
        >
          Sign in with Spotify
        </button>
      </div>
    </div>
  );
};

export default Login;