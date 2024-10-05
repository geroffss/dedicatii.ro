import React from 'react';

const BotBar = ({ videoDetails, setIsCurrentSongVisible }) => {
  if (!videoDetails) return null;

  return (
    <button 
      onClick={() => setIsCurrentSongVisible((prevState) => !prevState)}
      className="fixed bottom-0 left-0 right-0 z-30 bg-dedicatii-bg text-white p-2 flex items-center h-[84px] pl-5"
    >
      <img 
        src={videoDetails.thumbnail} 
        alt={videoDetails.title} 
        className="h-16 w-16 rounded mr-4 object-cover"
      />
      <div className="current-song text-start">
        <p><strong>{videoDetails.title}</strong></p>
        <p className="font-light">{videoDetails.artist}</p>
      </div>
    </button>
  );
};

export default BotBar;