"""
Pydantic models for CrewAI Intelligence Analysis
Handles structured data from cultural context and design analysis
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class LanguageType(str, Enum):
    SINHALA = "sinhala"
    TAMIL = "tamil"
    ENGLISH = "english"
    MIXED = "mixed"

class CulturalCategory(str, Enum):
    POLITICAL = "political"
    RELIGIOUS = "religious"
    CULTURAL = "cultural"
    HISTORICAL = "historical"
    GEOGRAPHICAL = "geographical"
    CELEBRITY = "celebrity"
    TRADITIONAL = "traditional"

class DesignTheme(str, Enum):
    FORMAL = "formal"
    CASUAL = "casual"
    CELEBRATORY = "celebratory"
    TRADITIONAL = "traditional"
    MODERN = "modern"
    PATRIOTIC = "patriotic"
    CULTURAL = "cultural"

class PersonAnalysis(BaseModel):
    name: str
    full_name: Optional[str] = None
    title: Optional[str] = None
    significance: str
    category: CulturalCategory
    confidence_score: float = Field(ge=0.0, le=1.0)
    search_results: List[str] = []

class PlaceAnalysis(BaseModel):
    name: str
    full_name: Optional[str] = None
    location_type: str  # city, district, landmark, etc.
    significance: str
    coordinates: Optional[Dict[str, float]] = None
    confidence_score: float = Field(ge=0.0, le=1.0)
    search_results: List[str] = []

class ObjectAnalysis(BaseModel):
    name: str
    english_name: Optional[str] = None
    category: str  # flower, food, symbol, etc.
    cultural_meaning: str
    symbolic_significance: Optional[str] = None
    confidence_score: float = Field(ge=0.0, le=1.0)

class LanguageAnalysis(BaseModel):
    detected_language: LanguageType
    original_words: List[str]
    translations: Dict[str, str] = {}
    romanization: Dict[str, str] = {}
    confidence_score: float = Field(ge=0.0, le=1.0)

class CulturalAnalysis(BaseModel):
    people: List[PersonAnalysis] = []
    places: List[PlaceAnalysis] = []
    objects: List[ObjectAnalysis] = []
    overall_context: str
    cultural_themes: List[str] = []
    language_analysis: LanguageAnalysis
    confidence_score: float = Field(ge=0.0, le=1.0)


class ColorPalette(BaseModel):
    primary_colors: List[str] = Field(min_length=2, max_length=5)
    accent_colors: List[str] = []
    cultural_significance: Optional[str] = None
    mood: str

class TypographyRecommendation(BaseModel):
    primary_font: str
    secondary_font: Optional[str] = None
    style_category: str  # serif, sans-serif, traditional, decorative
    cultural_appropriateness: str
    size_recommendations: Dict[str, int] = {}

class DesignStrategy(BaseModel):
    theme: DesignTheme
    mood: str
    color_palette: ColorPalette
    typography: TypographyRecommendation
    layout_style: str
    cultural_symbols_to_include: List[str] = []
    cultural_symbols_to_avoid: List[str] = []
    target_audience: str
    formality_level: float = Field(ge=0.0, le=1.0)  # 0=very casual, 1=very formal

class BackgroundConcept(BaseModel):
    title: str
    description: str
    search_terms: List[str]
    style_notes: str
    cultural_elements: List[str] = []

class CompositionIdea(BaseModel):
    layout_type: str  # centered, rule_of_thirds, asymmetric, etc.
    description: str
    element_positioning: Dict[str, str] = {}
    cultural_considerations: List[str] = []

class VisualContent(BaseModel):
    background_concepts: List[BackgroundConcept]
    general_search_terms: List[str]
    composition_ideas: List[CompositionIdea]
    artistic_style: str
    visual_mood: str

class IntelligentAnalysisRequest(BaseModel):
    query: str = Field(min_length=3, max_length=500)
    user_preferences: Optional[Dict[str, Any]] = {}
    target_platform: str = "social_media"  # social_media, poster, banner
    size_preference: str = "square"  # square, story, landscape

class IntelligentAnalysisResponse(BaseModel):
    original_query: str
    cultural_analysis: CulturalAnalysis
    design_strategy: DesignStrategy
    visual_content: VisualContent
    processing_metadata: Dict[str, Any] = {
        "processing_time": "",
        "confidence_score": 0.0,
        "crew_agents_used": [],
        "search_queries_performed": 0,
        "analysis_timestamp": ""
    }

# Enhanced prompt analysis for Layer 1 (Background) generation
class EnhancedBackgroundPrompt(BaseModel):
    base_prompt: str
    cultural_context: str
    style_modifiers: List[str]
    color_guidance: str
    composition_hints: str
    quality_modifiers: List[str] = [
        "high quality", "professional photography", "cinematic lighting"
    ]
    negative_prompts: List[str] = [
        "low quality", "blurry", "distorted", "amateur"
    ]

# Smart layout suggestions for Layer 2 (Artists)
class SmartLayoutSuggestion(BaseModel):
    layout_name: str
    description: str
    positions: List[Dict[str, Any]]  # x, y, width, height for each artist
    cultural_reasoning: str
    hierarchy_notes: str

# Intelligent text suggestions for Layer 3
class IntelligentTextSuggestion(BaseModel):
    suggested_text: str
    font_recommendation: str
    color_recommendation: str
    position_suggestion: Dict[str, float]
    cultural_appropriateness: str
    size_recommendation: int