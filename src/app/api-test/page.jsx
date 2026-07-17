'use client';
import { useEffect, useState } from 'react';
import { API_URL, API_BASE_URL } from '../../../config/api';

export default function ApiTest() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      const tests = {};
      
      // Test 1: Check environment variable
      tests.hostname = typeof window !== 'undefined' ? window.location.hostname : 'N/A';
      tests.API_URL = API_URL;
      tests.API_BASE_URL = API_BASE_URL;
      tests.env_NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'Not Set';
      tests.isLocalhost = typeof window !== 'undefined' ? window.location.hostname === 'localhost' : false;
      
      // Test 2: Test server root
      try {
        const res = await fetch(`${API_URL}/`);
        tests.serverRoot = {
          status: res.status,
          ok: res.ok,
          data: await res.json()
        };
      } catch (err) {
        tests.serverRoot = { error: err.message };
      }
      
      // Test 3: Test notices endpoint
      try {
        const res = await fetch(`${API_URL}/api/notices`);
        tests.noticesEndpoint = {
          status: res.status,
          ok: res.ok,
          data: await res.json()
        };
      } catch (err) {
        tests.noticesEndpoint = { error: err.message };
      }
      
      // Test 4: Test CORS
      try {
        const res = await fetch(`${API_URL}/api/notices`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        tests.corsTest = {
          status: res.status,
          headers: Object.fromEntries(res.headers.entries())
        };
      } catch (err) {
        tests.corsTest = { error: err.message };
      }
      
      setResults(tests);
      setLoading(false);
    };
    
    testApi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
        
        {loading ? (
          <p>Testing API connection...</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-bold text-lg mb-2">{key}</h2>
                <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Check if API_URL is correct (should be https://schoolserver-nine.vercel.app)</li>
            <li>Verify serverRoot shows success: true</li>
            <li>Check noticesEndpoint returns data</li>
            <li>Look for CORS errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
