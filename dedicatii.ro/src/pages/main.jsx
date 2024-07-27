import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import MainComp from "../components/mainComp";

const Main = () => {
    const [selectedMenu, setSelectedMenu] = useState("Import Playlist");

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar onMenuSelect={setSelectedMenu} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <Topbar />

                {/* Main Section */}
                <MainComp selectedMenu={selectedMenu} />
            </div>
        </div>
    );
}

export default Main;