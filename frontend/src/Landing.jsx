import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';

const Header = () => {
  return (
    <header className=" text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <a className="flex items-center text-gray-900 mb-4 md:mb-0" href='/'>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="w-10 h-10 text-indigo-500 p-2 bg-white rounded-full"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-2xl font-medium">Stream</span>
          
        </a>
        <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center justify-center rounded-full bg-gray-100 p-4 w-auto">
          <a className="button-link mr-3 rounded-md text-white hover:bg-gray-700 px-2 py-1 " href='/dashboard'>Dashbaord</a>
          <a className="button-link mr-3 rounded-md text-white hover:bg-gray-700 px-2 py-1" href='/listed'>Listed APIs</a>
          <a className="button-link mr-3 rounded-md text-white hover:bg-gray-700 px-2 py-1 " href='/listapp'>List API</a>
          <a className="button-link rounded-md text-white hover:bg-gray-700 px-2 py-1" href='/playground'>Playground</a>
        </nav>

        <div className="inline-flex items-center">
          <ConnectButton />
        </div>
      </div>
      <style jsx>{`
        .button-link {
          display: inline-block;
          padding: 0.75rem 1rem;
          background-color: transparent;
          border: 1px solid #ccc;
          border-radius: 0.25rem;
          text-decoration: none;
          color: #333;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .button-link:hover {
          background-color: #ccc;
          color: #000;
        }
      `}</style>
    </header>
  );
};

export default Header;
