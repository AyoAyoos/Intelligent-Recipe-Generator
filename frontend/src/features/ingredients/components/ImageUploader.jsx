import React, { useState, useRef } from 'react';
// Ensure this path matches where your Button component is located
import Button from '../../../components/common/Button'; 

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  
  // --- UPDATE 1: New State for API ---
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    validateAndSetImage(file);
  };

  const validateAndSetImage = (file) => {
    setError('');
    setResults(null); // Clear old results when a new image is picked
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

  // --- UPDATE 2: The API Connection Function ---
  const handleIdentifyIngredients = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError('');
    setResults(null);

    const formData = new FormData();
    // 'file' must match the parameter name in your FastAPI backend (@app.post)
    formData.append('file', selectedImage); 

    try {
      // FIXED TYPO HERE: used 'response' correctly
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      // FIXED TYPO HERE: used 'response.json()' correctly
      const data = await response.json();
      console.log("Backend Response:", data); 
      setResults(data);

    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.uploadBox}>
        <h2 style={{ color: '#7A4D8F', marginBottom: '10px' }}> Snap Your Ingredients</h2>
        
        {/* Preview Area */}
        {previewUrl ? (
          <div style={styles.previewContainer}>
            <img src={previewUrl} alt="Preview" style={styles.image} />
            
            {/* Hide 'Remove' button while loading to prevent errors */}
            {!isLoading && (
              <Button 
                variant="danger" 
                onClick={() => { 
                  setSelectedImage(null); 
                  setPreviewUrl(null); 
                  setResults(null);
                }}
                icon=""
              >
                Remove
              </Button>
            )}
          </div>
        ) : (
          <p style={{ color: '#555', fontStyle: 'italic' }}>No image selected</p>
        )}

        {/* Error Message */}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        {/* Controls: Hide these while loading */}
        {!isLoading && (
          <div style={styles.controls}>
            <Button onClick={() => fileInputRef.current.click()} icon="">
              Upload File
            </Button>
            <Button onClick={() => cameraInputRef.current.click()} icon="📷">
              Use Camera
            </Button>
          </div>
        )}

        {/* --- UPDATE 3: Loading Indicator --- */}
        {isLoading && (
          <div style={{ marginTop: '20px', color: '#7A4D8F', fontWeight: 'bold' }}>
            <p>Analyzing image... ⏳</p>
            <small>Reading text & identifying veggies</small>
          </div>
        )}

        {/* Hidden Inputs */}
        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>

      {/* Submit Button */}
      {selectedImage && !isLoading && !results && (
        <div style={{ marginTop: '20px' }}>
          <Button 
            variant="success" 
            onClick={handleIdentifyIngredients}
            icon="🔍"
            style={{ padding: '15px 40px', fontSize: '18px' }}
          >
            Identify Ingredients
          </Button>
        </div>
      )}

      {/* --- UPDATE 4: Results Display --- */}
      {results && (
        <div style={styles.resultsBox}>
          <h3 style={{ color: '#2E8B57', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            ✅ Analysis Complete
          </h3>
          
          {/* Section A: Text Found (OCR) */}
          <div style={{textAlign: 'left', marginBottom: '15px'}}>
            <strong style={{color: '#7A4D8F'}}>📄 Text Found on Pack:</strong>
            {results.ocr_result?.candidates?.length > 0 ? (
              <div style={styles.tagContainer}>
                {results.ocr_result.candidates.map((text, idx) => (
                  <span key={idx} style={styles.tag}>{text}</span>
                ))}
              </div>
            ) : (
              <p style={{fontStyle: 'italic', color: '#888'}}>No readable text found.</p>
            )}
          </div>

          {/* Section B: AI Prediction */}
          <div style={{textAlign: 'left'}}>
             <strong style={{color: '#7A4D8F'}}>🧠 AI Identification:</strong>
             <ul style={{marginTop: '5px', listStyleType: 'none', padding: 0}}>
               <li><strong>Class ID:</strong> {results.ai_prediction?.class_id}</li>
               <li><strong>Confidence:</strong> {results.ai_prediction?.confidence}</li>
               <li style={{fontSize: '0.8em', color: '#999', marginTop: '5px'}}>
                 ({results.ai_prediction?.note})
               </li>
             </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: { 
    width: '100%', 
    textAlign: 'center', 
    padding: '20px', 
    fontFamily: 'Arial, sans-serif' 
  },
  uploadBox: { 
    border: '2px dashed rgba(122, 77, 143, 0.5)', 
    padding: '30px', 
    borderRadius: '15px', 
    margin: '0 auto', 
    maxWidth: '500px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
    backdropFilter: 'blur(10px)',                 
    WebkitBackdropFilter: 'blur(10px)',           
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' 
  },
  resultsBox: {
    marginTop: '25px',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    maxWidth: '500px',
    margin: '25px auto',
    border: '1px solid #eee'
  },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
  tag: {
    backgroundColor: '#f0f0f0',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#333',
    border: '1px solid #ddd'
  },
  previewContainer: { marginBottom: '15px' },
  image: { width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover', marginBottom: '10px' },
  controls: { display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' },
};

export default ImageUploader;