/**
 * Extract city name from venue string
 */
export function extractCityFromVenue(venueString) {
  if (!venueString) return 'Colombo';
  
  // Common patterns: "City Convention Center", "Venue Name, City"
  const cityPattern = /(Colombo|Kandy|Galle|Negombo|Jaffna|Anuradhapura|Trincomalee|Batticaloa|Matara|Kurunegala)/i;
  const match = venueString.match(cityPattern);
  
  if (match) {
    return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  }
  
  // Default
  return 'Colombo';
}

/**
 * Infer audience type from attendee count
 */
export function inferAudienceType(attendees) {
  if (attendees > 500) return 'mass_public';
  if (attendees > 100) return 'general';
  return 'intimate';
}

/**
 * Infer music genre from musicians data
 */
export function inferGenreFromMusicians(musicians) {
  if (!musicians || musicians.length === 0) return 'live_music';
  
  // Collect all genres
  const allGenres = [];
  musicians.forEach(musician => {
    if (musician.genres) {
      if (Array.isArray(musician.genres)) {
        allGenres.push(...musician.genres);
      } else if (typeof musician.genres === 'string') {
        allGenres.push(...musician.genres.split(',').map(g => g.trim()));
      }
    }
  });
  
  if (allGenres.length === 0) return 'live_music';
  
  // Find most common genre
  const genreCounts = {};
  allGenres.forEach(genre => {
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1]);
  
  return sortedGenres[0][0].toLowerCase();
}

/**
 * Infer mood from budget concept
 */
export function inferMoodFromBudget(concept) {
  if (!concept || !concept.costs) return 'neon';
  
  const venueCost = concept.costs.find(c => c.category === 'venue');
  const musicCost = concept.costs.find(c => c.category === 'music');
  
  const venuePercent = venueCost ? (venueCost.amount_lkr / concept.total_lkr) * 100 : 0;
  const musicPercent = musicCost ? (musicCost.amount_lkr / concept.total_lkr) * 100 : 0;
  
  // High venue budget = premium/lush
  if (venuePercent > 40) return 'lush';
  
  // High music budget = energetic/neon
  if (musicPercent > 40) return 'neon';
  
  // Balanced = minimal/clean
  return 'minimal';
}

/**
 * Generate color palette from genre
 */
export function generatePaletteFromGenre(genre) {
  const palettes = {
    'rock': ['#FF0000', '#000000'],
    'metal': ['#FF0000', '#1A1A1A'],
    'jazz': ['#FFD700', '#1F316F'],
    'blues': ['#4169E1', '#000080'],
    'soul': ['#9D00FF', '#FFD700'],
    'funk': ['#FF6B35', '#F7931E'],
    'electronic': ['#00FFD1', '#9D00FF'],
    'edm': ['#FF00FF', '#00FFFF'],
    'pop': ['#FF69B4', '#5B99C2'],
    'indie': ['#F9DBBA', '#5B99C2'],
    'classical': ['#FFFFFF', '#8B4513'],
    'folk': ['#8B4513', '#F9DBBA'],
    'reggae': ['#FFD700', '#228B22'],
    'hip_hop': ['#000000', '#FFD700'],
    'r&b': ['#9D00FF', '#FF69B4'],
    'country': ['#8B4513', '#F9DBBA'],
    'live_music': ['#5B99C2', '#F9DBBA'],
    'default': ['#5B99C2', '#1F316F']
  };
  
  const normalizedGenre = genre.toLowerCase().replace(/[^a-z]/g, '_');
  return palettes[normalizedGenre] || palettes['default'];
}

/**
 * Generate placeholder cutout URL
 */
export function generatePlaceholderCutout(name) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=600&background=1A4870&color=F9DBBA&bold=true&format=png`;
}

/**
 * Format date for artistic display
 */
export function formatDateArtistic(dateString) {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Find most common item in array
 */
function findMostCommon(arr) {
  if (arr.length === 0) return null;
  
  const counts = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

/**
 * Main mapper: Event Planning Context → AI Design Payload
 */
export function mapEventContextToAIPayload(eventContext) {
  const city = extractCityFromVenue(eventContext.venue || eventContext.event?.venue);
  const inferredGenre = inferGenreFromMusicians(eventContext.selections?.music || []);
  const inferredMood = inferMoodFromBudget(eventContext.selectedConcept);
  
  return {
    campaign_id: eventContext.campaign_id,
    
    event: {
      title: eventContext.event_name || eventContext.event?.name,
      city: city,
      date: eventContext.event_date || eventContext.event?.date,
      audience: inferAudienceType(eventContext.attendees_estimate || eventContext.event?.attendees),
      genre: inferredGenre
    },
    
    artists: (eventContext.selections?.music || []).map((musician, idx) => ({
      id: musician.id || musician.name || `musician-${idx}`,
      name: musician.name || `Artist ${idx + 1}`,
      cutout_url: musician.profilePhoto || musician.photo || generatePlaceholderCutout(musician.name || `Artist ${idx + 1}`)
    })),
    
    style_prefs: {
      mood: inferredMood,
      palette: generatePaletteFromGenre(inferredGenre),
      sizes: ['square']
    },
    
    // Store metadata for reference
    metadata: {
      venue: eventContext.selections?.venue || null,
      lighting: eventContext.selections?.lighting || null,
      sound: eventContext.selections?.sound || null,
      budget: eventContext.total_budget_lkr || eventContext.selectedConcept?.total_lkr,
      concept: eventContext.selectedConcept
    }
  };
}

/**
 * Generate smart query from event context
 */
export function generateSmartQuery(eventContext) {
  const city = extractCityFromVenue(eventContext.venue || '');
  const eventName = eventContext.event_name || 'Live Musical Event';
  
  const musicians = eventContext.selections?.music || [];
  const genres = [];
  
  musicians.forEach(m => {
    if (m.genres) {
      if (Array.isArray(m.genres)) {
        genres.push(...m.genres);
      } else if (typeof m.genres === 'string') {
        genres.push(...m.genres.split(',').map(g => g.trim()));
      }
    }
  });
  
  const primaryGenre = findMostCommon(genres) || 'live music';
  const leadArtist = musicians[0]?.name || 'live performers';
  
  const mood = inferMoodFromBudget(eventContext.selectedConcept);
  const moodDescriptions = {
    'lush': 'sophisticated venue showcase with premium atmosphere',
    'neon': 'high-energy musical performance with dynamic lighting',
    'minimal': 'elegant and modern event design',
    'retro': 'vintage-inspired musical celebration'
  };
  
  const dateStr = eventContext.event_date ? formatDateArtistic(eventContext.event_date) : '';
  
  return `${eventName} - ${primaryGenre} event in ${city} ${dateStr ? 'on ' + dateStr : ''}, featuring ${leadArtist}, with ${moodDescriptions[mood] || 'professional production'}, professional lighting and sound system`.trim();
}
