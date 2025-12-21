import React, { useState, useRef } from 'react';
// Make sure this path points to where you created Button.jsx
// If Button.jsx is in the same folder, use './Button'
// If it is in src/components/Button.jsx, use '../../../components/Button'
import Button from '../../../components/common/Button'; 

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    validateAndSetImage(file);
  };

  const validateAndSetImage = (file) => {
    setError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File is too large. Please upload an image under 5MB.');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div style={styles.container}>
      <div style={styles.uploadBox}>
        <h2 style={{ color: '#7A4D8F', marginBottom: '10px' }}> Snap Your Ingredients</h2>
        
        {/* Preview Area */}
        {previewUrl ? (
          <div style={styles.previewContainer}>
            <img src={previewUrl} alt="Preview" style={styles.image} />
            
            <Button 
              variant="danger" 
              onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
              icon=""
            >
              Remove
            </Button>
          </div>
        ) : (
          <p style={{ color: '#555', fontStyle: 'italic' }}>No image selected</p>
        )}

        {/* Error Message */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Controls */}
        <div style={styles.controls}>
          <Button 
            onClick={() => fileInputRef.current.click()} 
            icon=""
          >
            Upload File
          </Button>

          <Button 
            onClick={() => cameraInputRef.current.click()} 
            icon="📷"
          >
            Use Camera
          </Button>
        </div>

        {/* Hidden Inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
        
        <input 
          type="file" 
          ref={cameraInputRef} 
          accept="image/*" 
          capture="environment" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
      </div>

      {/* Submit Button */}
      {selectedImage && (
        <div style={{ marginTop: '20px' }}>
          <Button 
            variant="success" 
            onClick={() => alert("Task 7: Sending to Python...")}
            icon="🔍"
            style={{ padding: '15px 40px', fontSize: '18px' }}
          >
            Identify Ingredients
          </Button>
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
  previewContainer: { marginBottom: '15px' },
  image: { width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover', marginBottom: '10px' },
  controls: { display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' },
};

export default ImageUploader;