"""
Intelligent Text Placement System
Analyzes background composition to find optimal text positions
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import List, Tuple, Dict, Optional
import requests
import io

class TextPlacementOptimizer:
    """Optimizes text placement based on background composition"""
    
    def __init__(self):
        self.safe_zones = {
            "square": [(0.1, 0.1, 0.9, 0.3), (0.1, 0.7, 0.9, 0.9)],  # Top and bottom
            "story": [(0.1, 0.1, 0.9, 0.25), (0.1, 0.75, 0.9, 0.9)]   # Top and bottom for vertical
        }
    
    def analyze_background_composition(self, bg_url: str, size_type: str = "square") -> Dict[str, any]:
        """Analyze background to find optimal text placement zones"""
        try:
            response = requests.get(bg_url, timeout=30)
            if response.status_code != 200:
                return self._get_default_zones(size_type)
            
            img = Image.open(io.BytesIO(response.content)).convert('RGB')
            return self._analyze_image_composition(img, size_type)
        
        except Exception as e:
            print(f"Background analysis failed: {e}")
            return self._get_default_zones(size_type)
    
    def _analyze_image_composition(self, img: Image.Image, size_type: str) -> Dict[str, any]:
        """Analyze image composition for text placement"""
        width, height = img.size
        
        # Convert to grayscale for analysis
        gray = img.convert('L')
        img_array = np.array(gray)
        
        # Find low-activity areas (good for text)
        activity_map = self._calculate_activity_map(img_array)
        contrast_map = self._calculate_contrast_map(img_array)
        
        # Find optimal zones
        text_zones = self._find_optimal_text_zones(
            activity_map, contrast_map, width, height, size_type
        )
        
        # Analyze color regions for text color recommendations
        color_analysis = self._analyze_color_regions(img, text_zones)
        
        return {
            "optimal_zones": text_zones,
            "color_recommendations": color_analysis,
            "composition_type": self._detect_composition_type(activity_map),
            "background_complexity": float(np.mean(activity_map))
        }
    
    def _calculate_activity_map(self, img_array: np.ndarray) -> np.ndarray:
        """Calculate activity/busyness map of the image"""
        # Sobel edge detection
        sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
        sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
        
        # Apply convolution (simplified)
        height, width = img_array.shape
        activity = np.zeros((height-2, width-2))
        
        for i in range(1, height-1):
            for j in range(1, width-1):
                region = img_array[i-1:i+2, j-1:j+2]
                gx = np.sum(region * sobel_x)
                gy = np.sum(region * sobel_y)
                activity[i-1, j-1] = np.sqrt(gx**2 + gy**2)
        
        return activity
    
    def _calculate_contrast_map(self, img_array: np.ndarray) -> np.ndarray:
        """Calculate local contrast map"""
        # Simple local standard deviation as contrast measure
        height, width = img_array.shape
        contrast = np.zeros((height-2, width-2))
        
        for i in range(1, height-1):
            for j in range(1, width-1):
                region = img_array[i-1:i+2, j-1:j+2]
                contrast[i-1, j-1] = np.std(region)
        
        return contrast
    
    def _find_optimal_text_zones(self, activity_map: np.ndarray, contrast_map: np.ndarray, 
                               width: int, height: int, size_type: str) -> List[Dict[str, any]]:
        """Find optimal zones for text placement"""
        # Combine activity and contrast (lower is better for text)
        composite_map = activity_map + contrast_map * 0.5
        
        # Define potential zones based on layout type
        potential_zones = []
        
        if size_type == "square":
            # Top, middle, bottom zones
            zone_height = height // 4
            zones = [
                (0, 0, width, zone_height),           # Top
                (0, height//2 - zone_height//2, width, height//2 + zone_height//2),  # Middle
                (0, height - zone_height, width, height)  # Bottom
            ]
        else:  # story
            # Top, upper-middle, lower-middle, bottom
            zone_height = height // 6
            zones = [
                (0, 0, width, zone_height),           # Top
                (0, height//3, width, height//3 + zone_height),      # Upper third
                (0, 2*height//3, width, 2*height//3 + zone_height),  # Lower third  
                (0, height - zone_height, width, height)  # Bottom
            ]
        
        # Evaluate each zone
        for i, (x1, y1, x2, y2) in enumerate(zones):
            # Adjust coordinates to activity map dimensions
            ax1, ay1 = max(0, x1), max(0, y1)
            ax2, ay2 = min(composite_map.shape[1], x2-2), min(composite_map.shape[0], y2-2)
            
            if ax2 > ax1 and ay2 > ay1:
                zone_activity = np.mean(composite_map[ay1:ay2, ax1:ax2])
                
                potential_zones.append({
                    "zone_id": f"zone_{i}",
                    "bounds": {"x": x1, "y": y1, "w": x2-x1, "h": y2-y1},
                    "activity_score": float(zone_activity),
                    "suitability": float(1.0 / (1.0 + zone_activity))  # Lower activity = better
                })
        
        # Sort by suitability (best first)
        potential_zones.sort(key=lambda x: x["suitability"], reverse=True)
        
        return potential_zones[:3]  # Return top 3 zones
    
    def _analyze_color_regions(self, img: Image.Image, zones: List[Dict]) -> Dict[str, any]:
        """Analyze color in text zones for text color recommendations"""
        recommendations = {}
        
        for zone in zones:
            bounds = zone["bounds"]
            # Crop zone from image
            zone_img = img.crop((bounds["x"], bounds["y"], 
                               bounds["x"] + bounds["w"], bounds["y"] + bounds["h"]))
            
            # Calculate average color
            avg_color = self._get_average_color(zone_img)
            
            # Determine best text color (white or black)
            text_color = self._recommend_text_color(avg_color)
            
            recommendations[zone["zone_id"]] = {
                "background_color": avg_color,
                "recommended_text_color": text_color,
                "contrast_ratio": self._calculate_contrast_ratio(avg_color, text_color)
            }
        
        return recommendations
    
    def _get_average_color(self, img: Image.Image) -> Tuple[int, int, int]:
        """Get average color of image region"""
        # Resize to small size for performance
        small_img = img.resize((10, 10))
        pixels = list(small_img.getdata())
        
        avg_r = sum(p[0] for p in pixels) // len(pixels)
        avg_g = sum(p[1] for p in pixels) // len(pixels)  
        avg_b = sum(p[2] for p in pixels) // len(pixels)
        
        return (avg_r, avg_g, avg_b)
    
    def _recommend_text_color(self, bg_color: Tuple[int, int, int]) -> str:
        """Recommend text color based on background color"""
        # Calculate luminance
        r, g, b = bg_color
        luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        
        # White text on dark background, black text on light background
        return "#FFFFFF" if luminance < 0.5 else "#000000"
    
    def _calculate_contrast_ratio(self, color1: Tuple[int, int, int], color2: str) -> float:
        """Calculate contrast ratio between background and text color"""
        # Simple contrast calculation
        r1, g1, b1 = color1
        lum1 = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255
        
        # Parse text color
        if color2 == "#FFFFFF":
            lum2 = 1.0
        else:  # #000000
            lum2 = 0.0
        
        # Contrast ratio formula
        lighter = max(lum1, lum2)
        darker = min(lum1, lum2)
        
        return (lighter + 0.05) / (darker + 0.05)
    
    def _detect_composition_type(self, activity_map: np.ndarray) -> str:
        """Detect the type of composition (centered, rule_of_thirds, etc.)"""
        height, width = activity_map.shape
        
        # Analyze activity in center vs edges
        center_region = activity_map[height//3:2*height//3, width//3:2*width//3]
        center_activity = np.mean(center_region)
        
        edge_regions = [
            activity_map[:height//3, :],      # Top
            activity_map[2*height//3:, :],    # Bottom
            activity_map[:, :width//3],       # Left
            activity_map[:, 2*width//3:]      # Right
        ]
        edge_activity = np.mean([np.mean(region) for region in edge_regions])
        
        if center_activity > edge_activity * 1.5:
            return "centered"
        elif edge_activity > center_activity * 1.5:
            return "edge_focused"
        else:
            return "balanced"
    
    def _get_default_zones(self, size_type: str) -> Dict[str, any]:
        """Fallback zones when analysis fails"""
        if size_type == "square":
            return {
                "optimal_zones": [
                    {"zone_id": "top", "bounds": {"x": 100, "y": 50, "w": 1848, "h": 300}, 
                     "activity_score": 0.5, "suitability": 0.8},
                    {"zone_id": "bottom", "bounds": {"x": 100, "y": 1648, "w": 1848, "h": 300}, 
                     "activity_score": 0.5, "suitability": 0.8}
                ],
                "color_recommendations": {
                    "top": {"recommended_text_color": "#FFFFFF", "contrast_ratio": 7.0},
                    "bottom": {"recommended_text_color": "#FFFFFF", "contrast_ratio": 7.0}
                },
                "composition_type": "balanced",
                "background_complexity": 0.5
            }
        else:
            return {
                "optimal_zones": [
                    {"zone_id": "top", "bounds": {"x": 80, "y": 50, "w": 920, "h": 200}, 
                     "activity_score": 0.5, "suitability": 0.8},
                    {"zone_id": "bottom", "bounds": {"x": 80, "y": 1620, "w": 920, "h": 200}, 
                     "activity_score": 0.5, "suitability": 0.8}
                ],
                "color_recommendations": {
                    "top": {"recommended_text_color": "#FFFFFF", "contrast_ratio": 7.0},
                    "bottom": {"recommended_text_color": "#FFFFFF", "contrast_ratio": 7.0}
                },
                "composition_type": "balanced", 
                "background_complexity": 0.5
            }

# Utility functions
def optimize_text_placement(bg_url: str, size_type: str = "square") -> Dict[str, any]:
    """Quick text placement optimization"""
    optimizer = TextPlacementOptimizer()
    return optimizer.analyze_background_composition(bg_url, size_type)