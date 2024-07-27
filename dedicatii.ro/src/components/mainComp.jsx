import React, { useState } from "react";
import QRCode from "qrcode.react"; // Assuming you are using 'qrcode.react' library

const MainComp = ({ selectedMenu }) => {
    const [isQrGenerated, setIsQrGenerated] = useState(false);

    const handleGenerateQr = () => {
        setIsQrGenerated(true);
    };

    return (
        <div className="p-4">
            {selectedMenu === "Import Playlist" && <div>Import Playlist Component</div>}
            {selectedMenu === "Playlist" && <div>Playlist Component</div>}
            {selectedMenu === "QR Code" &&
                <div>
                    {!isQrGenerated && (
                        <button 
                            className="bg-blue-500 text-white p-2 rounded"
                            onClick={handleGenerateQr}
                        >
                            Generate QR Code
                        </button>
                    )}
                    {isQrGenerated && (
                        <div className="mt-4">
                            <QRCode value="https://example.com" />
                        </div>
                    )}
                </div>
            }
            {selectedMenu === "Generate Code" && <div>Generate Code Component</div>}
            {selectedMenu === "Last Purchases" && <div>Last Purchases Component</div>}
        </div>
    );
};

export default MainComp;