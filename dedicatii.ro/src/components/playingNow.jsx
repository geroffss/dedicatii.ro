import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { app } from '../firebaseconfig';

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

export const PlayingNow = ({ data }) => {

  const [nextSongs, setNextSongs] = useState(null)
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (nextSongs === null) {
      fetchSongs()
    }
  }, [nextSongs])

  const fetchSongs = async () => {
    const functions = getFunctions(app, 'europe-central2');
    const getNextSongsFunction = httpsCallable(functions, 'currentQueue');

    const result = await getNextSongsFunction()
    setNextSongs(result.data.songs ?? [])
    setRemaining(result.data.remaining ?? 0)
    console.log(result, 'next songs data')
  }

    return (
      <motion.div {...animationVariants} className='bg-dedicatii-bg2 h-[63rem] w-full absolute top-[56px] left-0 z-10 p-4'>
        
        {/* playing now card */}
        <div className='flex flex-col items-center justify-center w-full h-[456px] bg-[#D9D9D9] bg-opacity-10 rounded-md mt-2'>
          <motion.img {...albumArtAnimation} src={data.thumbnail} alt={data.title} className='h-[264px] w-[260px] mt-2 rounded object-cover' />
          <div className='current-song text-center'>
            <p className="text-[40px] text-white">{data.title}</p>
            <p className='text-[40px] text-white font-light mb-4 mt-2'>{data.artist}</p>
          </div>
        </div>

        {/* queued songs list */}
        <div className='flex'>
          <p className="text-xl font-bold text-white text-start ml-4 mt-8">Melodii în rând</p>
          <p className="text-xl font-light text-white text-start ml-4 mt-8">Și încă {remaining}</p>
        </div>
        <div className='flex flex-col w-full mt-2 gap-0.5'>

        {/* queued songs */}
        {nextSongs?.map((song, index) =>
          <div key={song.title + index} className='h-[70px] bg-[#2D2836] flex items-center gap-3 px-2'>
            <img src={song.thumbnail} alt={song.title} className='h-[49px] w-[49px] object-cover' />
            <div className='text-start'>
              <p className='text-white font-bold'>{song.title}</p>
              <p className='text-white font-light'>{song.artist}</p>
            </div>
            {song.dedicatie && (
              <div className='flex flex-col items-center ml-auto mr-2'>
                <FontAwesomeIcon icon={faStar} color='white' className='w-[37px] h-[37px]' />
                <p className='text-white text-[10px]'>Dedicație</p>
              </div>
            )}
          </div>
        )}
        </div>
      </motion.div>
    )
}