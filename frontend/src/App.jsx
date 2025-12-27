import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar.jsx';
import ImageUploader from './features/ingredients/components/ImageUploader';
import CookbookPage from './pages/CookbookPage'; // Ensure this file exists now
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        {/* 1. Global Navbar - Always visible */}
        <Navbar />
        
        {/* 2. Page Routing */}
        <Routes>
          
          {/* Route 1: Home (The Image Uploader) */}
          <Route path="/" element={
            <main style={{ 
              /* Spacing for Fixed Navbar */
              paddingTop: '120px', 
              
              /* Full height to center content vertically */
              minHeight: '100vh', 
              boxSizing: 'border-box',
              
              /* The Magic Centering Lines (Specific to Home) */
              display: 'flex',
              justifyContent: 'center', 
              alignItems: 'center',    
              
              /* Keep background transparent */
              backgroundColor: 'transparent' 
            }}>
              <ImageUploader />
            </main>
          } />

          {/* Route 2: My Cookbook */}
          <Route path="/cookbook" element={
            <div style={{ 
              /* Spacing for Fixed Navbar */
              paddingTop: '140px', // Slightly more padding for the grid view
              minHeight: '100vh',
              boxSizing: 'border-box',
              backgroundColor: 'transparent'
            }}>
              <CookbookPage />
            </div>
          } />

        </Routes>
      </div>
    </Router>
  );
}

export default App;