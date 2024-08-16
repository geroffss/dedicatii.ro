import React, { useEffect, useState, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseconfig";

const QrCode = () => {
  const [uid, setUid] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);
    }
  }, []);

  const generateQRCodeValue = useCallback(() => {
    if (uid) {
      const currentDomain = window.location.origin;
      const url = `${currentDomain}/charlie/${uid}`;
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=256x256`;

      setQrCodeUrl(qrCodeApiUrl);
    }
  }, [uid]);

  return (
    <div className="bg-gray-800 p-4 text-center flex justify-center items-center flex-col w-full">
      <h1 className="text-white text-lg mb-4">QR Code</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={generateQRCodeValue}
      >
        Generate QR Code
      </button>
      <div id="qr-code" className="qr-code-container">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code" />
        ) : (
          <p className="text-white">Click the button to generate QR Code...</p>
        )}
      </div>
      <p className="text-white mt-4">Scan to view the playlist and current song</p>
    </div>
  );
};

export default QrCode;
