import React, { useState } from 'react';

const FoodDetails = () => {
  const [bestBefore, setBestBefore] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ bestBefore, quantity, location, contactNumber, additionalInfo });
  };

  return (
    <div className="flex flex-col items-center h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Adding food details</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <input
          type="date"
          value={bestBefore}
          onChange={(e) => setBestBefore(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Best Before"
        />
         <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Quantity"
        />

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Location"
        />
        <input
          type="tel"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Contact Number"
        />
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Additional Information"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Submit</button>
      </form>
    </div>
  );
};

export default FoodDetails;