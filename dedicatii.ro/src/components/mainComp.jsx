import React from "react";
import CodeGen from "./codeGen";
import ImportComp from "./importPlaylist";

const MainComp = ({ selectedMenu }) => {
    return (
        <div className="">
            {selectedMenu === "Import Playlist" && <div><ImportComp/></div>}
            {selectedMenu === "Generate Code" && <div><CodeGen/></div>}
            {selectedMenu === "Last Purchases" && <div>Last Purchases Component</div>}
        </div>
    );
};

export default MainComp;