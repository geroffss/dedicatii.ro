import React from "react";

const Topbar = () => {

    return (
        <div className="flex items-center justify-end bg-slate-800 p-4">
        <div className="flex items-end justify-end">
            <img src="profile-pic-url" alt="Profile" className="w-10 h-10 rounded-full mr-4" />
            <button className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
    </div>
    );
}

export default Topbar;