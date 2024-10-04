import React from "react";
import Logout from "./logout";
import img from "../imgs/developed-with-youtube-sentence-case-light.png";

const Sidebar = ({ onMenuSelect }) => {
    return (
        <div className="w-48 bg-dedicatii-bg px-4 fixed top-14 left-0 h-full hidden md:flex flex-col z-40">
            <ul className="flex-grow">
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-dedicatii-button3 focus:outline-none font-inter"
                        onClick={() => onMenuSelect("Import Playlist")}
                    >
                        Import Playlist
                    </button>
                </li>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-dedicatii-button3 focus:outline-none font-inter"
                        onClick={() => onMenuSelect("QR Code")}
                    >
                        Cod QR
                    </button>
                </li>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-dedicatii-button3 focus:outline-none font-inter"
                        onClick={() => onMenuSelect("Generate Code")}
                    >
                        Generare Cod
                    </button>
                </li>
                <li className="mb-2 hidden">
                    <button 
                        className="text-white hover:text-dedicatii-button3 focus:outline-none font-inter"
                        onClick={() => onMenuSelect("Last Purchases")}
                    >
                        Last Purchases
                    </button>
                </li>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-dedicatii-button3 focus:outline-none font-inter"
                        onClick={() => onMenuSelect("Possible Queue")}
                    >
                        Adaugă Piese
                    </button>
                </li>
                <li className="mb-2">
                    <button 
                        className="text-white hover:text-dedicatii-button3 focus:outline-none font-inter"
                        onClick={() => onMenuSelect("Categories")}
                    >
                        Categorii
                    </button>
                </li>
                <li className="mb-2 flex gap-2 md:hidden text-white">
                    <Logout />
                </li>
                <li className="mt-auto mb-4">
                <img src={img} alt="Developed with YouTube" />
            </li>
            </ul>
           
        </div>
    );
};

export default Sidebar;