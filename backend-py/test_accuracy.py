"""
Debug and testing utilities for the design API
Helps with testing different parameters and analyzing results
"""
import requests
import json
from typing import Dict, Any, List
import base64
from io import BytesIO
from PIL import Image

class DesignTester:
    """Testing utilities for design generation accuracy"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
    
    def test_start_design(self, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Test the start design endpoint with custom data"""
        url = f"{self.base_url}/api/design/start"
        response = requests.post(url, json=test_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": response.text, "status": response.status_code}
    
    def test_harmonize(self, harmonize_data: Dict[str, Any]) -> Dict[str, Any]:
        """Test the harmonize endpoint"""
        url = f"{self.base_url}/api/design/harmonize"
        response = requests.post(url, json=harmonize_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": response.text, "status": response.status_code}
    
    def create_test_event_data(
        self,
        title: str = "Electric Nights Festival",
        city: str = "Miami",
        genre: str = "electronic",
        mood: str = "neon",
        palette: List[str] = None
    ) -> Dict[str, Any]:
        """Create test event data"""
        if palette is None:
            palette = ["#FF0080", "#00FFFF", "#8000FF"]
        
        return {
            "campaign_id": "test_campaign_001",
            "event": {
                "title": title,
                "city": city,
                "date": "2025-12-31",
                "audience": "18-35 electronic music fans",
                "genre": genre
            },
            "artists": [
                {
                    "id": "artist_001",
                    "name": "DJ Test",
                    "cutout_url": "https://example.com/artist1_cutout.png"
                }
            ],
            "style_prefs": {
                "mood": mood,
                "palette": palette,
                "sizes": ["square"]
            }
        }
    
    def analyze_prompt_variations(self, base_event: Dict[str, Any]):
        """Test different prompt variations for accuracy analysis"""
        variations = [
            {"mood": "neon", "genre": "electronic"},
            {"mood": "retro", "genre": "rock"},
            {"mood": "minimal", "genre": "pop"},
            {"mood": "lush", "genre": "jazz"},
        ]
        
        results = []
        for variation in variations:
            test_data = base_event.copy()
            test_data["event"]["genre"] = variation["genre"]
            test_data["style_prefs"]["mood"] = variation["mood"]
            
            result = self.test_start_design(test_data)
            result["variation"] = variation
            results.append(result)
        
        return results
    
    def download_and_analyze_image(self, image_url: str) -> Dict[str, Any]:
        """Download and analyze generated image"""
        try:
            response = requests.get(image_url, timeout=30)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content))
                return {
                    "success": True,
                    "size": img.size,
                    "mode": img.mode,
                    "format": img.format,
                    "url": image_url
                }
        except Exception as e:
            return {"success": False, "error": str(e), "url": image_url}

# Example usage for testing
def run_accuracy_tests():
    """Run a series of tests to evaluate accuracy"""
    tester = DesignTester()
    
    print("🧪 Testing Design Generation Accuracy...")
    
    # Test 1: Basic generation
    test_data = tester.create_test_event_data()
    result = tester.test_start_design(test_data)
    print(f"✅ Basic test: {'Success' if 'variants' in result else 'Failed'}")
    
    # Test 2: Different mood/genre combinations
    variations = tester.analyze_prompt_variations(test_data)
    print(f"✅ Tested {len(variations)} prompt variations")
    
    # Test 3: Analyze generated backgrounds
    if 'variants' in result and result['variants']:
        bg_url = result['variants'][0]['layers'].get('l1_background_url')
        if bg_url:
            analysis = tester.download_and_analyze_image(bg_url)
            print(f"🎨 Background analysis: {analysis}")
    
    return result

if __name__ == "__main__":
    run_accuracy_tests()