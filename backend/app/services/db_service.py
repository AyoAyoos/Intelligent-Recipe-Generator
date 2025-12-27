from app.core.database import get_database
from app.models.recipe_model import RecipeDB
from fastapi.encoders import jsonable_encoder

async def save_recipe(recipe_data: dict) -> str:
    """
    Saves a generated recipe to MongoDB.
    Returns the new Recipe ID.
    """
    try:
        db = get_database()
        
        # 1. Validate data using our Model
        recipe_model = RecipeDB(**recipe_data)
        
        # 2. Convert to JSON format for MongoDB
        recipe_dict = jsonable_encoder(recipe_model)
        
        # 3. Insert into the "recipes" collection
        new_recipe = await db["recipes"].insert_one(recipe_dict)
        
        print(f"✅ Recipe Saved! ID: {new_recipe.inserted_id}")
        return str(new_recipe.inserted_id)

    except Exception as e:
        print(f"❌ Error saving recipe: {e}")
        return None


# app/services/db_service.py
# (Keep your existing imports and save_recipe function)

# --- ADD THIS FUNCTION ---
async def get_all_recipes():
    """
    Fetches all recipes from MongoDB.
    Returns a list of recipes with _id converted to string.
    """
    try:
        # Use get_database() instead of importing db directly
        db = get_database()
        
        recipes = []
        # Use bracket notation instead of dot notation
        cursor = db["recipes"].find({}) 
        
        async for document in cursor:
            # Convert ObjectId to string (CRITICAL for React to handle it)
            document["_id"] = str(document["_id"])
            recipes.append(document)
            
        return recipes
    
    except Exception as e:
        print(f"❌ Error fetching recipes: {e}")
        return []