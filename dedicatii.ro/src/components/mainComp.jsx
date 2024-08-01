import React from "react";
import CodeGen from "./codeGen";
import ImportComp from "./importPlaylist";
import PossibleQueue from "./possibleQueue";

const MainComp = ({ selectedMenu }) => {
    return (
        <div className="">
            {selectedMenu === "Import Playlist" && <div><ImportComp/></div>}
            {selectedMenu === "Generate Code" && <div><CodeGen/></div>}
            {selectedMenu === "Possible Queue" && <div><PossibleQueue/></div>}
        </div>
    );
};

export default MainComp;