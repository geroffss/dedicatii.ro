import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Logout from "./logout";

const Topbar = () => {
  const [userName, setUserName] = useState("");

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

  return (
    <div className="flex items-center justify-between bg-slate-800 p-4">
    <div className="flex items-center">
      <h1 className="text-white text-2xl">Dedicatii.ro</h1>
    </div>
    <div className="flex items-center">
      <h1 className="text-white mr-4">{userName}</h1>
      <div className="hidden md:block">
      <Logout/>
      </div>

    </div>
  </div>
  );
};

export default Topbar;