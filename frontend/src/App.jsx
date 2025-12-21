import React from 'react';
import Navbar from './components/layout/Navbar/Navbar.jsx';
import ImageUploader from './features/ingredients/components/ImageUploader';

// You can keep App.css if you have global styles there, or remove it if not needed.
import './App.css'; 

function App() {
  return (
    <div className="App">
      {/* 1. Global Navbar */}
      <Navbar />
      
      {/* 2. Main Content Area */}
      {/* We add padding top because your Navbar is "fixed/floating" 
          and we don't want the uploader to hide behind it. */}
      <main style={{ 
  /* 1. Spacing for Navbar */
  paddingTop: '120px', 
  
  /* 2. Full height so we can center vertically */
  minHeight: '100vh', 
  boxSizing: 'border-box', /* Ensures padding doesn't cause scrollbars */
  
  /* 3. The Magic Centering Lines */
  display: 'flex',
  justifyContent: 'center', /* Horizontal Center */
  alignItems: 'center',     /* Vertical Center */
  
  /* 4. Keep background transparent */
  backgroundColor: 'transparent' 
}}>
        <ImageUploader />
      </main>
    </div>
  );
}

export default App;