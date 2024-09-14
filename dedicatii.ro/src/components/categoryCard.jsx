export const CategoryCard = ({ category, className, onClick }) => {
  return (
    <button
      key={category.id}
      className={`bg-[#D9D9D9] bg-opacity-10 w-[157px] h-[196px] flex flex-col items-center justify-center cursor-pointer rounded-md ${className}`}
      onClick={onClick}
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
  );
};
