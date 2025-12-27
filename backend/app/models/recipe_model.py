from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class RecipeDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    title: str
    ingredients: List[str]
    instructions: List[str]
    cooking_time: str
    difficulty: str
    macros: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Optional: We can add user_id later
    user_id: Optional[str] = None

    class Config:
        populate_by_name = True