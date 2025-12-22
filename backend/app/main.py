import os
import shutil
import json
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# --- Import your custom modules ---
try:
    from app.ml.model import IngredientClassifier
    from app.ml.ocr import extract_text_from_image
    from app.ml.preprocessing import preprocess_image
    ML_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Warning: ML modules could not be imported. Details: {e}")
    ML_AVAILABLE = False

app = FastAPI(title="Intelligent Recipe Generator API")

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

    try:
        # B. Run OCR
        print(f"🔍 Running OCR on {file.filename}...")
        ocr_data = extract_text_from_image(file_path)
        results["ocr_result"] = ocr_data

        # C. Run AI Model
        if model:
            print(f"🧠 Running AI Inference on {file.filename}...")
            # Preprocess image to tensor
            input_tensor = preprocess_image(file_path)
            
            # Run Inference
            with torch.no_grad():
                output = model(input_tensor)
                probabilities = torch.nn.functional.softmax(output[0], dim=0)
                top_prob, top_catid = torch.topk(probabilities, 1)
                
                # Get the REAL NAME from our list
                class_id = top_catid.item()
                if class_names and class_id < len(class_names):
                    predicted_label = class_names[class_id] # e.g., "Tomato"
                else:
                    predicted_label = f"Class_{class_id}"

                results["ai_prediction"] = {
                    "class_id": class_id,
                    "label": predicted_label,
                    "confidence": f"{top_prob.item():.2%}",
                    "note": "Trained Model"
                }

        return results

    except Exception as e:
        print(f"Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Optional: Cleanup temp file
        # if os.path.exists(file_path):
        #     os.remove(file_path)
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)