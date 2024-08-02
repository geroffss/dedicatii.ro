import React from 'react';

const BotBar = ({ videoDetails }) => {
  return (
    videoDetails && (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-dedicatii-bg text-white p-2 flex items-center">
        <img 
          src={videoDetails.thumbnail} 
          alt={videoDetails.title} 
          className="h-12 w-12 rounded mr-4 object-cover"
        />
        <div className="current-song">
          <p><strong></strong> {videoDetails.title}</p>
          <p><strong></strong> {videoDetails.artist}</p>
        </div>
      </div>
    )
  );
};

export default BotBar;