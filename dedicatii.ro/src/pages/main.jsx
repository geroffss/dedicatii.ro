import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import MainComp from "../components/mainComp";
import PlayerComponent from "../components/player";

const Main = () => {
  const [selectedMenu, setSelectedMenu] = useState("Generate Code");
  const [playlistId, setPlaylistId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);

  const handleSongChange = (newPlaylistId, newCurrentSong) => {
    setPlaylistId(newPlaylistId);
    setCurrentSong(newCurrentSong);
  };

  return (
    <div className="flex flex-col min-h-screen bg-dedicatii-bg2">
      {/* Topbar */}
      <Topbar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      <div className="flex flex-1 flex-col md:flex-row mt-14">
        {/* Sidebar */}
        <Sidebar onMenuSelect={setSelectedMenu} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-48"> {/* Add margin to offset the sidebar */}
          {/* Main Section */}
          <div className="flex flex-col gap-5">
            <PlayerComponent />
            <MainComp selectedMenu={selectedMenu} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
