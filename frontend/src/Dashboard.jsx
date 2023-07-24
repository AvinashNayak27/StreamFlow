import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import Header from "./Landing";

const Dashboard = () => {
  const [apps, setApps] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]); // Add this line
  const { address } = useAccount();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/user/${address}/publishedApps`
        );
        setApps(response.data);
        console.log("Apps fetched successfully:", response.data);
      } catch (error) {
        console.error("Error fetching apps:", error);
      }
    };

    fetchApps();
  }, [address]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/user/${address}/subscribedApps`
        );
        setSubscriptions(response.data);
        console.log("Subscriptions fetched successfully:", response.data);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchSubscriptions();
  }, [address]);
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div>
      <Header />

      <div className="p-4">
        {apps.length === 0 ? (
          <div className="p-4">
            <section className="mb-8">
              <h1 className="text-3xl font-semibold mb-4">
                Your Published Apps
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="border rounded-lg p-4 bg-white shadow-md">
                  <h2 className="text-xl font-semibold mb-2">
                    You have no published apps
                  </h2>
                  <p className="text-gray-600">
                    Publish your first app to get started
                  </p>
                  <a
                    href="/listapp"
                    className="mt-4 inline-block px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Publish App
                  </a>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <section className="mb-8">
            <h1 className="text-3xl font-semibold mb-4">Your Published Apps</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {apps.map((app) => (
                <div
                  key={app._id}
                  className="border rounded-lg p-4 bg-white shadow-md"
                >
                  <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
                  <p className="text-gray-600">BaseURL: {app.returnedURL}</p>
                  <p className="text-gray-600">
                    StreamURL: http://{app.name}.localhost:3000
                  </p>
                  <a
                    href={app.returnedURL}
                    className="mt-4 inline-block px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit App
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
        {subscriptions.length === 0 ? (
          <div className="p-4">
            <section className="mb-8">
              <h1 className="text-3xl font-semibold mb-4">Your Subsriptions</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-white shadow-md">
                  <h2 className="text-xl font-semibold mb-2">
                    You have no subscriptions
                  </h2>
                  <p className="text-gray-600">
                    Subscribe to an app to get started
                  </p>
                  <a
                    href="/listed"
                    className="mt-4 inline-block px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Subscribe to App
                  </a>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <section>
            <h1 className="text-3xl font-semibold mb-4">Your Subsriptions</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.app._id}
                  className="border rounded-lg p-4 bg-white shadow-md"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {subscription.app.name}
                  </h2>
                  <p className="text-gray-600">
                    StreamURL: http://{subscription.app.name}.localhost:3000
                  </p>

                  <div className="flex items-center mt-4">
                    <p className="mr-2">API key:</p>
                    <p
                      className={`break-all ${
                        showApiKey ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      {showApiKey ? subscription.apiKey : "*".repeat(14)}
                    </p>
                    <button
                      onClick={() => setShowApiKey((prev) => !prev)}
                      className="ml-4 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
                    >
                      {showApiKey ? "Hide API Key" : "Show API Key"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
