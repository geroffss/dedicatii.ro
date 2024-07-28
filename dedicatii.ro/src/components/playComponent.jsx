import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faPlay, faPause, faForward, faPlus } from '@fortawesome/free-solid-svg-icons';

const PlayerControlsComponent = ({ isPlaying, playVideo, pauseVideo, prevVideo, nextVideo, addTempSong }) => {
  return (
    <div className="player-controls flex justify-center mt-6">
      <button className="prev text-white p-3 mx-3 rounded-full" onClick={prevVideo}>
        <FontAwesomeIcon icon={faBackward} />
      </button>
      {isPlaying ? (
        <button className="pause text-white p-3 mx-3 rounded-full" onClick={pauseVideo}>
          <FontAwesomeIcon icon={faPause} />
        </button>
      ) : (
        <button className="play text-white p-3 mx-3 rounded-full" onClick={playVideo}>
          <FontAwesomeIcon icon={faPlay} />
        </button>
      )}
      <button className="next text-white p-3 mx-3 rounded-full" onClick={nextVideo}>
        <FontAwesomeIcon icon={faForward} />
      </button>
      <button className="add-temp-song text-white p-3 mx-3 rounded-full" onClick={addTempSong}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};

export default PlayerControlsComponent;
