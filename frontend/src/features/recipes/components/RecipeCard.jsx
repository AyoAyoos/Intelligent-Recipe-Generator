import React from 'react';
import './RecipeCard.css';
import { FaClock, FaFire, FaUtensils, FaCheck } from 'react-icons/fa';

const RecipeCard = ({ recipe }) => {
  if (!recipe) return null;

  return (
    <div className="recipe-card">
      {/* 1. Header Section */}
      <div className="recipe-header">
        <h2 className="recipe-title">{recipe.title}</h2>
        <p className="recipe-description">{recipe.description}</p>
        
        <div className="recipe-meta">
          <div className="meta-item">
            <FaClock className="meta-icon" />
            <span>{recipe.cooking_time}</span>
          </div>
          <div className="meta-item">
            <FaFire className="meta-icon" />
            <span>{recipe.difficulty}</span>
          </div>
          <div className="meta-item">
            <FaUtensils className="meta-icon" />
            <span>{recipe.macros?.calories || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="recipe-body">
        {/* 2. Ingredients Column */}
        <div className="recipe-section ingredients-section">
          <h3>🛒 Ingredients</h3>
          <ul className="ingredients-list">
            {recipe.ingredients.map((item, index) => (
              <li key={index} className="ingredient-item">
                <label className="checkbox-container">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="ingredient-text">{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Instructions Column */}
        <div className="recipe-section instructions-section">
          <h3>👨‍🍳 Instructions</h3>
          <div className="steps-list">
            {recipe.instructions.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{index + 1}</div>
                <p className="step-text">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;