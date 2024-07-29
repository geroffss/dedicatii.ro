import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import MainComp from "../components/mainComp";
import Botbar from "../components/botbar";
import PlayerComponent from "../components/player";

const Main = () => {
    const [selectedMenu, setSelectedMenu] = useState("Import Playlist");

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Topbar */}
            <Topbar className="w-full" />

            <div className="flex flex-1 flex-col md:flex-row">
                {/* Sidebar */}
                <Sidebar onMenuSelect={setSelectedMenu} className="mt-10" />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Main Section */}
                    <div className="flex flex-col gap-5 h-fit bg-gray-900">
                        <PlayerComponent />
                        <MainComp selectedMenu={selectedMenu} />
                    </div>
                     
                    {/* Botbar */}
                </div>
            </div>
        </div>
    );
}

export default Main;