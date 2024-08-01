import React, { useState } from 'react';
import { getDatabase } from 'firebase/database';
import { app } from '../firebaseconfig';
import { ref, get, update } from 'firebase/database';
import { getAuth } from "firebase/auth";


const PossibleQueue = () => {
    const [newPossibleQueueVideoId, setNewPossibleQueueVideoId] = useState('');

    const addVideoToPossibleQueue = async (videoId) => {
        const db = getDatabase(app);
        const auth = getAuth(app);
        const uid = auth.currentUser.uid;
        console.log(uid);
        const possibleQueueRef = ref(db, `nova/${uid}/possibleQueue`);
    
        try {
            const snapshot = await get(possibleQueueRef);
            const data = snapshot.val();
            let nextIndex = 0;
    
            if (data) {
                const indices = Object.keys(data).map(Number);
                nextIndex = indices.length ? Math.max(...indices) + 1 : 0;
            }
            await update(possibleQueueRef, { [nextIndex]: videoId });
    
            console.log('Video added to possibleQueue successfully.');
        } catch (error) {
            console.error('Error adding video to possibleQueue:', error);
        }
    };
    return (
        <div>
               <input 
                    type="text" 
                    placeholder="Enter video ID for possible queue" 
                    className="border p-2 mb-4 w-1/2 mx-auto"
                    value={newPossibleQueueVideoId}
                    onChange={(e) => setNewPossibleQueueVideoId(e.target.value)}
                />
                <button 
                    className="bg-purple-500 text-white py-2 px-4 rounded mb-4"
                    onClick={() => addVideoToPossibleQueue(newPossibleQueueVideoId)}
                >
                    Add to Possible Queue
                </button>
        </div>
    );
}

export default PossibleQueue;