import React from "react";

const EateryDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="text-center text-2xl font-bold mb-6">
        WELCOME TO SHARE A BITE
      </header>
  
      
      {/* Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
          Add Food Details
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">
          Chat with us
        </button>
      </div>
    </div>
  );
};

export default EateryDashboard;