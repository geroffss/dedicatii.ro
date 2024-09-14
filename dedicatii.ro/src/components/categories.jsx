import { useEffect, useState } from "react"
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebaseconfig';
import { CategoryCard } from "./categoryCard";

export const Categories = () => {
  const [categories, setCategories] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])

  const getCategories = async () => {
    const functions = getFunctions(app, 'europe-central2');
    const getNextSongsFunction = httpsCallable(functions, 'getCategories');

    const result = await getNextSongsFunction();
    setCategories(result.data);
    setSelectedCategories(
      result.data
        .filter((category) => category.active)
        .map((category) => category.name)
    );
    console.log(result);
  }

  const submitCategories = async () => {
    const functions = getFunctions(app, 'europe-central2');
    const getNextSongsFunction = httpsCallable(functions, 'getCategories');

    await getNextSongsFunction({ selectedCategories })
  }

  useEffect(() => {
    if (!categories) {
      getCategories()
    }
  }, [categories])

    return (
      <div className="w-full p-4">
        <p className="text-2xl text-white mb-2">Categorii Selectate</p>
        <div className="flex gap-4 mb-4">
          {categories?.map(
            (category) =>
              category.active && (
                <button
                  key={category.id}
                  className={`bg-[#D9D9D9] bg-opacity-10 w-[157px] h-[196px] flex flex-col items-center justify-center cursor-pointer rounded-md`}
                >
                  <img
                    src={category.thumbnail}
                    alt={category.name}
                    className="h-[123px] w-[125px] flex-shrink-0 rounded-md object-cover object-center"
                    loading="lazy"
                  />
                  <p className="text-white text-center line-clamp-2 break-words max-w-32">
                    {category.name}
                  </p>
                </button>
              )
          )}
        </div>
        <p className="text-2xl text-white mb-2">Alege Categoriile</p>
        <div className="flex gap-4">
          {categories?.map((category) => (
            <CategoryCard
              category={category}
              className={`${
                selectedCategories.includes(category.name) &&
                'border-2 border-white'
              }`}
              onClick={() => {
                if (!selectedCategories.includes(category.name)) {
                  setSelectedCategories((prevState) => [
                    ...prevState,
                    category.name,
                  ]);
                } else {
                  setSelectedCategories(() =>
                    selectedCategories.filter(
                      (catName) => catName !== category.name
                    )
                  );
                }
              }}
            />
          ))}
        </div>

        <button
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg my-4"
          onClick={() => submitCategories()}
        >
          Submit
        </button>
      </div>
    );
}