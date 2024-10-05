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
        navigate('/confidentialitate');
    };
    const handleNavigateToTerms = () => {
        navigate('/termenisiconditii');
    };
    return (
        <div className="text-white justify-center items-center flex flex-col pb-2">
            <img src={img} alt="Developed with YouTube" className="h-20" />
            <div className="flex space-x-4 -mt-4 mb-4">
                <button className="text-xs underline hover:text-gray-300" onClick={handleNavigateToPrivacy}>
                    Politica de Confidențialitate
                </button>
                <button className="text-xs underline hover:text-gray-300" onClick={handleNavigateToTerms}>
                    Termeni și Condiții
                </button>
            </div>
        </div>
    );
}

export default LoginBotBar;