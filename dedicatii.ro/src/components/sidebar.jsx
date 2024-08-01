import React from "react";
import Logout from "./logout";

const Sidebar = ({ onMenuSelect }) => {
    return (
        <div className="w-full md:w-64 bg-slate-800 px-4">
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
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-gray-900 focus:outline-none"
                        onClick={() => onMenuSelect("Possible Queue")}
                    >
                        Possible Queue
                    </button>
                </li>
                <li className="mb-2 flex gap-2 md:hidden text-white">
                    <Logout/>
                    <p>Logout</p>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;