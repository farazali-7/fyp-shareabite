import React from 'react';

const WelcomePage = () => {
  return (
    <div className="flex flex-col items-center h-screen">
      <h1 className="text-3xl font-bold mt-4">Welcome to Share a Bite!</h1>
      <button className="mt-4 p-2 bg-blue-500 text-white rounded">Available Food</button>
      <button className="mt-4 p-2 bg-blue-500 text-white rounded">Chat with Us</button>
    </div>
  );
};

export default WelcomePage;