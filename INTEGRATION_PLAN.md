# 🎯 Event Planner → AI Post Generator Integration Plan

## Overview
Connect the **Event Planning System** with the **AI Post Generator** so that after users select venues, musicians, lighting, and sound providers, they can seamlessly move to creating promotional posters with AI-generated designs using all their event data.

---

## 📊 Current State Analysis

### Event Planning System (Existing)
**Flow:** `PlannerWizard` → `InteractivePlannerResults` → Provider Selection Modal

**Data Captured:**
- **From PlannerWizard:**
  - `campaign_id` (UUID)
  - `event_name` (string)
  - `venue` (string/city)
  - `event_date` (date)
  - `attendees_estimate` (number)
  - `total_budget_lkr` (number)
  - `number_of_concepts` (1-4)

- **From InteractivePlannerResults (Provider Selection):**
  - `selectedConcept` (budget concept with splits)
  - `selections.venue` (venue provider ID)
  - `selections.music[]` (array of musician/band IDs)
  - `selections.lighting` (lighting provider ID)
  - `selections.sound` (sound provider ID)
  - Full provider objects with names, contact, rates, genres, etc.

**Storage:** Currently in React state only (lost on page refresh)

### AI Post Generator System (Feature/ai-post-generator)
**Flow:** `Home` → `Wizard` (5 steps) → `Editor` (advanced editing)

**Data Required:**
- `campaign_id`
- `event` object:
  - `title` (event name)
  - `city` (location)
  - `date` (YYYY-MM-DD)
  - `audience` (general/specific)
  - `genre` (music genre)
- `artists[]` array:
  - `id`, `name`, `cutout_url` (PNG with alpha/transparent background)
- `style_prefs`:
  - `mood` (neon/retro/minimal/lush)
  - `palette[]` (hex colors)
  - `sizes[]` (square/story)

**Current Issue:** Wizard starts from scratch, manually entering data

---

## 🔗 Integration Strategy

### Phase 1: Data Bridge Layer
**Create Event Context Management System**

#### 1.1 Backend: New Context Storage Endpoint
**File:** `backend-py/routers/event_context.py` (NEW)
```python
# Store complete event planning data for AI post generation
POST /api/event-context/save
- campaign_id
- event_details (name, date, venue city, attendees)
- selected_concept (budget, splits)
- selected_providers (venue, musicians, lighting, sound)
- timestamp

GET /api/event-context/{campaign_id}
- Retrieve stored context for AI poster generation
```

#### 1.2 Frontend: Context Provider
**File:** `frontend/src/contexts/EventPlanningContext.jsx` (NEW)
```jsx
// React Context to share event planning data across app
- Wraps entire app in main.jsx
- Provides: eventData, saveEventData, clearEventData
- Persists to localStorage for session recovery
- Syncs with backend endpoint
```

#### 1.3 Modified Flow in InteractivePlannerResults
**File:** `frontend/src/pages/InteractivePlannerResults.jsx`
```jsx
// When user clicks "Confirm Selection" in ProviderSelectionModal:

1. Gather all event data:
   - Event details (from parent state)
   - Selected concept
   - All provider selections

2. Save to EventPlanningContext

3. POST to /api/event-context/save (backend persistence)

4. Show success message with CTA button:
   "✅ Event Plan Complete! Create Your Promotional Poster →"

5. Button navigates to: /ai-poster-wizard
```

---

### Phase 2: AI Wizard Auto-Population

#### 2.1 New Pre-Filled Wizard Route
**File:** `frontend/src/pages/AIPosterWizard.jsx` (NEW - modified from Wizard.jsx)
```jsx
// Auto-detect if event context exists on mount

useEffect(() => {
  const eventContext = getEventContext(); // from Context or localStorage
  if (eventContext) {
    // Auto-fill all fields:
    - query: Generated from event data
    - intelligence: Pre-populated
    - event object: Mapped from event context
    - artists: Mapped from selected musicians
    - style_prefs: Inferred from event type/genre
    
    // Skip Step 1 (query input) and jump to Step 2 (background selection)
    setActiveStep(1);
    generateBackgroundsFromContext(eventContext);
  }
}, []);
```

#### 2.2 Data Mapping Logic
**File:** `frontend/src/utils/eventToAIMapper.js` (NEW)
```javascript
// Transform Event Planning data → AI Post Generator format

export function mapEventContextToAIPayload(eventContext) {
  return {
    campaign_id: eventContext.campaign_id,
    
    event: {
      title: eventContext.event_name,
      city: extractCityFromVenue(eventContext.venue),
      date: formatDate(eventContext.event_date), // YYYY-MM-DD
      audience: inferAudienceType(eventContext.attendees_estimate),
      genre: inferGenreFromMusicians(eventContext.selections.music)
    },
    
    artists: eventContext.selections.music.map(musician => ({
      id: musician.id || musician.name,
      name: musician.name,
      cutout_url: musician.photo || generatePlaceholderCutout(musician.name)
    })),
    
    style_prefs: {
      mood: inferMoodFromBudget(eventContext.selectedConcept),
      palette: generatePaletteFromGenre(inferredGenre),
      sizes: ['square'] // Default, user can change
    },
    
    // Store original context for reference
    metadata: {
      venue: eventContext.selections.venue,
      lighting: eventContext.selections.lighting,
      sound: eventContext.selections.sound,
      budget: eventContext.total_budget_lkr
    }
  };
}

// Helper functions
function extractCityFromVenue(venueString) {
  // Parse "Colombo Convention Center" → "Colombo"
  // Or use venue provider's city field if available
}

function inferAudienceType(attendees) {
  if (attendees > 500) return 'mass_public';
  if (attendees > 100) return 'general';
  return 'intimate';
}

function inferGenreFromMusicians(musicians) {
  // Analyze musicians' genres array
  // Return most common genre or 'mixed'
}

function inferMoodFromBudget(concept) {
  // High venue % → 'lush' (premium)
  // High music % → 'neon' (energetic)
  // Balanced → 'minimal'
}

function generatePaletteFromGenre(genre) {
  const palettes = {
    'Rock': ['#FF0000', '#000000'],
    'Jazz': ['#FFD700', '#1A1A1A'],
    'Electronic': ['#00FFD1', '#9D00FF'],
    'Classical': ['#FFFFFF', '#8B4513'],
    'Pop': ['#FF69B4', '#00CED1'],
    'default': ['#2563eb', '#7c3aed']
  };
  return palettes[genre] || palettes.default;
}

function generatePlaceholderCutout(name) {
  // Generate placeholder if no photo available
  // Could use initials or default silhouette
  return 'https://via.placeholder.com/400x600.png?text=' + encodeURIComponent(name);
}
```

---

### Phase 3: UI/UX Flow Enhancement

#### 3.1 New Button in InteractivePlannerResults
**Location:** After "Confirm Selection" success
```jsx
<Box sx={{ 
  position: 'fixed', 
  bottom: 32, 
  right: 32, 
  zIndex: 1000 
}}>
  <Fab
    variant="extended"
    color="secondary"
    size="large"
    onClick={navigateToAIPoster}
    sx={{
      background: 'linear-gradient(45deg, #9D00FF, #00FFD1)',
      px: 4,
      py: 2,
      fontSize: '1.1rem',
      boxShadow: '0px 8px 24px rgba(157,0,255,0.4)',
      '&:hover': {
        transform: 'scale(1.05)',
      }
    }}
  >
    <AutoAwesome sx={{ mr: 1 }} />
    Create Promotional Poster
  </Fab>
</Box>
```

#### 3.2 Breadcrumb Navigation
**File:** `frontend/src/components/EventFlowBreadcrumb.jsx` (NEW)
```jsx
// Show user's progress through the complete flow
<Breadcrumbs>
  <Chip label="1. Plan Event" color="success" icon={<Check />} />
  <Chip label="2. Select Providers" color="success" icon={<Check />} />
  <Chip label="3. Create Poster" color="primary" icon={<AutoAwesome />} />
</Breadcrumbs>
```

#### 3.3 Smart Query Generation
**File:** `frontend/src/utils/queryGenerator.js` (NEW)
```javascript
export function generateSmartQuery(eventContext) {
  const { event_name, venue, selections, selectedConcept } = eventContext;
  
  const genres = selections.music
    .map(m => m.genres)
    .flat()
    .filter(g => g);
    
  const primaryGenre = findMostCommon(genres) || 'live music';
  
  const mood = selectedConcept.costs.find(c => c.category === 'music')?.amount_lkr > 
               selectedConcept.costs.find(c => c.category === 'venue')?.amount_lkr
    ? 'high-energy musical performance'
    : 'sophisticated venue showcase';
  
  return `${event_name} - ${primaryGenre} event in ${extractCity(venue)} 
    with ${mood}, featuring ${selections.music[0]?.name || 'live performers'}, 
    professional lighting and sound production`.trim();
}
```

---

### Phase 4: Backend Integration Points

#### 4.1 Enhanced Design API
**File:** `backend-py/routers/design.py`
```python
# Add new endpoint for event-context-aware generation

@router.post("/start-from-event", response_model=StartDesignResponse)
def start_design_from_event_context(campaign_id: str):
    """
    Generate poster designs using stored event planning context
    Automatically retrieves event data and maps to AI payload
    """
    # Fetch event context from storage
    event_ctx = event_context_store.get(campaign_id)
    
    # Transform to design payload
    payload = transform_event_to_design(event_ctx)
    
    # Generate with enhanced prompts based on real event data
    return start_design(payload)
```

#### 4.2 Intelligent Prompt Enhancement
**File:** `backend-py/services/event_aware_prompts.py` (NEW)
```python
def build_event_aware_bg_prompt(event_context):
    """
    Build AI background prompts enriched with actual event details
    """
    venue_emphasis = "premium venue" if high_venue_budget(event_context) else "intimate setting"
    
    genre_style = map_genre_to_visual_style(event_context['genre'])
    
    lighting_tier = get_provider_tier(event_context['providers']['lighting'])
    
    prompt = f"""
    Professional event poster for {event_context['event_name']}
    Location: {event_context['city']}
    Style: {genre_style} with {venue_emphasis}
    Lighting quality: {lighting_tier}
    Mood: {event_context['mood']}
    Date: {format_date_artistic(event_context['date'])}
    """
    
    return prompt
```

---

### Phase 5: Artist Photo/Cutout Integration

#### 5.1 Musician Photo Upload
**Enhancement to:** `backend-node/src/models/Musician.js` & `MusicEnsemble.js`
```javascript
// Add new fields to MongoDB schemas:
{
  profilePhoto: String,  // Regular photo URL
  cutoutPhoto: String,   // Transparent background PNG URL
  photoCopyrightClear: Boolean,  // Legal clearance flag
  photoUploadDate: Date
}
```

#### 5.2 Photo Processing Service
**File:** `backend-py/services/photo_processor.py` (NEW)
```python
# Use rembg (already in requirements.txt) to remove backgrounds

from rembg import remove
from PIL import Image

def create_cutout_from_photo(photo_url: str) -> str:
    """
    Download musician photo
    Remove background using AI
    Upload to Cloudinary
    Return cutout_url
    """
    # Download
    img_bytes = requests.get(photo_url).content
    
    # Remove background
    cutout_bytes = remove(img_bytes)
    
    # Upload to Cloudinary
    cutout_url = upload_image_bytes(cutout_bytes, public_id=...)
    
    return cutout_url
```

#### 5.3 Fallback Strategy
```javascript
// If musician has no photo:
1. Check Google Drive artist library (existing /api/design/artists)
2. Use generic silhouette with name label
3. Skip artist layer and focus on event branding
```

---

## 📁 File Structure After Integration

```
frontend/src/
├── pages/
│   ├── PlannerWizard.jsx (exists)
│   ├── InteractivePlannerResults.jsx (modified - add poster CTA)
│   ├── AIPosterWizard.jsx (NEW - event-aware wizard)
│   ├── Editor.jsx (exists)
│   └── Wizard.jsx (keep for manual mode)
│
├── contexts/
│   └── EventPlanningContext.jsx (NEW)
│
├── utils/
│   ├── eventToAIMapper.js (NEW)
│   ├── queryGenerator.js (NEW)
│   └── cityExtractor.js (NEW)
│
└── components/
    └── EventFlowBreadcrumb.jsx (NEW)

backend-py/
├── routers/
│   ├── event_context.py (NEW)
│   └── design.py (modified - add start-from-event)
│
├── services/
│   ├── event_aware_prompts.py (NEW)
│   └── photo_processor.py (NEW)
│
└── models/
    └── event_context.py (NEW - Pydantic model)
```

---

## 🔄 Complete User Journey

### Step-by-Step Flow:

1. **User fills PlannerWizard** (event name, venue, date, budget, attendees)
   → Generates 4 budget concepts

2. **User selects concept** in InteractivePlannerResults
   → Opens Provider Selection Modal

3. **User selects providers:**
   - Tab 1: Venue (single select)
   - Tab 2: Musicians (multi-select with photos, genres, rates)
   - Tab 3: Lighting (single select)
   - Tab 4: Sound (single select)

4. **User clicks "Confirm Selection"**
   → Data saved to EventPlanningContext
   → POST to `/api/event-context/save`
   → Success message with CTA appears

5. **User clicks "Create Promotional Poster" button**
   → Navigate to `/ai-poster-wizard`
   → Auto-load event context
   → Auto-generate smart query
   → Auto-populate event fields
   → Fetch musician photos/cutouts
   → Call AI intelligence API with context
   → Jump directly to Step 2 (background selection)

6. **AI generates 3 background variations**
   → Enriched with real event data (genre, mood, venue tier)

7. **User selects background**
   → Canvas loads with background
   → Musician cutouts auto-positioned

8. **User edits in Creative Studio**
   → Drag/resize musicians
   → Add event text (name, date, venue auto-filled)
   → Apply colors matching event theme
   → Add lighting effects

9. **AI Optimization**
   → Analyzes composition
   → Suggests improvements

10. **Final Export**
    → High-res poster download
    → Option to create variations
    → Social media formats

---

## 🎨 Data Flow Diagram

```
[PlannerWizard] 
    ↓ (form data)
[generate_plans API]
    ↓ (concepts)
[InteractivePlannerResults]
    ↓ (user selects concept + providers)
[ProviderSelectionModal]
    ↓ (confirm selection)
[EventPlanningContext.saveEventData()]
    ↓
[localStorage + POST /api/event-context/save]
    ↓
[User clicks "Create Poster" CTA]
    ↓
[/ai-poster-wizard route]
    ↓
[AIPosterWizard.useEffect() - auto-load context]
    ↓
[eventToAIMapper.mapEventContextToAIPayload()]
    ↓
[POST /api/design/start-from-event]
    ↓ (with real event data)
[AI Background Generation]
    ↓
[Canvas Editor with pre-populated data]
    ↓
[Harmonize + Export]
    ↓
[Final Poster with Real Event Details]
```

---

## 🛠️ Technical Implementation Checklist

### Backend Tasks:
- [ ] Create `event_context.py` router (save/get endpoints)
- [ ] Create `EventContext` Pydantic model
- [ ] Add `start_design_from_event_context()` to design.py
- [ ] Create `event_aware_prompts.py` service
- [ ] Create `photo_processor.py` (background removal)
- [ ] Add musician photo fields to MongoDB schemas
- [ ] Test context persistence with SQLite/MongoDB

### Frontend Tasks:
- [ ] Create `EventPlanningContext.jsx` provider
- [ ] Create `eventToAIMapper.js` utility
- [ ] Create `queryGenerator.js` utility
- [ ] Create `AIPosterWizard.jsx` page (clone + enhance Wizard)
- [ ] Modify `InteractivePlannerResults.jsx` - add poster CTA
- [ ] Create `EventFlowBreadcrumb.jsx` component
- [ ] Add `/ai-poster-wizard` route to main.jsx
- [ ] Implement localStorage persistence
- [ ] Add musician photo upload UI (future)
- [ ] Test data flow end-to-end

### Integration Points:
- [ ] Map event city → AI city parameter
- [ ] Map musician genres → AI genre parameter
- [ ] Map budget splits → AI mood parameter
- [ ] Map musician photos → AI cutout_url array
- [ ] Handle missing data gracefully (fallbacks)
- [ ] Add loading states for context fetch
- [ ] Add error handling for failed AI generation

---

## 🚀 Rollout Strategy

### Phase 1 (MVP - Week 1):
- Basic context storage (localStorage only)
- Manual CTA button
- Simple data mapping
- Skip musician photos (use placeholders)

### Phase 2 (Enhanced - Week 2):
- Backend persistence endpoint
- Smart query generation
- Genre/mood inference
- Auto-navigation

### Phase 3 (Polish - Week 3):
- Musician photo integration
- Background removal AI
- Advanced prompt engineering
- Breadcrumb navigation

### Phase 4 (Future):
- Direct AI generation from results page
- Batch poster generation (multiple sizes)
- Brand consistency checker
- Template library based on event type

---

## 🎯 Success Metrics

- **User completes full flow** (plan → select → poster) without re-entering data
- **AI generates relevant backgrounds** based on actual event details
- **Musician photos appear automatically** in poster canvas
- **Generated query reflects event specifics** (genre, mood, location)
- **Zero manual data duplication** between systems

---

## ⚠️ Edge Cases to Handle

1. **User refreshes page** → Recover from localStorage
2. **Musician has no photo** → Use placeholder or silhouette
3. **Multiple musicians selected** → Smart layout algorithm
4. **Very long event name** → Text truncation in poster
5. **Non-English characters** → UTF-8 support in AI prompts
6. **User skips provider selection** → Allow poster creation anyway
7. **AI API fails** → Graceful fallback to gradient backgrounds
8. **Campaign ID mismatch** → Validation and error messages

---

## 📝 Notes

- Both systems remain functional independently (backward compatible)
- AI Wizard can still be used manually without event context
- Event Planner can still be used without creating posters
- Integration is **additive**, not destructive
- All existing routes and features preserved
- New features are **opt-in** via CTA button

---

**Priority:** Complete Phase 1 & 2 first (data bridge + auto-population)
**Estimated Effort:** 3-4 days for core integration
**Risk Level:** Low (isolated changes, no breaking modifications)
