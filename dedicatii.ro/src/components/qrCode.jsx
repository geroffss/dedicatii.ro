import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseconfig";

const QrCode = ({ }) => {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);
    }
  }, []);

  const generateQRCodeValue = () => {
    const currentDomain = window.location.origin;
    const url = `${currentDomain}/charlie/${uid}`;
    console.log('Generated QR Code URL:', url);
    return url;
  };

  const url = generateQRCodeValue();

  return (
    <div className="bg-gray-800 p-4 text-center flex justify-center items-center flex-col w-full">
      <h1 className="text-white text-lg mb-4">QR Code</h1>
      {url ? (
        <QRCode value={url} size={256} />
      ) : (
        <p className="text-white">Generating QR Code...</p>
      )}
      <p className="text-white mt-4">Scan to view the playlist and current song</p>
    </div>
  );
};

export default QrCode;
