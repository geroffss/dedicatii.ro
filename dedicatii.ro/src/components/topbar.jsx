import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { faUser, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../logo2.svg';
import HamburgerMenu2 from '../components/hamburger';

const CharlieTopBar = ({ selectedMenu, onMenuSelect }) => {
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User Name");
      } else {
        setUserName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("User signed out");
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  return (
    <div className="flex items-center bg-dedicatii-bg p-4 fixed top-0 left-0 w-full z-50">
      <div className="text-white block md:hidden">
        <button onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </button>     
        <HamburgerMenu2 
          isOpen={isMenuOpen} 
          toggleMenu={toggleMenu} 
          onMenuSelect={onMenuSelect}
        />
      </div>
      <div className="text-xl text-white ml-2 md:ml-0 hidden md:block font-inter font-bold">
        Dedicatii.ro
      </div>
      <div className="ml-auto text-white flex items-center gap-5">
        <FontAwesomeIcon icon={faUser} />
        <FontAwesomeIcon icon={faSignOutAlt} onClick={handleLogout} className="hidden md:flex"/>
      </div>
    </div>
  );
};

export default CharlieTopBar;
