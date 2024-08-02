import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseconfig";

const QrCode = ({ playlistId, currentSong }) => {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);
    }
  }, []);

  const generateQRCodeValue = () => {
    if (!playlistId || !currentSong || !uid) return '';
    const currentDomain = window.location.origin;
    return `${currentDomain}/charlie/${uid}`;
  };

  const url = generateQRCodeValue();

  return (
    <div className="bg-gray-800 p-4 text-center self-center flex justify-center items-center content-center flex-col w-full">
      <h1 className="text-white text-lg mb-4">QR Code</h1>
      {url && <QRCode value={url} size={256} />}
      <p className="text-white mt-4">Scan to view the playlist and current song</p>
    </div>
  );
};

export default QrCode;