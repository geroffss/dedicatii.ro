import React from "react";

const Sidebar = ({ onMenuSelect }) => {
    return (
        <div className="w-full md:w-64 bg-slate-800 p-4">
            <h2 className="text-xl font-bold mb-10 text-white">Menu</h2>
            <ul>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-gray-900 focus:outline-none"
                        onClick={() => onMenuSelect("Import Playlist")}
                    >
                        Import Playlist
                    </button>
                </li>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-gray-900 focus:outline-none"
                        onClick={() => onMenuSelect("Playlist")}
                    >
                        Playlist
                    </button>
                </li>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-gray-900 focus:outline-none"
                        onClick={() => onMenuSelect("QR Code")}
                    >
                        QR Code
                    </button>
                </li>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-gray-900 focus:outline-none"
                        onClick={() => onMenuSelect("Generate Code")}
                    >
                        Generate Code
                    </button>
                </li>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-gray-900 focus:outline-none"
                        onClick={() => onMenuSelect("Last Purchases")}
                    >
                        Last Purchases
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;