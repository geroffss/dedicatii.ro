import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, get, update } from 'firebase/database';
import { getAuth, updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import CharlieTopBar from '../components/charlieTopBar';
import { app } from '../firebaseconfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export const toastStyle = {
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
    marginBottom: '84px',
  },
};

const CharlieProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [credits, setCredits] = useState(0);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [recentDedications, setRecentDedications] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase(app);
    const userId = auth.currentUser.uid;

    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          toast.error('Utilizator neautentificat.', toastStyle);
          return;
        }

        console.log('Authenticated user:', user);

        const userRef = ref(db, `charlie/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const profileData = snapshot.val();
          console.log('User profile data from DB:', profileData);

          const mergedProfile = {
            displayName: user.displayName,
            email: user.email,
            ...profileData,
          };

          setUserProfile(mergedProfile);

          if (!mergedProfile.photoURL) {
            generateAvatar(mergedProfile.displayName, user.uid);
          }
        } else {
          toast.error('Profilul utilizatorului nu a fost găsit.', toastStyle);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Eroare la încărcarea profilului.', toastStyle);
      }
    };

    const fetchCredits = () => {
      const creditsRef = ref(db, `charlie/${userId}/creditsCount`);
      onValue(creditsRef, (snapshot) => {
        const data = snapshot.val();
        setCredits(data || 0);
      });
    };

    const fetchFavoriteGenres = async () => {
      try {
        const genresRef = ref(db, `charlie/${userId}/favoriteGenres`);
        const snapshot = await get(genresRef);
        if (snapshot.exists()) {
          setFavoriteGenres(snapshot.val());
        }
      } catch (error) {
        console.error('Error fetching favorite genres:', error);
      }
    };

    const fetchRecentDedications = async () => {
      try {
        const dedicationsRef = ref(db, `charlie/${userId}/recentDedications`);
        const snapshot = await get(dedicationsRef);
        if (snapshot.exists()) {
          setRecentDedications(snapshot.val());
        }
      } catch (error) {
        console.error('Error fetching recent dedications:', error);
      }
    };

    fetchUserProfile();
    fetchCredits();
    fetchFavoriteGenres();
    fetchRecentDedications();
  }, [id]);

  const generateAvatar = async (displayName, userId) => {
    try {
      const seed = encodeURIComponent(displayName);
      const avatarUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${seed}`;
      const auth = getAuth();
      const db = getDatabase(app);
      await updateProfile(auth.currentUser, { photoURL: avatarUrl });
      await update(ref(db, `charlie/${userId}`), { photoURL: avatarUrl });
      setUserProfile(prevProfile => ({ ...prevProfile, photoURL: avatarUrl }));
      console.log('Avatar generated and updated successfully');
    } catch (error) {
      console.error('Error generating avatar:', error);
      toast.error('Eroare la generarea avatarului.', toastStyle);
    }
  };

  const animation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="text-center bg-dedicatii-bg2 min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <CharlieTopBar />
      </div>

      <motion.div
        initial={animation.initial}
        animate={animation.animate}
        exit={animation.exit}
        className="flex flex-col items-center p-4 pt-16"
      >
        <button
          onClick={handleBack}
          className="absolute top-16 text-xl left-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Go back"
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>

        <h1 className="text-xl font-bold text-white mb-6">Profilul meu</h1>

        {userProfile && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6 w-full max-w-md">
            <img
              src={userProfile.photoURL || '/placeholder-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold text-white mb-2">{userProfile.displayName}</h2>
            <p className="text-lg font-medium text-white mb-2">{credits} Credite</p>

            {favoriteGenres.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-2">Genuri preferate</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {favoriteGenres.map((genre, index) => (
                    <span key={index} className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recentDedications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-2">Dedicații recente</h3>
                <ul className="text-left">
                  {recentDedications.map((dedication, index) => (
                    <li key={index} className="text-gray-300 mb-2">
                      {dedication.songTitle} - {dedication.artist}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {favoriteGenres.length === 0 && recentDedications.length === 0 && (
              <p className="text-gray-300 mt-6">
                Nu ai încă genuri preferate sau dedicații recente. Începe să asculți și să dedici melodii pentru a-ți personaliza profilul!
              </p>
            )}
          </div>
        )}
      </motion.div>

      <Toaster position="bottom-center" />
    </div>
  );
};

export default CharlieProfile;