import os
import shutil
import json
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import connect_to_mongo, close_mongo_connection
from app.services.db_service import save_recipe,get_all_recipes


# --- Import your custom modules ---
try:
    from app.ml.model import IngredientClassifier
    from app.ml.ocr import extract_text_from_image
    from app.ml.preprocessing import preprocess_image
    ML_AVAILABLE = True
    from app.services.chef import generate_recipe # <--- ADD THIS
    CHEF_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Warning: ML modules could not be imported. Details: {e}")
    ML_AVAILABLE = False
    CHEF_AVAILABLE = False

app = FastAPI(title="Intelligent Recipe Generator API")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()
# --- 1. CORS Configuration ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Initialize the Model (The "Brain") ---
# paths to your downloaded files
MODEL_PATH = "app/ml/best_model.pth"
CLASSES_PATH = "app/ml/classes.json"

model = None
class_names = []

if ML_AVAILABLE:
    try:
        # A. Load the Class Names (Tomato, Potato, etc.)
        if os.path.exists(CLASSES_PATH):
            with open(CLASSES_PATH, "r") as f:
                class_names = json.load(f)
            print(f"✅ Loaded {len(class_names)} classes: {class_names[:3]}...")
        else:
            print("⚠️ classes.json not found. Prediction will show ID only.")

        # B. Initialize the Model Architecture
        # The number of classes MUST match what you trained on (len(class_names))
        num_classes = len(class_names) if class_names else 50 
        model = IngredientClassifier(num_classes=num_classes)
        
        # C. Load the Trained Weights
        if os.path.exists(MODEL_PATH):
            # map_location='cpu' ensures it works even if you don't have a GPU on your laptop
            state_dict = torch.load(MODEL_PATH, map_location=torch.device('cpu'))
            model.load_state_dict(state_dict)
            model.eval() # Set to evaluation mode
            print("✅ Trained weights (best_model.pth) loaded successfully!")
        else:
            print("⚠️ best_model.pth not found. Using random weights (Dumb Model).")
            model.eval()

    except Exception as e:
        print(f"❌ Failed to initialize model: {e}")

# --- 3. Utility: Save Uploaded File ---
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(upload_file: UploadFile, destination: str):
    try:
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()

# --- 4. The Main Endpoint ---
@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    1. Receives an image.
    2. Runs OCR (Packaged Goods).
    3. Runs AI Model (Vegetables).
    4. Returns JSON results.
    """
    if not ML_AVAILABLE:
        return {"error": "ML modules not loaded on server."}

    # A. Save the file temporarily
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    save_upload_file(file, file_path)

    results = {
        "filename": file.filename,
        "ocr_result": None,
        "ai_prediction": None
    }

    # ... inside analyze_image ...
    
    try:
        # B. Run OCR
        print(f"🔍 Running OCR on {file.filename}...")
        ocr_data = extract_text_from_image(file_path)
        results["ocr_result"] = ocr_data

        # C. Run AI Model (Vision)
        detected_ingredients = []
        
        if model:
            print(f"🧠 Running AI Inference on {file.filename}...")
            input_tensor = preprocess_image(file_path)
            
            with torch.no_grad():
                output = model(input_tensor)
                probabilities = torch.nn.functional.softmax(output[0], dim=0)
                top_prob, top_catid = torch.topk(probabilities, 1)
                
                class_id = top_catid.item()
                # Get label from class_names
                if class_names and class_id < len(class_names):
                    predicted_label = class_names[class_id]
                else:
                    predicted_label = f"Class_{class_id}"

                results["ai_prediction"] = {
                    "class_id": class_id,
                    "label": predicted_label,
                    "confidence": f"{top_prob.item():.2%}",
                }
                
                # Add AI detected ingredient to our list
                # (Simple filter: Only add if it looks like a real word)
                if "Class_" not in predicted_label:
                    detected_ingredients.append(predicted_label)

        # D. Merge OCR Ingredients
        if ocr_data and ocr_data.get("candidates"):
            detected_ingredients.extend(ocr_data["candidates"])
            
        # --- TASK 8: GENERATE RECIPE ---
        # --- TASK 8: GENERATE RECIPE ---
        results["recipe"] = None 
        
        if CHEF_AVAILABLE and detected_ingredients:
            print(f"👨‍🍳 Chef is cooking with: {detected_ingredients}")
            recipe = generate_recipe(detected_ingredients)
            
            # 👇 NEW CODE STARTS HERE 👇
            if recipe:
                # Save the recipe to MongoDB
                # We use 'await' so it doesn't block the server
                recipe_id = await save_recipe(recipe)
                print(f"✨ Recipe saved with ID: {recipe_id}")
                
                # Optional: Return the ID to the frontend
                recipe["_id"] = recipe_id
            # 👆 NEW CODE ENDS HERE 👆

            results["recipe"] = recipe
            
        elif not detected_ingredients:
             print("⚠️ No ingredients found, skipping recipe.")

        return results

    except Exception as e:
        # ... existing error handling ...
        print(f"Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
# --- 5. The Cookbook Endpoint ---
@app.get("/api/my-cookbook")
async def get_my_cookbook():
    """
    Fetches all saved recipes from MongoDB.
    """
    try:
        recipes = await get_all_recipes()
        if not recipes:
            # Return empty list instead of 404 so frontend just shows "No recipes yet"
            return []
        return recipes
    except Exception as e:
        print(f"Error fetching cookbook: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recipes")
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)