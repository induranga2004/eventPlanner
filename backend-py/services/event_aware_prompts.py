"""
Event-aware prompt building for AI poster generation
Uses real event planning data to create more accurate prompts
"""

def build_event_aware_bg_prompt(event_context: dict) -> str:
    """
    Build AI background prompt enriched with actual event details
    """
    event_name = event_context.get('event_name', 'Live Event')
    city = extract_city(event_context.get('venue', 'Colombo'))
    genre = event_context.get('genre', 'live music')
    mood = event_context.get('mood', 'neon')
    
    # Determine venue emphasis
    venue_budget_percent = get_venue_budget_percent(event_context)
    venue_emphasis = "premium luxury venue" if venue_budget_percent > 40 else "intimate performance space"
    
    # Get lighting tier from provider
    lighting_tier = get_provider_tier(event_context, 'lighting')
    
    mood_descriptions = {
        'neon': 'vibrant neon colors, dynamic energy, modern futuristic aesthetics',
        'retro': 'vintage 80s style, nostalgic atmosphere, retro color gradients',
        'minimal': 'clean minimalist design, elegant simplicity, sophisticated palette',
        'lush': 'rich luxurious textures, premium materials, opulent atmosphere'
    }
    
    lighting_descriptions = {
        'professional': 'professional concert lighting, dramatic spotlights',
        'premium': 'state-of-the-art lighting design, cinematic quality',
        'standard': 'quality stage lighting',
        'basic': 'atmospheric lighting'
    }
    
    prompt = f"""
    Professional event poster for {event_name} in {city}
    Musical genre: {genre}
    Venue style: {venue_emphasis}
    Lighting: {lighting_descriptions.get(lighting_tier, 'professional concert lighting')}
    Mood: {mood_descriptions.get(mood, mood)}
    High quality, professional design, eye-catching, promotional poster aesthetic
    Cinematic composition, dramatic lighting, vibrant colors
    """
    
    return prompt.strip()

def build_event_aware_harmonize_prompt(event_context: dict) -> str:
    """
    Build harmonization prompt using event context
    """
    city = extract_city(event_context.get('venue', 'Colombo'))
    mood = event_context.get('mood', 'neon')
    genre = event_context.get('genre', 'live music')
    
    palette = event_context.get('palette', ['#5B99C2', '#F9DBBA'])
    
    prompt = f"""
    Harmonize this event poster composition
    Location: {city}, Sri Lanka
    Genre: {genre}
    Mood: {mood}
    Color palette: {', '.join(palette)}
    Blend the performers seamlessly into the background
    Maintain professional poster aesthetics
    Create cohesive visual unity
    High quality, cinematic lighting, natural integration
    """
    
    return prompt.strip()

def extract_city(venue_string: str) -> str:
    """Extract city name from venue string"""
    import re
    cities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Anuradhapura', 
              'Trincomalee', 'Batticaloa', 'Matara', 'Kurunegala']
    
    for city in cities:
        if re.search(city, venue_string, re.IGNORECASE):
            return city
    
    return 'Colombo'

def get_venue_budget_percent(event_context: dict) -> float:
    """Calculate venue budget percentage"""
    concept = event_context.get('selectedConcept', {})
    costs = concept.get('costs', [])
    total = concept.get('total_lkr', 1)
    
    venue_cost = next((c['amount_lkr'] for c in costs if c['category'] == 'venue'), 0)
    
    return (venue_cost / total) * 100 if total > 0 else 0

def get_provider_tier(event_context: dict, category: str) -> str:
    """Determine provider tier from selection"""
    selections = event_context.get('selections', {})
    provider = selections.get(category)
    
    if not provider:
        return 'standard'
    
    # Check if provider has rate info
    rate = provider.get('standard_rate_lkr', 0) if isinstance(provider, dict) else 0
    
    if rate > 100000:
        return 'premium'
    elif rate > 50000:
        return 'professional'
    elif rate > 0:
        return 'standard'
    else:
        return 'basic'

def infer_genre_from_musicians(musicians: list) -> str:
    """Infer primary genre from musician list"""
    if not musicians:
        return 'live_music'
    
    all_genres = []
    for musician in musicians:
        if isinstance(musician, dict):
            genres = musician.get('genres', [])
            if isinstance(genres, list):
                all_genres.extend(genres)
            elif isinstance(genres, str):
                all_genres.extend([g.strip() for g in genres.split(',')])
    
    if not all_genres:
        return 'live_music'
    
    # Count occurrences
    genre_counts = {}
    for genre in all_genres:
        genre_counts[genre] = genre_counts.get(genre, 0) + 1
    
    # Return most common
    return max(genre_counts, key=genre_counts.get).lower()
