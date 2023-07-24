import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Header from './Landing';

const UserApps = () => {
  const [apps, setApps] = useState([]);
  const { wallet } = useParams(); // Get the wallet from the URL parameters
  console.log('Wallet:', wallet);
  const { address } = useAccount();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${wallet}/publishedApps`);
        setApps(response.data);
        console.log('Apps fetched successfully:', response.data);
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    };

    fetchApps();
  }, [wallet]);

  return (
    <div className="p-4">
      <Header />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-4">Apps published by {wallet}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {apps.map((app) => (
            <div key={app._id} className="border rounded-lg p-4 bg-white shadow-md">
              <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
              <p className="text-gray-600">URL: http://{app.name}.localhost:3000/</p>
            </div>
          ))}
        </div>
      </div>

      {address === wallet && (
        <a href="/dashboard" className="block text-center mt-4 p-2 rounded-lg bg-blue-500 text-white">
          Go to Dashboard
        </a>
      )}
    </div>
  );
};

export default UserApps;
