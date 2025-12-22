import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import re  # Added for Regex cleaning
import os

# CONFIGURATION: Set the path to the tesseract executable if needed
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_image(image_path):
    """
    Reads text from an image using advanced preprocessing.
    Returns a structured dictionary for the LLM.
    """
    try:
        # 1. Load Image
        img = Image.open(image_path)

        # 2. Preprocessing Pipeline
        # Convert to grayscale
        img = img.convert('L')
        
        # Increase contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        
        # Sharpen
        img = img.filter(ImageFilter.SHARPEN)
        
        # Improvement #1: Binarization (Thresholding)
        # Converts everything to pure Black (0) or White (255)
        # This removes grey noise/shadows which helps Tesseract focus on shapes.
        img = img.point(lambda x: 0 if x < 140 else 255, '1')

        # 3. Run Tesseract OCR
        # Improvement #2: Explicit Language & Config
        custom_config = r'--oem 3 --psm 6' 
        raw_text = pytesseract.image_to_string(
            img, 
            config=custom_config, 
            lang='eng' # Explicitly look for English
        )

        # 4. Clean the text
        cleaned_candidates = clean_ocr_output(raw_text)
        
        # Improvement #4: Return Structured Output
        return {
            "status": "success",
            "raw_text_length": len(raw_text),
            "candidates": cleaned_candidates  # The clean list of ingredients
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "candidates": []
        }

def clean_ocr_output(raw_text):
    """
    Sanitizes text to keep only ingredient-relevant characters.
    """
    lines = raw_text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        
        # Improvement #3: Regex-Based Cleaning
        # Keep letters, numbers, specific punctuation (%, . ,) and spaces.
        # Removes weird OCR artifacts like "©", "|", "~"
        line = re.sub(r'[^a-zA-Z0-9(),.% ]', '', line)
        
        # Only keep lines that look like actual words (len > 2)
        if len(line) > 2: 
            cleaned_lines.append(line)
            
    return cleaned_lines

# --- Test Block ---
if __name__ == "__main__":
    print("Testing Optimized OCR...")
    # result = extract_text_from_image("sample_packet.jpg")
    # print(result)