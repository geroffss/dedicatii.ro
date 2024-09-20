import React, { useState, useEffect } from "react";
import { auth } from '../firebaseconfig';
import { getFunctions, httpsCallable } from 'firebase/functions';

const ImportComp = () => {
  const [user, setUser] = useState(null);
  const [playlistLink, setPlaylistLink] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (event) => {
    setPlaylistLink(event.target.value);
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('User is not logged in');
      return;
    }

    if (!playlistLink) {
      console.error('Playlist link is empty');
      return;
    }

    console.log("Submitted YouTube Playlist Link:", playlistLink);
    const functions = getFunctions(undefined, 'europe-central2');
    const importPlaylist = httpsCallable(functions, 'importPlaylist');

    try {
      const result = await importPlaylist({ playlist: playlistLink });
      console.log("Playlist imported successfully:", result.data);
    } catch (error) {
      console.error("Error importing playlist:", error);
    }
  };

  return (
    <div className="code-gen-container bg-gray-900 text-white p-6 shadow-lg">
      <input
        type="text"
        placeholder="Enter YouTube Playlist Link"
        value={playlistLink}
        onChange={handleInputChange}
        className="p-2 rounded-lg text-black w-full mb-4"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 w-full"
      >
        Submit
      </button>
    </div>
  );
};

export default ImportComp;
