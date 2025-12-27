"""
Chef service module for recipe and cooking-related operations.
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

def generate_recipe(ingredients: list):
    """
    Takes a list of ingredients (e.g., ["Tomato", "Pasta"])
    and returns a structured JSON recipe.
    """
    # 1. Check for API Key
    if not API_KEY:
        print("❌ Error: GEMINI_API_KEY not found in .env file.")
        return None

    genai.configure(api_key=API_KEY)

    # 2. The System Prompt (Strict JSON)
    # We tell the AI to be a chef and strictly output JSON.
    prompt = f"""
    You are a professional chef. I have these ingredients: {', '.join(ingredients)}.
    
    Create a delicious recipe using these ingredients. You may assume I have basic pantry items (salt, pepper, oil, water).
    
    CRITICAL INSTRUCTION: You must respond ONLY with a valid JSON object. 
    Do not use Markdown formatting (no ```json or ```). 
    
    The JSON must strictly follow this structure:
    {{
        "title": "Recipe Name",
        "description": "A short, mouth-watering description.",
        "cooking_time": "e.g., 20 mins",
        "difficulty": "Easy/Medium/Hard",
        "ingredients": ["List", "of", "quantified", "ingredients"],
        "instructions": ["Step 1...", "Step 2...", "Step 3..."],
        "macros": {{
            "calories": "e.g., 350 kcal",
            "protein": "e.g., 12g"
        }}
    }}
    """

    try:
        # 3. Call Gemini
        # 'gemini-1.5-flash' is faster and cheaper for this task
        # ✅ UPDATE TO THIS
        model = genai.GenerativeModel('gemini-flash-latest')        
        response = model.generate_content(prompt)  # <-- ADD THIS LINE
        
        # 4. Clean and Parse Response
        # Sometimes AI adds backticks, so we clean them.
        clean_text = response.text.strip().replace("```json", "").replace("```", "")
        recipe_data = json.loads(clean_text)
        
        return recipe_data

    except Exception as e:
        print(f"❌ Chef Error: {str(e)}")
        return None