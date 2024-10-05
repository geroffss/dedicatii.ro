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
      const url = `${currentDomain}/charlie/${uid}?redirect=${encodeURIComponent(currentDomain + '/charlie/' + uid)}`;
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=256x256`;
  
      setQrCodeUrl(qrCodeApiUrl);
    }
  }, [uid]);

  return (
    <div className="p-4 text-center flex justify-center items-center flex-col w-full">
      <button
        className="bg-dedicatii-button3 text-white px-4 py-2 rounded-lg mb-4"
        onClick={generateQRCodeValue}
      >
        Generare cod QR...
      </button>
      <div id="qr-code" className="qr-code-container">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code" />
        ) : (
          <p className="hidden">Apasă butonul pentru a genera codul QR.</p>
        )}
      </div>
    </div>
  );
};

export default QrCode;
