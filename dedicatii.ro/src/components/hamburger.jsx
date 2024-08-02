import React, { useState, useEffect } from 'react';
import Logout from './logout.jsx';


const HamburgerMenu2 = ({ isOpen, onMenuSelect }) => {
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    useEffect(() => {
        if (isRedeemModalOpen || isQRModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isRedeemModalOpen, isQRModalOpen]);

    return (
        isOpen && (
            <div className="absolute top-full left-0 w-full shadow-lg z-30 bg-dedicatii-bg">
                <div className="font-inter flex h-full w-full flex-shrink-0 flex-col items-center overflow-clip text-start font-medium text-white">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center p-2 text-center">
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
                </li>
            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default HamburgerMenu2;
