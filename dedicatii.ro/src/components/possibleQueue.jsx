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
    
            console.log('Muzica a fost adaugată cu succes in coada posibilă!');
        } catch (error) {
            console.error('Error adding video to possibleQueue:', error);
        }
    };
    return (
        <div className="flex flex-col items-center justify-center self-center">
               <input 
                    type="text" 
                    placeholder="Introduce ID-ul videoclipului..." 
                    className="border p-2 mb-4 w-1/2 mx-auto rounded-lg "
                    value={newPossibleQueueVideoId}
                    onChange={(e) => setNewPossibleQueueVideoId(e.target.value)}
                />
                <button 
                    className="bg-purple-500 text-white py-2 px-4 rounded-lg mb-4"
                    onClick={() => addVideoToPossibleQueue(newPossibleQueueVideoId)}
                >
                    Adaugă Piesă
                </button>
        </div>
    );
}

export default PossibleQueue;