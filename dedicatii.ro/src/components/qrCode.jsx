import React from "react";
import QRCode from "qrcode.react";

const QrCode = ({ playlistId, currentSong }) => {
  const generateQRCodeValue = () => {
    if (!playlistId || !currentSong) return '';
    const currentDomain = window.location.origin;
    return `${currentDomain}/charlie/${playlistId}/${currentSong}`;
  };

  const url = generateQRCodeValue();

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-center">
      <h1 className="text-white text-lg mb-4">QR Code</h1>
      {url && <QRCode value={url} size={256} />}
      <p className="text-white mt-4">Scan to view the playlist and current song</p>
    </div>
  );
};

export default QrCode;