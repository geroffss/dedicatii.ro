import React, { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import Logout from './logout.jsx';
import Modal from 'react-modal';
import { app } from '../firebaseconfig';
import { getFunctions, httpsCallable } from 'firebase/functions';

const HamburgerMenu = ({ isOpen, toggleMenu }) => {
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrResult, setQrResult] = useState('');
    const [redeemCode, setRedeemCode] = useState('');
    const [isMediaSupported, setIsMediaSupported] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setIsMediaSupported(false);
        }
    }, []);

    useEffect(() => {
        if (isRedeemModalOpen || isQRModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isRedeemModalOpen, isQRModalOpen]);

    const handleRedeemCode = () => {
        setIsRedeemModalOpen(true);
    };

    const handleScanQRCode = () => {
        setIsQRModalOpen(true);
    };

    useEffect(() => {
        let codeReader;
        if (isQRModalOpen && isMediaSupported) {
            codeReader = new BrowserQRCodeReader();
            codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
                if (result) {
                    console.log('Scanned QR code result:', result.getText());
                    setQrResult(result.getText());
                    setIsQRModalOpen(false);

                    try {
                        const parsedUrl = new URL(result.getText());
                        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
                            console.log('Redirecting to:', parsedUrl.href);
                            window.location.assign(parsedUrl.href);
                        } else {
                            console.log('Scanned data is not a URL:', result.getText());
                            alert('Scanned data is not a URL.');
                        }
                    } catch (error) {
                        console.log('Scanned data is not a valid URL:', result.getText());
                        alert('Scanned data is not a valid URL.');
                    }
                }
                if (err) {
                    if (err.name !== 'NotFoundException') {
                        console.error('QR Code scanning error:', err);
                    }
                }
            }).catch(err => {
                console.error('Error starting QR code scanner:', err);
            });
        }

        return () => {
            if (codeReader) {
                codeReader.reset();
            }
        };
    }, [isQRModalOpen, isMediaSupported]);

    const handleRedeemSubmit = async () => {
        const functions = getFunctions(app, 'europe-central2');
        const redeemCodeFunction = httpsCallable(functions, 'redeemCode');

        try {
            const result = await redeemCodeFunction({ code: redeemCode });
            console.log('Code redeemed successfully:', result.data);
        } catch (error) {
            console.error('Error redeeming code:', error);
        }

        setIsRedeemModalOpen(false);
    };

    return (
        isOpen && (
            <div className="absolute top-full left-0 w-full shadow-lg z-30 bg-dedicatii-bg">
                <div className="font-inter flex h-full w-full flex-shrink-0 flex-col items-center overflow-clip text-start font-medium text-white">
                    <div className="flex flex-col items-center">
                        <button
                            className="flex items-center justify-center p-2 text-center"
                            onClick={handleRedeemCode}
                        >
                            Adaugă cod
                        </button>
                    </div>
                    <div className="flex flex-col items-center">
                        <button
                            className="flex items-center justify-center p-2 text-center"
                            onClick={handleScanQRCode}
                        >
                            Scanează
                        </button>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center p-2 text-center">
                            <Logout />
                        </div>
                    </div>
                    <Modal
                        isOpen={isRedeemModalOpen}
                        onRequestClose={() => setIsRedeemModalOpen(false)}
                        contentLabel="Redeem Code Modal"
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-full text-center -translate-y-1/2 bg-dedicatii-bg p-4 rounded shadow-lg max-w-md mx-auto z-40 text-white"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-80 z-40"
                    >
                        <h2 className="text-xl mb-4">Adaugă cod</h2>
                        <input
                            type="text"
                            placeholder="Adaugă codul..."
                            className="border p-2 w-full mb-4 rounded-lg text-black"
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value)}
                        />
                        <button
                            className="bg-dedicatii-button3 text-white py-2 px-4 rounded-lg"
                            onClick={handleRedeemSubmit}
                        >
                            Activează codul
                        </button>
                    </Modal>
                    <Modal
                        isOpen={isQRModalOpen}
                        onRequestClose={() => setIsQRModalOpen(false)}
                        contentLabel="Scan QR Code Modal"
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-full text-center -translate-y-1/2 bg-dedicatii-bg p-4 rounded shadow-lg max-w-md mx-auto z-40 text-white"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-80 z-40"
                    >
                        <h2 className="text-xl mb-4">Scanează codul QR</h2>
                        {isMediaSupported ? (
                            <video ref={videoRef} style={{ width: '100%' }} />
                        ) : (
                            <p className="text-red-500">QR scanning is not supported in this browser.</p>
                        )}
                        {qrResult && <p className="mt-4">Scanned Result: {qrResult}</p>}
                        <button
                            className="bg-red-500 text-white py-2 px-4 rounded mt-4"
                            onClick={() => setIsQRModalOpen(false)}
                        >
                            Inchide
                        </button>
                    </Modal>
                </div>
            </div>
        )
    );
};

export default HamburgerMenu;
