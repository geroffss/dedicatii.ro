import React from 'react';
import { useNavigate } from 'react-router-dom';
import privacyPolicyContent from '../components/policy';
import logo from '../logo1.svg'; // Assuming you want to use the same logo as in the login page

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-bl from-[#a856eb] via-[#d64061] to-[#211624]">
      <div className="relative flex-grow flex flex-col items-center justify-center">
        <button
          onClick={handleBackClick}
          className="absolute top-2 left-2 text-2xl hover:text-gray-300 text-white"
        >
          &larr;
        </button>
        <div className="bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg p-6 rounded-2xl shadow-lg w-full max-w-3xl">
          <img className="w-24 h-24 mx-auto" src={logo} alt="Dedicații.ro logo" />
          <h1 className="md:text-4xl text-2xl font-bold mb-4 text-center text-white">Politica de Confidențialitate</h1>
          <div className="text-sm text-gray-200 max-h-96 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: privacyPolicyContent }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;