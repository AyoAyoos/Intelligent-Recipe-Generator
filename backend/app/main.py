import os
import shutil
import torch
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# --- Import your custom modules ---
# We wrap imports in try-except to avoid crashing if a library is missing
try:
    from app.ml.model import IngredientClassifier
    from app.ml.ocr import extract_text_from_image
    from app.ml.preprocessing import preprocess_image
    ML_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Warning: ML modules could not be imported. Details: {e}")
    ML_AVAILABLE = False

app = FastAPI(title="Intelligent Recipe Generator API")

# --- 1. CORS Configuration (CruTXial for Frontend) ---
# This allows your React app (localhost:5173) to send images to this backend
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

# --- 2. Initialize the Model ---
# Even though it's untrained, we load the architecture so the pipeline works.
NUM_CLASSES = 50 # Example number, matches your model.py default or specific need
model = None

if ML_AVAILABLE:
    try:
        # Initialize the class from model.py
        model = IngredientClassifier(num_classes=NUM_CLASSES)
        model.eval() # Set to evaluation mode (essential for inference)
        print("✅ Model initialized (Untrained Architecture Ready).")
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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Intelligent Recipe Generator API"}
    
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
        # B. Run OCR (Uses your ocr.py)
        print(f"🔍 Running OCR on {file.filename}...")
        ocr_data = extract_text_from_image(file_path)
        results["ocr_result"] = ocr_data

        # C. Run AI Model (Uses your preprocessing.py + model.py)
        ifVX = True # Toggle to skip if needed
        if model and ifVX:
            print(f"🧠 Running AI Inference on {file.filename}...")
            # Preprocess image to tensor
            input_tensor = preprocess_image(file_path)
            
            # Run Inference
            with torch.no_grad():
                output = model(input_tensor)
                # Get probabilities
                probabilities = torch.nn.functional.softmax(output[0], dim=0)
                top_prob, top_catid = torch.topk(probabilities, 1)
                
                # Since we don't have a label map yet, return the ID
                results["ai_prediction"] = {
                    "class_id": top_catid.item(),
                    "confidence": f"{top_prob.item():.2%}",
                    "note": "Model is untrained (random weights)"
                }

        return results

    except Exception as e:
        print(f"Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Optional: Cleanup temp file
        # os.remove(file_path)
        pass

# --- 5. Run Server (Dev Mode) ---
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)