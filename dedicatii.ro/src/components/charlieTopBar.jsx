import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { faUser,faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../logo2.svg'
import HamburgerMenu from '../components/hamburgetCharlie';

const CharlieTopBar = () => {
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
    <div className="relative flex items-center bg-dedicatii-bg p-4">
      <div className="text-white block md:hidden">
        <button onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </button>     
        <HamburgerMenu isOpen={isMenuOpen} toggleMenu={toggleMenu}  />

     </div>
    <div className="absolute left-1/2 transform -translate-x-1/2">
      <img src={logo} alt="" className="h-10 " />
    </div>
    <div className="ml-auto text-white flex items-center gap-5">
        <FontAwesomeIcon icon={faUser} />
        <FontAwesomeIcon icon={faSignOutAlt}
        onClick={handleLogout} className="hidden md:flex"/>
    </div>
  </div>
  );
};

export default CharlieTopBar;