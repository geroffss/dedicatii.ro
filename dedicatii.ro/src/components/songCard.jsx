export const SongCard = ({ song, onClick }) => {
  return (
    <div className="font-inter flex flex-col items-center gap-y-2 rounded bg-[#D9D9D9] bg-opacity-10 py-2 text-center text-white shadow-md hover:shadow-lg transition-shadow duration-300 w-[158px] h-[252px]">
      <aside className="flex h-[125px] w-full flex-shrink-0 flex-col items-center">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="h-[125px] w-[122px] flex-shrink-0 rounded-md object-cover object-center"
          loading="lazy"
          onClick={onClick}
        />
      </aside>
      <div className="flex flex-col items-center">
        <h2 className="self-stretch font-medium text-base w-[140px] line-clamp-1">
          {song.title}
        </h2>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="self-stretch font-light text-sm w-[140px] line-clamp-1">
          {song.artist}
        </h2>
      </div>
      <button
        className="bg-[#D9D9D9] bg-opacity-10 text-white py-2 px-4 rounded-md w-[138px] transition-colors duration-300 mb-1"
        onClick={onClick}
      >
        Dedică
      </button>
    </div>
  );
};
