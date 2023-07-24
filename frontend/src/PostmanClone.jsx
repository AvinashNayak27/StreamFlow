import React, { useState } from 'react';
import axios from 'axios';
import Header from './Landing';

const PostmanClone = () => {
    const [url, setUrl] = useState('');
    const [method, setMethod] = useState('GET');
    const [response, setResponse] = useState('');
    const [apiKey, setApiKey] = useState('');

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const handleMethodChange = (event) => {
        setMethod(event.target.value);
    };

    const handleApiKeyChange = (event) => {
        setApiKey(event.target.value);
    };

    const handleSendRequest = async () => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (apiKey) {
                headers['api_key'] = apiKey || '';
            }

            const res = await axios({
                method: method,
                url: url,
                headers: headers
            });

            setResponse(JSON.stringify(res.data, null, 2));
        } catch (error) {
            setResponse(JSON.stringify(error.response.data, null, 2));
        }
    };
    console.log(response);

    return (
        <div>
            <Header />
            <div className="container mx-auto py-8">

                <div className="grid gap-4 max-w-md mx-auto p-4 border rounded border-black">
                    <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: '3fr 1fr' }}>
                        <input
                            type="text"
                            value={url}
                            onChange={handleUrlChange}
                            placeholder="Enter URL"
                            className="p-2 border rounded"
                        />
                        <select
                            value={method}
                            onChange={handleMethodChange}
                            className="p-2 border rounded"
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        id="api-key"
                        value={apiKey}
                        onChange={handleApiKeyChange}
                        placeholder="Enter API Key"
                        className="p-2 border rounded"
                        autoComplete="off"
                    />

                    <button
                        onClick={handleSendRequest}
                        className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer self-center"
                    >
                        Test API
                    </button>
                    <div className="bg-gray-200 p-4 rounded">
                        <pre className="max-w-md overflow-x-auto">{response}</pre>
                    </div>
                    {response === '"Invalid API key."' ? (
                        <button
                            onClick={() => {
                                window.open('/listed', '_blank');
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer self-center"
                        >
                            Subscribe to the App here
                        </button>
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        </div>



    );
};

export default PostmanClone;
