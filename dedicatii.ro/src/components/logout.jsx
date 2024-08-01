import React  from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Logout = () => {
    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
          console.log("User signed out");
        }).catch((error) => {
          console.error("Error signing out: ", error);
        });
      };
    return (
        <div className="flex items-center">
             <button onClick={handleLogout} className=" text-white rounded">
        <FontAwesomeIcon icon={faSignOutAlt} />
      </button>
        </div>
    );
    }

export default Logout;