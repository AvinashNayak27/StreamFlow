import React from "react";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import Header from "./Landing";
import axios from "axios";

const App = () => {
  const { address } = useAccount();
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/users");
        console.log("Users fetched successfully:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getUsers();
  }, []);
  if (!address) {
    return (
      <div>
        <Header />
      </div>
    );
  }
  useEffect(() => {
    const userExists = users.some((user) => user.wallet === address);
    console.log("User exists:", userExists);

    if (!userExists) {
      const createUser = async () => {
        try {
          const response = await axios.post("http://localhost:3000/user", {
            wallet: address,
          });
          console.log("User created successfully:", response.data);
        } catch (error) {
          console.error("Error creating user:", error);
        }
      };

      createUser();
    }
  }, [users, address]);
  const apiData = [
    {
      id: 1,
      title: "Weather API",
      description: "Get real-time weather data for any location.",
    },
    {
      id: 2,
      title: "Image Recognition API",
      description: "Identify objects and scenes in images with high accuracy.",
    },
    {
      id: 3,
      title: "Translation API",
      description: "Translate text between multiple languages.",
    },
  ];

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-screen-lg">
        <section className="flex-grow">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">
            Welcome to Stream!
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-center text-gray-600 mb-6">
            Stream is a API marketplace for developers to publish and subscribe
            to APIs using <br />
            Superfluid Subscriptions.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-md border border-black mb-3">
            <h4 className="text-xl md:text-2xl font-bold mb-4">
              We are live on CELO Mainnet! Check out the Header and Connect
              Wallet to Get Started.
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apiData.map((api) => (
              <div
                key={api.id}
                className="bg-white p-6 rounded-lg shadow-md border border-black"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  {api.title}
                </h2>
                <p>{api.description}</p>
              </div>
            ))}
          </div>
        </section>
        <p className="mt-6">
          The above APIs are just dummy data. To see the real APIs on platform,
          go to
          <a href="/listed" className="text-blue-500">
            {" "}
            Listed{" "}
          </a>
        </p>
      </div>
    </div>
  );
};

export default App;
