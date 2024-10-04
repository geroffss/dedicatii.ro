import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import img from '../imgs/developed-with-youtube-sentence-case-light.png';
import privacyPolicyContent from './policy';

const LoginBotBar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleNavigateToPrivacy = () => {
        navigate('/privacy');
    };

    return (
        <div className="text-white justify-center items-center flex flex-col pb-2">
            <img src={img} alt="Developed with YouTube" className="h-20" />
            <div className="flex space-x-4 -mt-4 mb-4">
                <button className="text-xs underline hover:text-gray-300" onClick={handleNavigateToPrivacy}>
                    Politica de Confidențialitate
                </button>
                <button className="text-xs underline hover:text-gray-300">
                    Termeni și Condiții
                </button>
            </div>
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="bg-dedicatii-bg3 p-6 rounded-lg shadow-lg max-w-md w-full relative"
                        >
                            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                                &times;
                            </button>
                            <h2 className="text-xl font-bold mb-4">Politica de Confidențialitate</h2>
                            <div className="text-sm max-h-96 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: privacyPolicyContent }} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default LoginBotBar;