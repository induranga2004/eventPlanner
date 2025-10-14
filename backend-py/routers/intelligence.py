"""
Intelligence Router for CrewAI-powered cultural analysis and design suggestions
Handles natural language queries like "mahinda mahaththaya with nelum kuluna colombo"
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import time
import asyncio
from datetime import datetime

from models.intelligence import (
    IntelligentAnalysisRequest, IntelligentAnalysisResponse,
    CulturalAnalysis, DesignStrategy, VisualContent,
    PersonAnalysis, PlaceAnalysis, ObjectAnalysis, LanguageAnalysis,
    ColorPalette, TypographyRecommendation, BackgroundConcept,
    CompositionIdea, LanguageType, CulturalCategory, DesignTheme,
    EnhancedBackgroundPrompt, SmartLayoutSuggestion, IntelligentTextSuggestion
)
from services.intelligent_crew import design_crew

router = APIRouter()

@router.get("/")
async def intelligence_status():
    """Check if intelligence system is working"""
    return {
        "status": "Intelligence system active",
        "endpoints": ["/analyze", "/enhance-background-prompt", "/suggest-smart-layout", "/suggest-intelligent-text"],
        "crewai_ready": True,
        "cultural_database": "Sri Lankan context loaded"
    }

@router.post("/analyze", response_model=IntelligentAnalysisResponse)
async def analyze_intelligent_query(request: IntelligentAnalysisRequest):
    """
    Main intelligence endpoint - processes natural language queries
    Example: "mahinda mahaththaya with nelum kuluna colombo"
    """
    start_time = time.time()
    
    try:
        # Run CrewAI analysis
        crew_results = design_crew.analyze_query(request.query)
        
        # Convert to structured response
        response = _build_structured_response(crew_results, request)
        
        # Add processing metadata
        processing_time = time.time() - start_time
        response.processing_metadata.update({
            "processing_time": f"{processing_time:.2f}s",
            "analysis_timestamp": datetime.now().isoformat(),
            "crew_agents_used": ["cultural_researcher", "design_strategist", "image_curator"],
            "search_queries_performed": 3
        })
        
        return response
        
    except Exception as e:
        # Fallback response if CrewAI fails
        return _create_fallback_response(request, str(e))

@router.post("/enhance-background-prompt")
async def enhance_background_prompt(request: Dict[str, Any]):
    """
    Enhance background generation prompt with cultural context
    """
    try:
        base_query = request.get("query", "")
        base_prompt = request.get("base_prompt", "")
        
        if not base_query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        # Quick cultural analysis for prompt enhancement
        analysis = design_crew.analyze_query(base_query)
        
        enhanced_prompt = EnhancedBackgroundPrompt(
            base_prompt=base_prompt or "Professional poster background",
            cultural_context=analysis.get("analysis", {}).get("cultural_context", ""),
            style_modifiers=analysis.get("design_suggestions", {}).get("style", "").split(),
            color_guidance=f"Use colors: {', '.join(analysis.get('design_suggestions', {}).get('color_palette', []))}",
            composition_hints="Cinematic composition with cultural elements"
        )
        
        return {
            "original_query": base_query,
            "enhanced_prompt": enhanced_prompt.model_dump(),
            "suggested_prompt": _build_final_prompt(enhanced_prompt)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prompt enhancement failed: {str(e)}")

@router.post("/suggest-smart-layout")
async def suggest_smart_layout(request: Dict[str, Any]):
    """
    Suggest intelligent layout for Layer 2 (artists positioning)
    """
    try:
        query = request.get("query", "")
        num_artists = request.get("num_artists", 1)
        canvas_size = request.get("canvas_size", {"width": 2048, "height": 2048})
        
        # Analyze cultural context for layout suggestions
        analysis = design_crew.analyze_query(query)
        
        # Generate layout based on cultural context
        layout_suggestion = SmartLayoutSuggestion(
            layout_name="Cultural Hierarchy Layout",
            description="Layout optimized for cultural context and visual hierarchy",
            positions=_generate_smart_positions(num_artists, canvas_size, analysis),
            cultural_reasoning="Positioning based on cultural significance and visual balance",
            hierarchy_notes="Primary subject centered, supporting elements positioned culturally appropriately"
        )
        
        return {
            "query": query,
            "layout_suggestion": layout_suggestion.model_dump(),
            "alternative_layouts": _generate_alternative_layouts(num_artists, canvas_size)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Layout suggestion failed: {str(e)}")

@router.post("/suggest-intelligent-text")
async def suggest_intelligent_text(request: Dict[str, Any]):
    """
    Suggest culturally appropriate text styling for Layer 3
    """
    try:
        query = request.get("query", "")
        text_content = request.get("text_content", "")
        
        analysis = design_crew.analyze_query(query)
        
        text_suggestion = IntelligentTextSuggestion(
            suggested_text=text_content or _extract_title_from_query(query),
            font_recommendation="Traditional cultural font",
            color_recommendation=analysis.get("design_suggestions", {}).get("color_palette", ["#FF6B35"])[0],
            position_suggestion={"x": 0.1, "y": 0.1, "width": 0.8, "height": 0.2},
            cultural_appropriateness="Font and styling appropriate for cultural context",
            size_recommendation=72
        )
        
        return {
            "query": query,
            "text_suggestion": text_suggestion.model_dump(),
            "alternative_fonts": _get_cultural_fonts(analysis),
            "color_variations": analysis.get("design_suggestions", {}).get("color_palette", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text suggestion failed: {str(e)}")

# Helper functions
def _build_structured_response(crew_results: Dict[str, Any], request: IntelligentAnalysisRequest) -> IntelligentAnalysisResponse:
    """Convert CrewAI results to structured Pydantic response"""
    
    # Parse cultural analysis
    cultural_analysis = CulturalAnalysis(
        people=[
            PersonAnalysis(
                name=person,
                significance="Identified from cultural context",
                category=CulturalCategory.POLITICAL,  # Default - would be smarter in production
                confidence_score=0.8
            ) for person in crew_results.get("analysis", {}).get("people", [])
        ],
        places=[
            PlaceAnalysis(
                name=place,
                location_type="city",
                significance="Geographic location identified",
                confidence_score=0.8
            ) for place in crew_results.get("analysis", {}).get("places", [])
        ],
        objects=[
            ObjectAnalysis(
                name=obj,
                category="cultural_symbol",
                cultural_meaning="Traditional cultural significance",
                confidence_score=0.8
            ) for obj in crew_results.get("analysis", {}).get("objects", [])
        ],
        overall_context=crew_results.get("analysis", {}).get("cultural_context", ""),
        cultural_themes=["traditional", "cultural", "local"],
        language_analysis=LanguageAnalysis(
            detected_language=LanguageType.MIXED,
            original_words=request.query.split(),
            confidence_score=0.7
        ),
        confidence_score=crew_results.get("confidence_score", 0.8)
    )
    
    # Parse design strategy
    design_strategy = DesignStrategy(
        theme=DesignTheme.CULTURAL,
        mood=crew_results.get("design_suggestions", {}).get("theme", "cultural"),
        color_palette=ColorPalette(
            primary_colors=crew_results.get("design_suggestions", {}).get("color_palette", ["#FF6B35", "#F7931E"]),
            mood="warm and welcoming"
        ),
        typography=TypographyRecommendation(
            primary_font="Traditional Cultural Font",
            style_category="traditional",
            cultural_appropriateness="Appropriate for cultural context"
        ),
        layout_style="balanced",
        target_audience="General public with cultural appreciation",
        formality_level=0.7
    )
    
    # Parse visual content
    visual_content = VisualContent(
        background_concepts=[
            BackgroundConcept(
                title=concept,
                description="Culturally appropriate background",
                search_terms=[concept, "cultural background"],
                style_notes="Traditional styling with cultural elements"
            ) for concept in crew_results.get("visual_content", {}).get("background_concepts", ["Cultural background"])
        ],
        general_search_terms=crew_results.get("visual_content", {}).get("search_terms", []),
        composition_ideas=[
            CompositionIdea(
                layout_type="centered",
                description=idea,
                cultural_considerations=["Respectful positioning", "Cultural hierarchy"]
            ) for idea in crew_results.get("visual_content", {}).get("composition_ideas", ["Centered composition"])
        ],
        artistic_style=crew_results.get("design_suggestions", {}).get("style", "cultural"),
        visual_mood="respectful and celebratory"
    )
    
    return IntelligentAnalysisResponse(
        original_query=request.query,
        cultural_analysis=cultural_analysis,
        design_strategy=design_strategy,
        visual_content=visual_content
    )

def _create_fallback_response(request: IntelligentAnalysisRequest, error: str) -> IntelligentAnalysisResponse:
    """Create a basic response when CrewAI fails"""
    
    cultural_analysis = CulturalAnalysis(
        overall_context="Unable to perform full analysis",
        language_analysis=LanguageAnalysis(
            detected_language=LanguageType.MIXED,
            original_words=request.query.split(),
            confidence_score=0.3
        ),
        confidence_score=0.3
    )
    
    design_strategy = DesignStrategy(
        theme=DesignTheme.CULTURAL,
        mood="neutral",
        color_palette=ColorPalette(
            primary_colors=["#FF6B35", "#F7931E"],
            mood="warm"
        ),
        typography=TypographyRecommendation(
            primary_font="Arial",
            style_category="sans-serif",
            cultural_appropriateness="Generic fallback"
        ),
        layout_style="centered",
        target_audience="General",
        formality_level=0.5
    )
    
    visual_content = VisualContent(
        background_concepts=[
            BackgroundConcept(
                title="Generic Background",
                description="Basic background concept",
                search_terms=[request.query],
                style_notes="Simple styling"
            )
        ],
        general_search_terms=[request.query],
        composition_ideas=[
            CompositionIdea(
                layout_type="centered",
                description="Simple centered layout"
            )
        ],
        artistic_style="simple",
        visual_mood="neutral"
    )
    
    return IntelligentAnalysisResponse(
        original_query=request.query,
        cultural_analysis=cultural_analysis,
        design_strategy=design_strategy,
        visual_content=visual_content,
        processing_metadata={
            "processing_time": "0.1s",
            "confidence_score": 0.3,
            "error": f"Fallback mode: {error}",
            "analysis_timestamp": datetime.now().isoformat()
        }
    )

def _build_final_prompt(enhanced_prompt: EnhancedBackgroundPrompt) -> str:
    """Build final prompt string for image generation"""
    parts = [
        enhanced_prompt.base_prompt,
        enhanced_prompt.cultural_context,
        enhanced_prompt.color_guidance,
        enhanced_prompt.composition_hints,
        ", ".join(enhanced_prompt.style_modifiers),
        ", ".join(enhanced_prompt.quality_modifiers)
    ]
    
    final_prompt = ". ".join(filter(None, parts))
    return final_prompt

def _generate_smart_positions(num_artists: int, canvas_size: Dict[str, int], analysis: Dict[str, Any]) -> list:
    """Generate intelligent positioning for artists"""
    positions = []
    width, height = canvas_size["width"], canvas_size["height"]
    
    # Simple layout logic - would be more sophisticated in production
    if num_artists == 1:
        positions.append({"x": width//4, "y": height//3, "width": width//2, "height": height//2, "z": 1})
    else:
        for i in range(min(num_artists, 10)):  # Max 10 artists
            x = (width // (num_artists + 1)) * (i + 1) - width//8
            y = height//2 + (i % 2 - 0.5) * height//4
            positions.append({"x": x, "y": y, "width": width//6, "height": height//3, "z": i+1})
    
    return positions

def _generate_alternative_layouts(num_artists: int, canvas_size: Dict[str, int]) -> list:
    """Generate alternative layout options"""
    return [
        {"name": "Grid Layout", "description": "Organized grid arrangement"},
        {"name": "Circular Layout", "description": "Artists arranged in a circle"},
        {"name": "Hierarchy Layout", "description": "Main subject prominent, others supporting"}
    ]

def _extract_title_from_query(query: str) -> str:
    """Extract potential title from query"""
    return query.title()

def _get_cultural_fonts(analysis: Dict[str, Any]) -> list:
    """Get culturally appropriate font suggestions"""
    return ["Noto Sans Sinhala", "Noto Serif Sinhala", "Abhaya Libre", "Traditional Font"]