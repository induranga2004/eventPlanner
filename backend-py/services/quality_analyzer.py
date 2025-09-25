"""
Image Quality Analysis for AI Generated Design Assets
Automatically evaluates the quality and composition of generated images
"""
import io
import numpy as np
from PIL import Image, ImageStat, ImageFilter
from typing import Dict, Any, List, Tuple
import requests
from colorsys import rgb_to_hsv

class ImageQualityAnalyzer:
    """Analyzes quality metrics of generated images"""
    
    def __init__(self):
        self.quality_thresholds = {
            "sharpness": 100.0,      # Laplacian variance
            "contrast": 50.0,        # RMS contrast
            "color_harmony": 0.7,    # HSV harmony score
            "brightness": (50, 200), # Acceptable brightness range
            "composition": 0.6       # Rule of thirds score
        }
    
    def analyze_image_url(self, image_url: str) -> Dict[str, Any]:
        """Analyze image from URL"""
        try:
            response = requests.get(image_url, timeout=30)
            if response.status_code == 200:
                img = Image.open(io.BytesIO(response.content))
                return self.analyze_image(img)
            else:
                return {"error": f"Failed to fetch image: {response.status_code}"}
        except Exception as e:
            return {"error": str(e)}
    
    def analyze_image(self, img: Image.Image) -> Dict[str, Any]:
        """Comprehensive image quality analysis"""
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        analysis = {
            "dimensions": img.size,
            "sharpness": self._measure_sharpness(img),
            "contrast": self._measure_contrast(img),
            "brightness": self._measure_brightness(img),
            "color_harmony": self._measure_color_harmony(img),
            "composition": self._analyze_composition(img),
            "noise_level": self._measure_noise(img),
            "saturation": self._measure_saturation(img)
        }
        
        # Overall quality score
        analysis["quality_score"] = self._calculate_quality_score(analysis)
        analysis["quality_grade"] = self._grade_quality(analysis["quality_score"])
        analysis["recommendations"] = self._generate_recommendations(analysis)
        
        return analysis
    
    def _measure_sharpness(self, img: Image.Image) -> float:
        """Measure image sharpness using Laplacian variance"""
        gray = img.convert('L')
        gray_array = np.array(gray)
        laplacian = np.array([[0, -1, 0], [-1, 4, -1], [0, -1, 0]])
        
        # Apply Laplacian filter
        filtered = np.abs(np.convolve(gray_array.flatten(), laplacian.flatten(), mode='same'))
        return float(np.var(filtered))
    
    def _measure_contrast(self, img: Image.Image) -> float:
        """Measure RMS contrast"""
        gray = img.convert('L')
        stat = ImageStat.Stat(gray)
        return stat.stddev[0]  # Standard deviation as contrast measure
    
    def _measure_brightness(self, img: Image.Image) -> float:
        """Measure average brightness"""
        gray = img.convert('L')
        stat = ImageStat.Stat(gray)
        return stat.mean[0]
    
    def _measure_color_harmony(self, img: Image.Image) -> float:
        """Analyze color harmony using HSV distribution"""
        # Sample pixels (reduce for performance)
        img_small = img.resize((100, 100))
        pixels = list(img_small.getdata())
        
        # Convert to HSV
        hsv_values = []
        for r, g, b in pixels[:1000]:  # Sample subset
            h, s, v = rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            hsv_values.append((h, s, v))
        
        # Analyze hue distribution
        hues = [hsv[0] for hsv in hsv_values if hsv[1] > 0.1]  # Ignore near-grayscale
        if not hues:
            return 0.5
        
        # Calculate harmony score (complementary and analogous colors)
        hue_variance = np.var(hues)
        harmony_score = min(1.0, 1.0 - (hue_variance * 2))
        return float(harmony_score)
    
    def _analyze_composition(self, img: Image.Image) -> float:
        """Analyze composition using rule of thirds and visual balance"""
        gray = img.convert('L')
        width, height = gray.size
        
        # Rule of thirds lines
        h_lines = [height // 3, 2 * height // 3]
        v_lines = [width // 3, 2 * width // 3]
        
        # Convert to array for analysis
        img_array = np.array(gray)
        
        # Find interest points (high gradient areas)
        gradient_x = np.abs(np.diff(img_array, axis=1))
        gradient_y = np.abs(np.diff(img_array, axis=0))
        
        # Score based on proximity to rule of thirds intersections
        interest_points = []
        threshold = np.percentile(np.concatenate([gradient_x.flatten(), gradient_y.flatten()]), 90)
        
        for y in range(1, height-1):
            for x in range(1, width-1):
                if x < width-1 and y < height-1:
                    if gradient_x[y, x-1] > threshold or gradient_y[y-1, x] > threshold:
                        interest_points.append((x, y))
        
        # Calculate composition score
        if not interest_points:
            return 0.5
        
        # Score based on rule of thirds intersections
        intersections = [(v, h) for v in v_lines for h in h_lines]
        composition_scores = []
        
        for point in interest_points[:20]:  # Limit for performance
            min_distance = min(
                np.sqrt((point[0] - inter[0])**2 + (point[1] - inter[1])**2)
                for inter in intersections
            )
            # Closer to intersection = better score
            score = max(0, 1.0 - (min_distance / (width * 0.1)))
            composition_scores.append(score)
        
        return float(np.mean(composition_scores)) if composition_scores else 0.5
    
    def _measure_noise(self, img: Image.Image) -> float:
        """Measure image noise level"""
        # Apply Gaussian blur and compare
        blurred = img.filter(ImageFilter.GaussianBlur(1))
        
        # Calculate difference
        diff = np.array(img.convert('L')) - np.array(blurred.convert('L'))
        noise_level = np.std(diff)
        
        return float(noise_level)
    
    def _measure_saturation(self, img: Image.Image) -> float:
        """Measure average color saturation"""
        img_small = img.resize((50, 50))
        pixels = list(img_small.getdata())
        
        saturations = []
        for r, g, b in pixels:
            _, s, _ = rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            saturations.append(s)
        
        return float(np.mean(saturations))
    
    def _calculate_quality_score(self, analysis: Dict[str, Any]) -> float:
        """Calculate overall quality score (0-1)"""
        scores = []
        
        # Sharpness score (normalized)
        sharpness_score = min(1.0, analysis["sharpness"] / self.quality_thresholds["sharpness"])
        scores.append(sharpness_score * 0.25)  # 25% weight
        
        # Contrast score (normalized)
        contrast_score = min(1.0, analysis["contrast"] / self.quality_thresholds["contrast"])
        scores.append(contrast_score * 0.2)  # 20% weight
        
        # Brightness score (penalty for extremes)
        brightness = analysis["brightness"]
        if self.quality_thresholds["brightness"][0] <= brightness <= self.quality_thresholds["brightness"][1]:
            brightness_score = 1.0
        else:
            brightness_score = 0.5
        scores.append(brightness_score * 0.15)  # 15% weight
        
        # Color harmony score
        scores.append(analysis["color_harmony"] * 0.2)  # 20% weight
        
        # Composition score
        scores.append(analysis["composition"] * 0.2)  # 20% weight
        
        return sum(scores)
    
    def _grade_quality(self, score: float) -> str:
        """Convert quality score to letter grade"""
        if score >= 0.9:
            return "A+"
        elif score >= 0.8:
            return "A"
        elif score >= 0.7:
            return "B+"
        elif score >= 0.6:
            return "B"
        elif score >= 0.5:
            return "C+"
        elif score >= 0.4:
            return "C"
        else:
            return "D"
    
    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        if analysis["sharpness"] < self.quality_thresholds["sharpness"]:
            recommendations.append("Increase inference steps for sharper details")
        
        if analysis["contrast"] < self.quality_thresholds["contrast"]:
            recommendations.append("Enhance contrast in prompt or post-processing")
        
        if analysis["brightness"] < self.quality_thresholds["brightness"][0]:
            recommendations.append("Image too dark - adjust lighting in prompt")
        elif analysis["brightness"] > self.quality_thresholds["brightness"][1]:
            recommendations.append("Image too bright - reduce exposure in prompt")
        
        if analysis["color_harmony"] < self.quality_thresholds["color_harmony"]:
            recommendations.append("Improve color harmony with better palette specification")
        
        if analysis["composition"] < self.quality_thresholds["composition"]:
            recommendations.append("Enhance composition with rule of thirds guidance")
        
        if analysis["noise_level"] > 10:
            recommendations.append("Reduce noise by increasing guidance scale")
        
        if not recommendations:
            recommendations.append("Quality looks good! Consider minor refinements.")
        
        return recommendations

# Utility function for easy integration
def analyze_generated_image(image_url: str) -> Dict[str, Any]:
    """Quick image analysis function"""
    analyzer = ImageQualityAnalyzer()
    return analyzer.analyze_image_url(image_url)