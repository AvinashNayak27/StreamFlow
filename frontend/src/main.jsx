import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import Listed from './listed.jsx'
import PostmanClone from './PostmanClone.jsx'
import { WagmiConfig } from "wagmi";
import { wagmiConfig, chains } from './wagmi.js'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import './index.css'
import './polyfills.js'
import "@rainbow-me/rainbowkit/styles.css";
import UserApps from './UserApps'
import ListApp from './ListApp.jsx'
import User from './User.jsx'
import Landing from './Landing.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/listed" element={<Listed />} />
            <Route path="/playground" element={<PostmanClone />} />
            <Route path="/user/:wallet" element={<UserApps />} />
            <Route path="/listapp" element={<ListApp />} />
            <Route path="/user/" element={<User />} />
            <Route path="/landing" element={<Landing />} />
          </Routes>
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode >,
)
