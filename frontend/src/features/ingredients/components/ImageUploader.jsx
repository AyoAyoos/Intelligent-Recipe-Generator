import React, { useState, useRef } from 'react';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader'; // The new Step 1 Component
import IngredientsBadge from './IngredientsBadge';     // The new Step 2 Component
import RecipeCard from '../../recipes/components/RecipeCard';  // Fixed: relative path

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // --- 1. Image Handling ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    validateAndSetImage(file);
  };

  const validateAndSetImage = (file) => {
    setError('');
    setResults(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Please upload an image under 5MB.');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // --- 2. API Call ---
  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data); // This triggers the view change
    } catch (err) {
      console.error("Upload failed:", err);
      setError('Failed to analyze image. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. Reset Helper ---
  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResults(null);
    setError('');
  };

  // --- 4. Render Logic ---
  
  // VIEW A: Loading State
  if (isLoading) {
    return (
      <div style={styles.container}>
        <Loader />
      </div>
    );
  }

  // VIEW B: Results State (Badge + Recipe)
  if (results) {
    return (
      <div style={styles.resultsContainer}>
        <IngredientsBadge 
          aiPrediction={results.ai_prediction}
          ocrCandidates={results.ocr_result?.candidates}
        />

        {/* --- TASK 9: FINAL RECIPE DISPLAY --- */}
{results.recipe ? (
  <RecipeCard recipe={results.recipe} />
) : (
  <div style={styles.recipePlaceholder}>
    <p>⚠️ The Chef found ingredients but couldn't write a recipe. Try again.</p>
  </div>
)}

        <div style={{ marginTop: '2rem' }}>
          <Button onClick={handleReset} variant="outline">
            Analyze Another Image
          </Button>
        </div>
      </div>
    );
  }

  // VIEW C: Upload State (Default)
  return (
    <div style={styles.container}>
      <div style={styles.uploadBox}>
        <h2 style={styles.title}>Scan Your Ingredients</h2>
        <p style={styles.subtitle}>Upload a photo of vegetables or packaged food</p>
        
        {/* Preview Area */}
        <div 
          style={styles.dropZone}
          onClick={() => fileInputRef.current.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" style={styles.previewImage} />
          ) : (
            <div style={styles.placeholderText}>
              <span style={{fontSize: '2rem'}}>📷</span>
              <p>Click to Upload or Drag & Drop</p>
            </div>
          )}
        </div>

        {/* Hidden Inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept="image/*"
        />

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <Button onClick={handleUpload} disabled={!selectedImage}>
            Identify & Cook
          </Button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

// --- Styles ---
const styles = {
  container: {
    width: '100%',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    animation: 'fadeIn 0.5s ease'
  },
  resultsContainer: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    animation: 'slideUp 0.5s ease'
  },
  uploadBox: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  title: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#7f8c8d',
    marginBottom: '30px'
  },
  dropZone: {
    border: '2px dashed #cbd5e0',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '25px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa'
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '250px',
    borderRadius: '10px',
    objectFit: 'contain'
  },
  placeholderText: {
    color: '#a0aec0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center'
  },
  error: {
    color: '#e53e3e',
    marginTop: '15px',
    fontSize: '0.9rem'
  },
  recipePlaceholder: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    textAlign: 'left'
  },
  debugBox: {
    background: '#f4f4f4',
    padding: '1rem',
    borderRadius: '8px',
    overflowX: 'auto',
    fontSize: '0.85rem',
    color: '#333'
  }
};

export default ImageUploader;