import React, { useState } from 'react';
import CharlieTopBar from '../components/charlieTopBar';
import Modal from 'react-modal';
import QrScanner from 'react-qr-scanner';

const CharliePage = () => {
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrResult, setQrResult] = useState('');

    const handleRedeemCode = () => {
        setIsRedeemModalOpen(true);
    };

    const handleScanQRCode = () => {
        setIsQRModalOpen(true);
    };

    const handleQRScan = (data) => {
        if (data) {
            setQrResult(data.text);
            setIsQRModalOpen(false);
        }
    };

    const handleQRError = (error) => {
        console.error(error);
    };

    return (
        <div className=" text-center">
            <CharlieTopBar />
            <h1 className="text-2xl md:text-4xl mb-4">Charlie's Page</h1>
            <p className="text-lg md:text-xl mb-4">Welcome to Charlie's page!</p>
            <div className="flex flex-col items-center">
            <button 
                className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                onClick={handleRedeemCode}
            >
                Redeem Code
            </button>
            <button 
                className="bg-green-500 text-white py-2 px-4 rounded"
                onClick={handleScanQRCode}
            >
                Scan QR Code
            </button>

            </div>
            
            <Modal
                isOpen={isRedeemModalOpen}
                onRequestClose={() => setIsRedeemModalOpen(false)}
                contentLabel="Redeem Code Modal"
                className="bg-white p-4 rounded shadow-lg max-w-md mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <h2 className="text-xl mb-4">Redeem Code</h2>
                <input 
                    type="text" 
                    placeholder="Enter your code" 
                    className="border p-2 w-full mb-4"
                />
                <button 
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                    onClick={() => setIsRedeemModalOpen(false)}
                >
                    Submit
                </button>
            </Modal>

            <Modal
                isOpen={isQRModalOpen}
                onRequestClose={() => setIsQRModalOpen(false)}
                contentLabel="Scan QR Code Modal"
                className="bg-white p-4 rounded shadow-lg max-w-md mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <h2 className="text-xl mb-4">Scan QR Code</h2>
                <QrScanner
                    delay={300}
                    onError={handleQRError}
                    onScan={handleQRScan}
                    style={{ width: '100%' }}
                    constraints={{
                        video: { facingMode: { exact: "environment" } }
                    }}
                />
                {qrResult && <p className="mt-4">Scanned Result: {qrResult}</p>}
                <button 
                    className="bg-red-500 text-white py-2 px-4 rounded mt-4"
                    onClick={() => setIsQRModalOpen(false)}
                >
                    Close
                </button>
            </Modal>
        </div>
    );
}

export default CharliePage;