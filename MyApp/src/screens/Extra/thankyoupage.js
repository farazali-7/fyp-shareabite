import React from 'react';
import thankYouImage from './path_to_image/image.png';

const ThankYouPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">Thank you for Sharing a Bite!</h1>
      <img src={thankYouImage} alt="Thank you" className="w-24 h-24" />
    </div>
  );
};

export default ThankYouPage;