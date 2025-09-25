from typing import List

def build_bg_prompt(title: str, city: str, genre: str|None, mood: str, palette: List[str]) -> str:
    # For future text->image background (FLUX.1-dev). Not used in this MVP.
    return (
        f"Concert poster background ({genre or 'music'}) in {city}, {mood} mood, "
        f"palette {', '.join(palette)}. High-contrast areas for typography. "
        f"Cinematic lighting and depth. No text. No logos."
    )

def build_harmonize_prompt(city: str|None, mood: str|None) -> str:
    return (
        f"Blend inserted artist cutouts into the scene; match lighting and color temperature; "
        f"add soft realistic shadows; preserve facial detail; avoid adding any text or logos; "
        f"maintain background coherence; mood {mood or 'neon'} inspired by {city or 'nightlife'}."
    )
