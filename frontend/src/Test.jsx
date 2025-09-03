// src/Test.jsx
import React from 'react';
import { useState } from 'react';
import { Home } from 'lucide-react';
import axios from 'axios';

const Test = () => {
  const [data, setData] = useState(null);

  const testAxios = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      setData(response.data);
    } catch (error) {
      setData({ error: error.message });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dependency Test</h1>
      
      <div className="space-y-4">
        {/* Test React */}
        <div className="p-4 bg-green-100 rounded-lg">
          <h2 className="font-semibold">✅ React 19 - Working</h2>
          <p>State works: {Math.random()}</p>
        </div>

        {/* Test Lucide Icons */}
        <div className="p-4 bg-blue-100 rounded-lg flex items-center space-x-2">
          <Home className="h-5 w-5" />
          <span className="font-semibold">✅ Lucide Icons - Working</span>
        </div>

        {/* Test Axios */}
        <div className="p-4 bg-yellow-100 rounded-lg">
          <h2 className="font-semibold">Axios Test</h2>
          <button 
            onClick={testAxios}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
          >
            Test API Connection
          </button>
          {data && (
            <pre className="mt-2 p-2 bg-white rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>

        {/* Test Tailwind */}
        <div className="p-4 bg-purple-100 rounded-lg">
          <h2 className="font-semibold text-purple-800">✅ Tailwind CSS - Working</h2>
          <p className="text-sm text-purple-600">Styled with Tailwind classes</p>
        </div>
      </div>
    </div>
  );
};

export default Test;