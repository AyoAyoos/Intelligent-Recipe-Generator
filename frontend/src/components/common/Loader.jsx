import { useState, useEffect } from 'react';
import './Loader.css'; // We will create this simple style next

const Loader = () => {
  const [message, setMessage] = useState("Scanning image for vegetables...");

  useEffect(() => {
    // Stage 1: Initial State (0s) -> "Scanning..." (Already set)
    
    // Stage 2: After 2 seconds -> "Reading labels"
    const timer1 = setTimeout(() => {
      setMessage("Reading labels and text...");
    }, 2000);

    // Stage 3: After 4 seconds -> "Chef is thinking"
    const timer2 = setTimeout(() => {
      setMessage("Chef is curating a unique recipe for you...");
    }, 4500);

    // Cleanup timers if the component unmounts (e.g., if API is super fast)
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-text fade-in">{message}</p>
    </div>
  );
};

export default Loader;