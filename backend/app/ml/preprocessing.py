import torchvision.transforms as transforms
from PIL import Image

# 1. Define Standard ImageNet Statistics (Required for EfficientNet)
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]
INPUT_SIZE = 224  # EfficientNet-B0 expects 224x224

def get_transforms(mode='train'):
    """
    Returns the transformation pipeline.
    mode: 'train' (includes augmentation) or 'val' (inference only)
    """
    if mode == 'train':
        return transforms.Compose([
            transforms.Resize(256),             # Resize slightly larger
            transforms.RandomCrop(INPUT_SIZE),  # Random crop for variety
            transforms.RandomHorizontalFlip(),  # Augmentation: Flip left/right
            transforms.RandomRotation(10),      # Augmentation: Rotate +/- 10 degrees
            transforms.ToTensor(),              # Convert image to Tensor (0-1 range)
            transforms.Normalize(MEAN, STD)     # Normalize math
        ])
    else:
        # Inference/Validation pipeline (Clean, no randomness)
        return transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(INPUT_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(MEAN, STD)
        ])

def preprocess_image(image_path):
    """
    Reads an image and prepares it for the model.
    """
    # Open image and force conversion to RGB (handles PNGs/Grayscale)
    image = Image.open(image_path).convert('RGB')
    
    # Apply inference transforms
    transform_pipeline = get_transforms(mode='val')
    image_tensor = transform_pipeline(image)
    
    # Add batch dimension (1, 3, 224, 224) - Models expect a batch
    return image_tensor.unsqueeze(0)