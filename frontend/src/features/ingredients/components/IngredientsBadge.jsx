import React from 'react';
import './IngredientsBadge.css';
// If you don't have react-icons, run: npm install react-icons
import { FaCheckCircle, FaLeaf, FaTag } from 'react-icons/fa'; 

const IngredientsBadge = ({ aiPrediction, ocrCandidates }) => {
  // Debug log to see if data is reaching here
  console.log("Badge Data:", aiPrediction, ocrCandidates);

  // 1. Filter out garbage OCR text (length > 2)
  const cleanOCR = ocrCandidates 
    ? ocrCandidates.filter(text => text && text.length > 2) 
    : [];

  // Check if we have anything to show
  const hasData = aiPrediction || cleanOCR.length > 0;

  if (!hasData) return <div style={{color: 'red'}}>No Ingredients Data Found</div>;

  return (
    <div className="ingredients-badge-container">
      <div className="badge-header">
        <FaCheckCircle className="icon-success" />
        <span>I found the following items:</span>
      </div>
      
      <div className="tags-wrapper">
        {/* AI Prediction (The main vegetable) */}
        {aiPrediction && (
          <div className="ingredient-tag ai-tag">
            <FaLeaf className="tag-icon" />
            <span className="tag-label">{aiPrediction.label}</span>
            <span className="confidence-pill">{aiPrediction.confidence}</span>
          </div>
        )}

        {/* OCR Candidates (The text on packets) */}
        {cleanOCR.map((text, index) => (
          <div key={index} className="ingredient-tag ocr-tag">
            <FaTag className="tag-icon" />
            <span className="tag-label">{text}</span>
          </div>
        ))}
      </div>
      
      <p className="subtext">The recipe below is curated based on these ingredients.</p>
    </div>
  );
};

export default IngredientsBadge;