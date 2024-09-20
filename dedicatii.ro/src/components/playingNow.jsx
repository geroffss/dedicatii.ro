import { motion } from 'framer-motion'
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const animationVariants = {
  initial: {y: 1000, opacity: 0.5},
  animate: {y: 0, opacity: 1},
  exit: {y: 1000, opacity: 0.5},
  transition: { ease: "easeIn", duration: 0.3 }
}

const albumArtAnimation = {
  initial: {x: -150, opacity: 0.5},
  animate: {x: 0, opacity: 1},
  exit: {x: -150, opacity: 0.5, height: 0, width: 0},
  transition: { ease: "easeIn", duration: 0.3 }
}

export const PlayingNow = ({ queue }) => {

    return (
      <motion.div
        {...animationVariants}
        className="bg-dedicatii-bg2 h-[63rem] w-full absolute top-[56px] left-0 z-10 p-4"
      >
        {/* playing now card */}
        <div className="flex flex-col items-center justify-center w-full h-[456px] bg-[#D9D9D9] bg-opacity-10 rounded-md mt-2">
          <motion.img
            {...albumArtAnimation}
            src={queue.songs[0].thumbnail}
            alt={queue.songs[0].title}
            className="h-[264px] w-[260px] mt-2 rounded object-cover"
          />
          <div className="current-song text-center">
            <p className="text-3xl font-bold text-white mt-2">
              {queue.songs[0].title}
            </p>
            <p className="text-1xl text-white font-light mb-4 mt-2">
              {queue.songs[0].artist}
            </p>
          </div>
        </div>

        {/* queued songs list */}
        <div className="flex">
          <p className="text-xl font-bold text-white text-start mt-4">
            Melodii în rând
          </p>
          
        </div>
        <div className="flex flex-col w-full mt-2 gap-0.5 ">
          {/* queued songs */}
          {queue.songs?.slice(1).map((song, index) => (
            <div
              key={song.title + index}
              className="h-[70px] bg-[#2D2836] flex items-center gap-3 px-2"
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="h-[49px] w-[49px] object-cover"
              />
              <div className="text-start">
                <p className="text-white font-bold">{song.title}</p>
                <p className="text-white font-light">{song.artist}</p>
              </div>
              {song.dedicatie && (
                <div className="flex flex-col items-center ml-auto mr-2">
                  <FontAwesomeIcon
                    icon={faStar}
                    color="white"
                    className="w-[37px] h-[37px]"
                  />
                  <p className="text-white text-[10px]">Dedicație</p>
                </div>
              )}
            </div>
            
          ))}
          <>
          <p className="text-xl font-light text-white text-start">
            + {queue.remaining} dedicații
          </p></>
        </div>
      </motion.div>
    );
}