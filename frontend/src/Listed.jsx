import Checkout from "./Checkout";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
import Header from "./Landing";

const AppCard = ({ app, address, subscribedApps }) => {

    const truncatedAddress = app.Owner.substr(0, 12) + '...' + app.Owner.substr(-6);

    return (

        <div className="w-72 bg-white rounded-lg shadow-lg overflow-hidden m-4">
            <div className="px-4 py-3 bg-indigo-600 text-white">
                <h1 className="text-xl font-semibold">{app.name}</h1>
                <p className="text-sm">{app.returnedURL}</p>
            </div>
            <div className="px-4 py-3 bg-gray-100">
                <Link to={`/user/${app.Owner}`} className="text-gray-700 font-semibold text-sm">
                    Owner: {truncatedAddress}
                </Link>
            </div>
            <div className="px-4 py-3">
                {address !== app.Owner && (
                    <>
                        {subscribedApps.includes(app._id) ? (
                            <button
                                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => {
                                    window.open('/dashboard', '_blank');
                                }}
                            >
                                Open Dashboard
                            </button>
                        ) : (
                            <Checkout ownerAddress={app.Owner} appName={app.name} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const Listed = () => {
    const [apps, setApps] = useState([]);
    const [subscribedApps, setSubscribedApps] = useState([]);
    const { address } = useAccount();

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const response = await axios.get('http://localhost:3000/apps');
                setApps(response.data);
            } catch (error) {
                console.error('Failed to fetch apps:', error);
            }
        };

        const fetchSubscribedApps = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/user/${address}/subscribedApps`);
                setSubscribedApps(response.data.map(app => app.app._id));
            } catch (error) {
                console.error('Failed to fetch subscribed apps:', error);
            }
        };

        fetchApps();
        fetchSubscribedApps();
    }, [address]);

    return (
        <div>
            <Header />
            <div className="flex flex-wrap justify-center bg-gray-100">
                {apps.map((app) => (
                    <AppCard key={app._id} app={app} address={address} subscribedApps={subscribedApps} />
                ))}
            </div>
        </div>
    );
};

export default Listed;
