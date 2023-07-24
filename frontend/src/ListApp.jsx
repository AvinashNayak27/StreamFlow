
import React, { useState } from 'react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import Header from './Landing';

const ListApp = () => {
    const [name, setName] = useState('');
    const [baseURL, setBaseURL] = useState('');
    const { address } = useAccount();


    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/", {
                name,
                baseURL,
                owner: address,
            });
            console.log(response.data.url);
            alert(`App created successfully. URL: ${response.data.url}`);
        } catch (error) {
            console.error(error);
            alert('Failed to create app.');
        }
    };

    return (
        <>
            <Header />
            <div className="flex flex-col items-center mt-8">
                <h1 className="text-3xl font-semibold mb-4">Create an App</h1>
            </div>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 border border-black">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="baseURL">
                        Base URL
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="baseURL"
                        type="text"
                        value={baseURL}
                        onChange={(e) => setBaseURL(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center justify-center"> {/* Changed justify-between to justify-center */}
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Create App
                    </button>
                </div>
            </form>

        </>
    );
};

export default ListApp;
