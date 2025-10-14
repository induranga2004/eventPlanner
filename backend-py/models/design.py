from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Tuple, Dict
from uuid import uuid4

SizeT = Literal["square", "story"]
BBox = Tuple[int, int, int, int]  # x, y, w, h

class Event(BaseModel):
    title: str
    city: str
    date: str      # ISO YYYY-MM-DD
    audience: str
    genre: Optional[str] = None

class Artist(BaseModel):
    id: str
    name: str
    cutout_url: str  # Cloudinary PNG with alpha

class StylePrefs(BaseModel):
    mood: Optional[Literal["neon", "retro", "minimal", "lush"]] = "neon"
    palette: Optional[List[str]] = ["#9D00FF", "#00FFD1"]
    sizes: Optional[List[SizeT]] = ["square"]

class StartDesignRequest(BaseModel):
    campaign_id: str
    event: Event
    artists: List[Artist]
    style_prefs: Optional[StylePrefs] = StylePrefs()

class Shadow(BaseModel):
    blur: int = 12
    dx: int = 0
    dy: int = 4
    alpha: float = 0.5

class Bounds(BaseModel):
    x: int
    y: int
    w: int
    h: int

class TextItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    kind: Literal["title", "subtitle", "cta"] = "title"
    text: str
    font: Literal["BebasNeue", "Anton", "InterBlack"] = "BebasNeue"
    weight: int = 700
    letterSpacing: float = 0.02
    lineHeight: float = 1.0
    fill: str = "#FFFFFF"
    stroke: Optional[str] = None
    shadow: Shadow = Shadow()
    bounds: Bounds
    lock: bool = False

class TextOverlay(BaseModel):
    canvas: Dict[str, int]  # {w, h}
    text_items: List[TextItem]

class CutoutAsset(BaseModel):
    artist_id: str
    url: str
    bbox: BBox
    z: int = 3
    visible: bool = True

class Variant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    size: SizeT
    layers: Dict[str, Optional[str]]       # l1_background_url, l2_composite_url
    assets: Dict[str, List[CutoutAsset]]   # {"cutouts": [...]}
    l3_text_overlay: TextOverlay
    meta: Dict[str, Optional[str]]

class StartDesignResponse(BaseModel):
    render_id: str
    campaign_id: str
    variants: List[Variant]

class HarmonizeCutout(BaseModel):
    artist_id: str
    url: str
    visible: bool
    bbox: BBox
    z: int

class HarmonizeRequest(BaseModel):
    render_id: str
    campaign_id: Optional[str] = "demo"  # if you don’t want to persist manifest yet
    size: SizeT
    bg_url: str
    selected_cutouts: List[HarmonizeCutout]
    seed_harmonize: Optional[int] = None

class HarmonizeResponse(BaseModel):
    render_id: str
    size: SizeT
    l2_composite_url: str
    meta: Dict[str, str]

class ExportRequest(BaseModel):
    render_id: str
    campaign_id: str
    size: SizeT
    include_text: bool = True
    l3_text_overlay: TextOverlay

class ExportResponse(BaseModel):
    final_flattened_url: str
    download_url: str

class BatchGenerationRequest(BaseModel):
    campaign_id: str
    event: Event
    artists: List[Artist]
    style_variations: List[StylePrefs]  # Multiple style variations
    batch_size: Optional[int] = 3

class BatchGenerationResponse(BaseModel):
    batch_id: str
    campaign_id: str
    results: List[StartDesignResponse]
    processing_time: float
