"""
Cultural Context Database for Sri Lankan References
Provides local knowledge for better CrewAI analysis
"""
from typing import Dict, List, Any

class SriLankanCulturalDB:
    """Database of Sri Lankan cultural references, people, and places"""
    
    def __init__(self):
        self.people = {
            # Political figures
            "mahinda": {
                "full_name": "Mahinda Rajapaksa",
                "title": "Former President of Sri Lanka",
                "significance": "Former President (2005-2015), current Member of Parliament",
                "category": "political",
                "alternative_names": ["mahinda mahaththaya", "mahinda rajapaksa"],
                "design_suggestions": {
                    "colors": ["#FF6B35", "#1E90FF", "#FFD700"],  # Sri Lankan flag colors
                    "style": "formal",
                    "themes": ["leadership", "patriotic", "official"]
                }
            },
            "gotabaya": {
                "full_name": "Gotabaya Rajapaksa", 
                "title": "Former President of Sri Lanka",
                "significance": "Former President (2019-2022)",
                "category": "political",
                "alternative_names": ["gota", "gotabaya rajapaksa"],
                "design_suggestions": {
                    "colors": ["#FF6B35", "#1E90FF"],
                    "style": "formal",
                    "themes": ["leadership", "official"]
                }
            },
            "ranil": {
                "full_name": "Ranil Wickremesinghe",
                "title": "President of Sri Lanka", 
                "significance": "Current President and former Prime Minister",
                "category": "political",
                "alternative_names": ["ranil wickremesinghe", "ranil mahaththaya"],
                "design_suggestions": {
                    "colors": ["#228B22", "#FFD700"],  # UNP colors
                    "style": "formal",
                    "themes": ["leadership", "governance"]
                }
            }
        }
        
        self.places = {
            "colombo": {
                "full_name": "Colombo",
                "type": "city",
                "significance": "Commercial capital of Sri Lanka",
                "province": "Western Province",
                "landmarks": ["Galle Face Green", "Independence Square", "Colombo Fort"],
                "design_suggestions": {
                    "colors": ["#4169E1", "#FF6347", "#32CD32"],
                    "themes": ["urban", "modern", "commercial"],
                    "background_concepts": ["Colombo skyline", "Galle Face sunset", "urban landscape"]
                }
            },
            "kandy": {
                "full_name": "Kandy",
                "type": "city",
                "significance": "Cultural capital and UNESCO World Heritage Site",
                "province": "Central Province", 
                "landmarks": ["Temple of the Tooth", "Kandy Lake", "Royal Botanical Gardens"],
                "design_suggestions": {
                    "colors": ["#8B4513", "#FFD700", "#228B22"],
                    "themes": ["cultural", "traditional", "heritage"],
                    "background_concepts": ["Temple of the Tooth", "Kandy Lake", "hill country"]
                }
            },
            "anuradhapura": {
                "full_name": "Anuradhapura",
                "type": "ancient_city",
                "significance": "Ancient capital and UNESCO World Heritage Site", 
                "province": "North Central Province",
                "landmarks": ["Sri Maha Bodhi", "Ruwanwelisaya", "Jetavanaramaya"],
                "design_suggestions": {
                    "colors": ["#DEB887", "#8B4513", "#228B22"],
                    "themes": ["ancient", "religious", "heritage"],
                    "background_concepts": ["ancient stupas", "sacred Bo tree", "archaeological ruins"]
                }
            }
        }
        
        self.cultural_objects = {
            "nelum": {
                "english_name": "Lotus",
                "category": "flower",
                "significance": "National flower of Sri Lanka",
                "cultural_meaning": "Symbol of purity, enlightenment, and Buddhism",
                "alternative_names": ["lotus", "nelum mal"],
                "design_suggestions": {
                    "colors": ["#FFB6C1", "#FFFFFF", "#32CD32"],
                    "placement": "decorative element",
                    "symbolism": "purity, spirituality"
                }
            },
            "sinha": {
                "english_name": "Lion", 
                "category": "animal",
                "significance": "National symbol on Sri Lankan flag",
                "cultural_meaning": "Symbol of bravery and strength",
                "alternative_names": ["lion", "simha"],
                "design_suggestions": {
                    "colors": ["#FFD700", "#8B4513"],
                    "placement": "prominent symbol",
                    "symbolism": "strength, courage, national pride"
                }
            },
            "kiri": {
                "english_name": "Milk rice",
                "category": "food",
                "significance": "Traditional celebratory food",
                "cultural_meaning": "Symbol of prosperity and good fortune",
                "alternative_names": ["kiribath", "milk rice"],
                "design_suggestions": {
                    "colors": ["#FFFFFF", "#F5DEB3"],
                    "themes": ["celebration", "tradition", "prosperity"]
                }
            }
        }
        
        self.sinhala_words = {
            "mahaththaya": {
                "english": "Sir/Mister (respectful title)",
                "context": "Honorific title used for respected men",
                "usage": "formal address"
            },
            "nona": {
                "english": "Madam/Mrs (respectful title)",
                "context": "Honorific title used for respected women", 
                "usage": "formal address"
            },
            "ayubowan": {
                "english": "May you live long (greeting)",
                "context": "Traditional Sri Lankan greeting",
                "usage": "formal greeting"
            },
            "mal": {
                "english": "flower",
                "context": "Common suffix for flower names",
                "usage": "botanical terms"
            },
            "kuluna": {
                "english": "flowers (plural)",
                "context": "Multiple flowers or floral arrangements",
                "usage": "botanical terms"
            }
        }
        
        self.color_associations = {
            "buddhist": ["#FFD700", "#8B4513", "#FF6347"],  # Saffron, brown, orange
            "national": ["#FF6B35", "#1E90FF", "#228B22", "#FFD700"],  # Flag colors
            "traditional": ["#8B4513", "#DEB887", "#228B22"],  # Earth tones
            "celebratory": ["#FFD700", "#FF1493", "#00CED1"],  # Bright, festive
            "religious": ["#FFFFFF", "#FFD700", "#8B4513"],  # Pure, sacred
            "royal": ["#4B0082", "#FFD700", "#8B0000"]  # Purple, gold, maroon
        }

    def search_person(self, query: str) -> Dict[str, Any]:
        """Search for person in cultural database"""
        query_lower = query.lower()
        for key, person in self.people.items():
            if (key in query_lower or 
                any(name.lower() in query_lower for name in person.get("alternative_names", []))):
                return person
        return None

    def search_place(self, query: str) -> Dict[str, Any]:  
        """Search for place in cultural database"""
        query_lower = query.lower()
        for key, place in self.places.items():
            if key in query_lower:
                return place
        return None

    def search_cultural_object(self, query: str) -> Dict[str, Any]:
        """Search for cultural object in database"""
        query_lower = query.lower()
        for key, obj in self.cultural_objects.items():
            if (key in query_lower or 
                any(name.lower() in query_lower for name in obj.get("alternative_names", []))):
                return obj
        return None

    def translate_sinhala_words(self, query: str) -> Dict[str, str]:
        """Find and translate Sinhala words in query"""
        translations = {}
        query_lower = query.lower()
        for sinhala_word, translation_data in self.sinhala_words.items():
            if sinhala_word in query_lower:
                translations[sinhala_word] = translation_data["english"]
        return translations

    def get_contextual_colors(self, context: str) -> List[str]:
        """Get appropriate colors based on context"""
        context_lower = context.lower()
        for theme, colors in self.color_associations.items():
            if theme in context_lower:
                return colors
        return self.color_associations["traditional"]  # Default

    def analyze_cultural_context(self, query: str) -> Dict[str, Any]:
        """Comprehensive cultural analysis of query"""
        analysis = {
            "people_found": [],
            "places_found": [],
            "objects_found": [],
            "translations": {},
            "suggested_colors": [],
            "cultural_themes": [],
            "formality_level": 0.5
        }

        # Search for people
        person = self.search_person(query)
        if person:
            analysis["people_found"].append(person)
            analysis["suggested_colors"].extend(person["design_suggestions"]["colors"])
            analysis["cultural_themes"].extend(person["design_suggestions"]["themes"])
            analysis["formality_level"] = 0.8  # Political figures are formal

        # Search for places  
        place = self.search_place(query)
        if place:
            analysis["places_found"].append(place)
            analysis["suggested_colors"].extend(place["design_suggestions"]["colors"])
            analysis["cultural_themes"].extend(place["design_suggestions"]["themes"])

        # Search for objects
        obj = self.search_cultural_object(query)
        if obj:
            analysis["objects_found"].append(obj)
            analysis["suggested_colors"].extend(obj["design_suggestions"]["colors"])

        # Translate Sinhala words
        analysis["translations"] = self.translate_sinhala_words(query)
        
        # Remove duplicates and limit colors
        analysis["suggested_colors"] = list(set(analysis["suggested_colors"]))[:5]
        analysis["cultural_themes"] = list(set(analysis["cultural_themes"]))

        return analysis

# Global cultural database instance
cultural_db = SriLankanCulturalDB()