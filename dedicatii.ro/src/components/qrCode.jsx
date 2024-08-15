import React, { useEffect, useState, useCallback } from "react";
import QRCodeStyling from "qr-code-styling";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseconfig";

const QrCode = () => {
  const [uid, setUid] = useState(null);
  const [url, setUrl] = useState('');

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
      setUrl(url);
    }
  }, [uid]);

  useEffect(() => {
    if (!url) return;

    const qrCodeInstance = new QRCodeStyling({
      width: 256,
      height: 256,
      data: url,
      image: null,
      dotsOptions: {
        color: "#000",
      },
      backgroundOptions: {
        color: "#fff",
      },
    });

    const qrCodeContainer = document.getElementById("qr-code");
    if (qrCodeContainer) {
      qrCodeContainer.innerHTML = ""; // Clear previous QR code
      qrCodeInstance.append(qrCodeContainer);
    }

    return () => {
      if (qrCodeContainer) {
        qrCodeContainer.innerHTML = "";
      }
    };
  }, [url]);

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
        {!url && <p className="text-white">Generating QR Code...</p>}
      </div>
      <p className="text-white mt-4">Scan to view the playlist and current song</p>
    </div>
  );
};

export default QrCode;
