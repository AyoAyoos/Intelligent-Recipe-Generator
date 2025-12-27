// src/pages/CookbookPage.jsx
import React, { useState, useEffect } from 'react';
import RecipeCard from '../features/recipes/components/RecipeCard';
import Loader from '../components/common/Loader'; // Assuming you have this from your structure

const CookbookPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch saved recipes from your Backend
    // Replace '/api/my-cookbook' with your actual MongoDB endpoint
    const fetchSavedRecipes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/my-cookbook'); 
        if (!response.ok) {
          throw new Error('Failed to fetch cookbook');
        }
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        console.error(err);
        setError('Could not load your cookbook. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><Loader /></div>;

  return (
    <div className="cookbook-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>My Cookbook</h1>
        <p style={{ color: '#666' }}>Your personal collection of favorite recipes.</p>
      </header>

      {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

      {!loading && recipes.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3>No recipes saved yet!</h3>
          <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go explore and save some food!</a>
        </div>
      ) : (
        <div className="recipes-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
        }}>
          {recipes.map((recipe) => (
            // Reusing your existing RecipeCard
            <RecipeCard key={recipe._id || recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CookbookPage;