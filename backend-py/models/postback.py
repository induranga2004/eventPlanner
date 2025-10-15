from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class PostBackRecord(BaseModel):
    """Model for storing generated post/poster information with Cloudinary URLs"""
    
    campaign_id: str = Field(..., description="Campaign ID associated with this post")
    render_id: str = Field(..., description="Unique render ID for this generation session")
    
    # Image URLs
    cloudinary_url: str = Field(..., description="Primary Cloudinary URL for the generated image")
    background_url: Optional[str] = Field(None, description="Background layer URL if separate")
    composite_url: Optional[str] = Field(None, description="Harmonized composite URL if separate")
    
    # Generation metadata
    size: str = Field(default="square", description="Image size (square, portrait, etc.)")
    prompt: Optional[str] = Field(None, description="Generation prompt used")
    model: Optional[str] = Field(None, description="AI model used (FLUX.1-dev, etc.)")
    seed: Optional[int] = Field(None, description="Random seed used for generation")
    
    # Event context
    event_name: Optional[str] = Field(None, description="Event title")
    event_date: Optional[str] = Field(None, description="Event date")
    
    # Design parameters
    mood: Optional[str] = Field(None, description="Design mood (neon, retro, minimal, lush)")
    palette: Optional[List[str]] = Field(None, description="Color palette used")
    artists: Optional[List[str]] = Field(None, description="Artist names included")
    
    # Additional metadata
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "campaign_id": "550e8400-e29b-41d4-a716-446655440000",
                "render_id": "abc123def",
                "cloudinary_url": "https://res.cloudinary.com/demo/image/upload/v1234/renders/...",
                "size": "square",
                "prompt": "vibrant neon concert poster with purple lighting",
                "model": "FLUX.1-dev",
                "event_name": "Summer Music Festival",
                "mood": "neon",
                "palette": ["#9D00FF", "#00FFD1"],
            }
        }


class PostBackCreate(BaseModel):
    """Schema for creating a new postback record"""
    campaign_id: str
    render_id: str
    cloudinary_url: str
    background_url: Optional[str] = None
    composite_url: Optional[str] = None
    size: str = "square"
    prompt: Optional[str] = None
    model: Optional[str] = None
    seed: Optional[int] = None
    event_name: Optional[str] = None
    event_date: Optional[str] = None
    mood: Optional[str] = None
    palette: Optional[List[str]] = None
    artists: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class PostBackResponse(BaseModel):
    """Response model after saving to MongoDB"""
    success: bool
    message: str
    mongo_id: Optional[str] = None
    postback: Optional[PostBackRecord] = None
