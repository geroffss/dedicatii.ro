import { CategoryCard } from "./categoryCard"
import { useEffect, useState } from "react"
import { SongCard } from "./songCard"
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ref, get, getDatabase } from 'firebase/database';
import { app } from '../firebaseconfig';

export const CategoriesView = ({ onDedicateSong, novaID, onBackClick, isCurrentSongVisible }) => {
  const [isSongView, setIsSongView] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [songs, setSongs] = useState(null)
  const [categories, setCategories] = useState(null)

  const onSelectCategory = (category) => {
    setSelectedCategory(category)
    setIsSongView(true)
  }

  const getCategories = async () => {
    const functions = getFunctions(app, 'europe-central2');
    const getCategoriesCharlie = httpsCallable(functions, 'getCategoriesCharlie');

    const result = await getCategoriesCharlie({ novaID })
    setCategories(result.data);
  }

  const getCategorySongs = async (category) => {
    const db = getDatabase(app);
    const possibleQueueRef = ref(db, `categoriiSimple/${category.name}`);
    const snapshot = await get(possibleQueueRef)
    const result = snapshot.val()
    setSongs(result)
  }

  useEffect(() => {
    if (!categories) {
      getCategories()
    }
  }, [categories])

  useEffect(() => {
    if (isSongView) {
      getCategorySongs(selectedCategory)
    }
  }, [isSongView])

  return (
    <div className={`bg-dedicatii-bg2 min-h-screen mt-[56px]`}>
      <div className={`${isCurrentSongVisible && 'hidden'}`}>
      {isSongView ? (
        <>
          <div>
            <p
              className="text-white ml-4 pt-2"
              onClick={() => setIsSongView(false)}
            >
              Inapoi
            </p>
            <p className="text-xl text-white font-bold text-center pt-2 mb-4">
              {selectedCategory?.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center pb-24">
            {songs?.map((song) => (
              <SongCard
                key={song.name}
                song={song}
                onClick={() => onDedicateSong(song)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <p
            className="text-white ml-4 pt-2"
            onClick={onBackClick}
          >
            Inapoi
          </p>
          <p className="text-xl text-white font-bold text-center pt-2 mb-4">
            Categorii
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories?.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                onClick={() => onSelectCategory(category)}
              />
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}