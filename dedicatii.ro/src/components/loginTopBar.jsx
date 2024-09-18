import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../logo2.svg';
import HamburgerMenuLogin from './LoginHamburger';

const LoginTopBar = ({ handleCategoriesClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="absolute top-0 left-0 flex items-center p-2">
      <div className="text-white block">
        <button 
          onClick={toggleMenu} 
          aria-label="Toggle menu" 
          className="focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div ref={menuRef}>
          <HamburgerMenuLogin
            isOpen={isMenuOpen}
            toggleMenu={toggleMenu}
            handleCategoriesClick={() => {
              setIsMenuOpen(false);
              handleCategoriesClick();
            }}
            selectedMenu
          />
        </div>
      </div>
    </div>
  );
};

export default LoginTopBar;