import { useState } from "react";
import CharlieTopBar from "../components/charlieTopBar";
import profileIcon from '../profileIcon.svg';
import musicNoteIcon from '../musicNoteIcon.svg';
import { httpsCallable, getFunctions } from "firebase/functions";
import { app } from '../firebaseconfig';
import toast from 'react-hot-toast';
import { toastStyle } from '../components/toastStyle';

export const SuggestPage = () => {
  const [artistName, setArtistName] = useState('');
  const [songName, setSongName] = useState('');
  const uid = window.location.pathname.split('/')[2];

  const onSuggestSongClick = async () => {
    const functions = getFunctions(app, 'europe-central2');
    const suggestSong = httpsCallable(functions, 'suggestSong');
    toast.promise(
      suggestSong({ novaID: uid, title: songName, artist: artistName }),
      {
        loading: 'Se adaugă în coadă...',
        success: <b>Melodia a fost sugerată cu succes!</b>,
        error: (
          <b>
            Ceva nu a mers bine.
          </b>
        ),
      },
      toastStyle
    );
  }


  return (
    <div className={`text-center bg-dedicatii-bg2 min-h-screen`}>
      <div className="fixed top-0 left-0 right-0 z-50">
        <CharlieTopBar handleCategoriesClick={() => {}} />
      </div>

      <div className="flex flex-col pt-16">
        <div className="px-6">
          <p className="text-white text-[32px] font-semibold">Sugerează-ne</p>
          <p className="text-white text-lg font-light">
            Spune-ne ce melodie ai vrea să introducem în aplicație.
          </p>
        </div>

        <div className="flex flex-col px-4 gap-2 my-6">
          <div className="flex gap-4 items-center justify-center w-full bg-white bg-opacity-10 rounded-md px-4 py-2">
            <img src={profileIcon} alt='Profile Icon' className="text-white w-6 h-6" />
            <input
              placeholder="Nume artist"
              className="bg-transparent outline-none text-white min-w-0 flex-grow"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
            />
          </div>
          <div className="flex gap-4 items-center justify-center w-full bg-white bg-opacity-10 rounded-md px-4 py-2">
            <img src={musicNoteIcon} alt='Profile Icon' className="text-white w-6 h-6" />
            <input
              placeholder="Nume melodie"
              className="bg-transparent outline-none text-white min-w-0 flex-grow"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
            />
          </div>
        </div>

        <button className="w-56 bg-purple-500 text-white py-2 px-4 rounded-full mx-auto" onClick={onSuggestSongClick}>Trimite</button>
      </div>
    </div>
  );
}