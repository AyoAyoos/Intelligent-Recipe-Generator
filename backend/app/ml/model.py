import torch
import torch.nn as nn
from torchvision import models

class IngredientClassifier(nn.Module):
    def __init__(self, num_classes, dropout_rate=0.3):
        """
        Args:
            num_classes (int): Number of ingredients to detect.
            dropout_rate (float): Probability of dropping a neuron (prevents overfitting).
        """
        super(IngredientClassifier, self).__init__()
        
        # 1. Load EfficientNet-B0 (Pre-trained)
        weights = models.EfficientNet_B0_Weights.DEFAULT
        self.backbone = models.efficientnet_b0(weights=weights)
        
        # 2. FREEZE EVERYTHING INITIALLY
        # We only want to train the "Head" first.
        for param in self.backbone.parameters():
            param.requires_grad = False
        
        # 3. Custom Classifier Head (Improvement #1)
        # We replace the default linear layer with a robust Block:
        # Dropout -> Linear -> (Optional: Activation)
        in_features = self.backbone.classifier[1].in_features
        
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(in_features, num_classes)
        )
        
        # 4. Explicit Weight Initialization (Improvement #3)
        # Initialize the new Linear layer with Xavier Uniform (good for generic activations)
        nn.init.xavier_uniform_(self.backbone.classifier[1].weight)
        
    def forward(self, x):
        return self.backbone(x)
    
    def unfreeze_backbone(self, num_blocks=2):
        """
        Improvement #2: Allow Partial Fine-Tuning
        Unfreezes the last 'num_blocks' of the feature extractor.
        Call this method after training the head for 5-10 epochs.
        """
        # The 'features' part of EfficientNet is a Sequential list of blocks.
        # We slice it from the end using [-num_blocks:]
        for block in self.backbone.features[-num_blocks:]:
            for param in block.parameters():
                param.requires_grad = True
        
        print(f"✅ Unfrozen the last {num_blocks} blocks of the backbone for fine-tuning.")

# --- Helper to load model ---
def load_model(num_classes=50, device='cpu'):
    model = IngredientClassifier(num_classes=num_classes)
    return model.to(device)