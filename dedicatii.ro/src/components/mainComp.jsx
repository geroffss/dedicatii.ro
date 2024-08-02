import React from "react";
import CodeGen from "./codeGen";
import ImportComp from "./importPlaylist";
import PossibleQueue from "./possibleQueue";
import QrCode from "../components/qrCode";

const MainComp = ({ selectedMenu }) => {

    
    return (
        <div className="bg-dedicatii-bg2  ">
            {selectedMenu === "Import Playlist" && <div><ImportComp/></div>}
            {selectedMenu === "Generate Code" && <div className="flex justify-center"><CodeGen/></div>}
            {selectedMenu === "Possible Queue" && <div><PossibleQueue/></div>}
            {selectedMenu === "QR Code" && <div><QrCode/></div>}
        </div>
    );
};

export default MainComp;