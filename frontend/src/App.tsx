import React from 'react'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-4">
            ERP DryMix Products
          </h1>
          <p className="text-center text-gray-600">
            Enterprise Resource Planning for Cementitious Dry Mix Manufacturing
          </p>
          <div className="mt-8 text-center">
            <p className="text-green-600 font-semibold">
              ✅ Frontend Development Environment Ready
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Backend API: http://localhost:8000
            </p>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
