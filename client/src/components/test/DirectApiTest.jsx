// Create this as a temporary test component
// client/src/components/test/DirectApiTest.jsx

import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "@/config/config.js";


function DirectApiTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAddProduct = async () => {
    setLoading(true);
    
    const testProduct = {
      image: "https://example.com/test-image.jpg",
      title: "API Test Product",
      description: "Test Description",
      category: "home",
      price: 100,
      salePrice: 80,
      totalStock: 50,
      averageReview: 0,
      variations: [
        {
          image: "https://example.com/variation1.jpg",
          label: "Red Variant"
        },
        {
          image: "https://example.com/variation2.jpg",
          label: "Blue Variant"
        }
      ]
    };

    console.log("Sending test product:", testProduct);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/products/add`,
        testProduct
      );
      
      console.log("API Response:", response.data);
      setResult(response.data);
    } catch (error) {
      console.error("API Error:", error);
      console.error("Error Response:", error.response?.data);
      setResult({ error: error.message, details: error.response?.data });
    } finally {
      setLoading(false);
    }
  };

  const testFetchProducts = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/products/get`
      );
      
      console.log("Fetch Products Response:", response.data);
      setResult(response.data);
    } catch (error) {
      console.error("Fetch Error:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Direct API Test</h2>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testAddProduct}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Add Product with Variations'}
        </button>
        
        <button 
          onClick={testFetchProducts}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch All Products'}
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default DirectApiTest;