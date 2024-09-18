import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../logo2.svg';
import HamburgerMenu from './hamburgerCharlie';

const CharlieTopBar = ({ handleCategoriesClick }) => {
  const [creditsCount, setCreditsCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();
    let unsubscribe;

    const fetchCreditsCount = (uid) => {
      const creditsRef = ref(db, `charlie/${uid}/creditsCount`);
      onValue(creditsRef, (snapshot) => {
        const data = snapshot.val();
        setCreditsCount(data || 0);
      });
    };

    const generateAvatar = (name) => {
      const encodedName = encodeURIComponent(name);
      const avatarUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${name}`;
      setAvatarUrl(avatarUrl);
    };

    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCreditsCount(user.uid);
        setDisplayName(user.displayName || 'User');
        generateAvatar(user.displayName || 'User');
      } else {
        setCreditsCount(0);
        setDisplayName('');
        setAvatarUrl('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("User signed out");
      navigate('/');
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  const handleProfileClick = () => {
    const pathParts = location.pathname.split('/');
    const id = pathParts[2]; // This is the additional ID, not the user ID

    if (id) {
      navigate(`/charlie/${id}/profile`);
    } else {
      navigate('/charlie/profile');
    }
  };

  return (
    <div className="relative flex items-center bg-[#524C5D] p-2">
      <div className="text-white block md:hidden">
        <button 
          onClick={toggleMenu} 
          aria-label="Toggle menu" 
          className="focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <HamburgerMenu
          isOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          handleCategoriesClick={() => {
            setIsMenuOpen(false);
            handleCategoriesClick();
          }}
          selectedMenu
        />
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <img src={logo} alt="Dedicații.ro logo" className="h-10" />
      </div>
      <div className="ml-auto text-white flex items-center gap-4">
        <span className="text-sm md:text-base">{creditsCount} Credite</span>
        <button
          onClick={handleProfileClick}
          className="focus:outline-none focus:ring-2 focus:ring-white rounded-full p-0 overflow-hidden"
          aria-label={`View profile for ${displayName}`}
        >
          <img 
            src={avatarUrl} 
            alt={`${displayName}'s avatar`} 
            className="w-8 h-8 md:w-10 md:h-10 rounded-full"
          />
        </button>
        <button
          onClick={handleLogout}
          className="hidden md:flex focus:outline-none focus:ring-2 focus:ring-white rounded-full p-2"
          aria-label="Sign out"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="text-lg md:text-xl" />
        </button>
      </div>
    </div>
  );
};

export default CharlieTopBar;