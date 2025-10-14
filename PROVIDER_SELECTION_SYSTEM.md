# 🎯 Provider Selection System - Complete Guide

## Overview

This system fetches **real venue, music, lighting, and sound providers** from your MongoDB `users` collection based on their `role` field. Users can:
- Filter by **city**, **budget**, **capacity**, and more
- Select **multiple musicians** (solo artists + bands)
- View detailed provider information (rates, services, contact info)
- Navigate step-by-step through provider selection

---

## 📊 MongoDB Schema Reference

### Venue Provider (role='venue')
```json
{
  "_id": {"$oid": "68ed78a2dc4bf0126fd5f39d"},
  "email": "hambantota.marina@venues.lk",
  "role": "venue",
  "name": "Hambantota Marina Event Deck",
  "venueAddress": "Magampura Port Access Road, Hambantota",
  "capacity": 340,
  "standardRate": 75000,
  "phone": "+94 781234567",
  "subscriptionPlan": "free",
  "createdAt": {"$date": {"$numberLong": "1760393378891"}}
}
```

### Solo Musician (role='musician')
```json
{
  "_id": {"$oid": "..."},
  "role": "musician",
  "name": "John Doe",
  "genres": ["Rock", "Blues", "Jazz"],
  "experience": "10 years professional performer",
  "standardRate": 50000,
  "spotifyLink": "https://spotify.com/artist/...",
  "instagramLink": "https://instagram.com/johndoe",
  "phone": "+94 77 123 4567"
}
```

### Music Band (role='music_band')
```json
{
  "_id": {"$oid": "..."},
  "role": "music_band",
  "bandName": "The Jazz Collective",
  "genres": ["Jazz", "Fusion", "Latin"],
  "members": 5,
  "experience": "15+ years touring internationally",
  "standardRate": 150000,
  "youtubeLink": "https://youtube.com/@jazzcolletive",
  "instagramLink": "https://instagram.com/jazzcolletive",
  "contact": "+94 77 999 8888"
}
```

### Lighting Designer (role='lights')
```json
{
  "_id": {"$oid": "..."},
  "role": "lights",
  "name": "Studio X Lighting",
  "companyName": "Studio X Pvt Ltd",
  "address": "Colombo 03",
  "services": ["Stage Lighting", "LED Walls", "Special Effects"],
  "crewSize": 8,
  "standardRate": 45000,
  "website": "https://studioxlighting.lk",
  "contact": "+94 11 234 5678"
}
```

### Sound Engineer (role='sounds')
```json
{
  "_id": {"$oid": "..."},
  "role": "sounds",
  "companyName": "ProSound Inc",
  "name": "ProSound Engineering Team",
  "services": ["Live Sound", "Recording", "Equipment Rental"],
  "crewSize": 6,
  "standardRate": 60000,
  "website": "https://prosound.lk",
  "contact": "+94 11 555 7777"
}
```

---

## 🔌 Backend API Endpoints

### Base URL
```
http://localhost:1800/planner/providers
```

### 1. GET /venue
**Fetch venue providers from MongoDB**

**Query Parameters:**
- `city` (optional): Filter by city (e.g., 'Colombo', 'Hambantota')
- `min_capacity` (optional): Minimum guest capacity
- `max_budget_lkr` (optional): Maximum budget in LKR
- `limit` (default: 12): Max number of results

**Example Request:**
```bash
curl "http://localhost:1800/planner/providers/venue?city=Hambantota&min_capacity=200&max_budget_lkr=100000&limit=10"
```

**Response:**
```json
[
  {
    "id": "68ed78a2dc4bf0126fd5f39d",
    "name": "Hambantota Marina Event Deck",
    "address": "Magampura Port Access Road, Hambantota",
    "type": "venue",
    "capacity": 340,
    "avg_cost_lkr": 75000,
    "standard_rate_lkr": 75000,
    "rating": null,
    "website": null,
    "phone": "+94 781234567",
    "city": null,
    "min_lead_days": 0,
    "source": "mongo_users"
  }
]
```

---

### 2. GET /music
**Fetch music providers (BOTH solo musicians AND bands)**

**Query Parameters:**
- `city` (optional): Filter by city
- `genre` (optional): Filter by genre (e.g., 'Rock', 'Jazz', 'Pop')
- `max_budget_lkr` (optional): Maximum budget per performer
- `limit` (default: 12): Max number of results

**Important:** Returns **combined list** of solo musicians and bands. Frontend can **multi-select** musicians!

**Example Request:**
```bash
curl "http://localhost:1800/planner/providers/music?city=Colombo&genre=Jazz&max_budget_lkr=100000"
```

**Response:**
```json
[
  {
    "id": "...",
    "name": "John Doe",
    "genres": ["Rock", "Blues"],
    "experience": "10 years",
    "standard_rate_lkr": 50000,
    "spotify": "https://spotify.com/artist/...",
    "instagram": "https://instagram.com/johndoe",
    "website": null,
    "contact": "+94 77 123 4567",
    "source": "mongo_users",
    "provider_type": "solo"
  },
  {
    "id": "...",
    "name": "The Jazz Collective",
    "genres": ["Jazz", "Fusion"],
    "members": 5,
    "experience": "15+ years",
    "standard_rate_lkr": 150000,
    "youtube": "https://youtube.com/@jazzcolletive",
    "instagram": "https://instagram.com/jazzcolletive",
    "website": null,
    "contact": "+94 77 999 8888",
    "source": "mongo_users",
    "provider_type": "band"
  }
]
```

**Key Field:** `provider_type` → `"solo"` or `"band"`

---

### 3. GET /lighting
**Fetch lighting designer providers**

**Query Parameters:**
- `city` (optional): Filter by city
- `max_budget_lkr` (optional): Maximum budget
- `min_crew_size` (optional): Minimum crew size
- `limit` (default: 12): Max number of results

**Example Request:**
```bash
curl "http://localhost:1800/planner/providers/lighting?city=Colombo&max_budget_lkr=50000&min_crew_size=5"
```

**Response:**
```json
[
  {
    "id": null,
    "name": "Studio X Lighting",
    "address": "Colombo 03",
    "services": ["Stage Lighting", "LED Walls", "Special Effects"],
    "crew_size": 8,
    "standard_rate_lkr": 45000,
    "website": "https://studioxlighting.lk",
    "contact": "+94 11 234 5678",
    "source": "mongo_users"
  }
]
```

---

### 4. GET /sound
**Fetch sound engineer providers**

**Query Parameters:**
- `city` (optional): Filter by city
- `max_budget_lkr` (optional): Maximum budget
- `min_crew_size` (optional): Minimum crew size
- `limit` (default: 12): Max number of results

**Example Request:**
```bash
curl "http://localhost:1800/planner/providers/sound?city=Colombo&max_budget_lkr=70000"
```

**Response:**
```json
[
  {
    "id": null,
    "name": "ProSound Inc",
    "services": ["Live Sound", "Recording", "Equipment Rental"],
    "crew_size": 6,
    "standard_rate_lkr": 60000,
    "website": "https://prosound.lk",
    "contact": "+94 11 555 7777",
    "source": "mongo_users"
  }
]
```

---

## 🎨 Frontend Integration

### 1. ProviderSelectionModal Component

**Location:** `frontend/src/pages/InteractivePlannerResults.jsx`

**Props:**
```jsx
<ProviderSelectionModal
  open={boolean}                      // Is modal visible?
  onClose={() => void}                // Close handler
  concept={object}                    // Selected concept (with costs)
  campaignCity={string}               // City filter (e.g., "Colombo")
  budgetPerCategory={{                // Budget per category
    venue: 400000,
    music: 350000,
    lighting: 150000,
    sound: 100000
  }}
/>
```

**Features:**
- ✅ **4-tab interface** (Venue → Music → Lighting → Sound)
- ✅ **Auto-fetches providers** when tab changes
- ✅ **Budget filtering** using `budgetPerCategory` prop
- ✅ **Multi-select for music** (can choose multiple musicians/bands)
- ✅ **Single-select for venue/lighting/sound**
- ✅ **Loading state** during API calls
- ✅ **Empty state** when no providers found
- ✅ **Next/Previous navigation** between tabs
- ✅ **Confirm button** logs final selections

---

### 2. Fetching Provider Data

**Example Code (from modal):**
```javascript
const fetchProviders = async (category) => {
  setLoading(true);
  try {
    const budget = budgetPerCategory[category] || 100000;
    const params = new URLSearchParams({
      limit: '12',
    });

    if (campaignCity) params.append('city', campaignCity);
    if (budget) params.append('max_budget_lkr', budget.toString());

    const response = await fetch(
      `http://localhost:1800/planner/providers/${category}?${params.toString()}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch providers');
    
    const data = await response.json();
    setProviders(prev => ({ ...prev, [category]: data }));
  } catch (error) {
    console.error(`Error fetching ${category} providers:`, error);
  } finally {
    setLoading(false);
  }
};
```

---

### 3. Multi-Select Logic (Music Only)

**State:**
```javascript
const [selections, setSelections] = useState({
  venue: null,           // Single selection (string or null)
  music: [],             // Multi-select (array of strings)
  lighting: null,        // Single selection
  sound: null,           // Single selection
});
```

**Select Handler:**
```javascript
const handleSelect = (category, providerId) => {
  setSelections(prev => ({
    ...prev,
    [category]: category === 'music' 
      ? (prev[category].includes(providerId)
          ? prev[category].filter(p => p !== providerId)  // Remove if already selected
          : [...prev[category], providerId])              // Add to array
      : providerId  // Single select (overwrite)
  }));
};
```

**Check if Selected:**
```javascript
const isSelected = (category, providerId) => {
  if (category === 'music') {
    return selections[category].includes(providerId);
  }
  return selections[category] === providerId;
};
```

---

## 🎯 User Flow

### Step-by-Step Experience

1. **User generates 4 concepts** with different budget distributions
2. **User clicks a concept card** → Modal opens
3. **Tab 1: Venue Selection**
   - API fetches venues filtered by city + venue budget
   - User clicks one venue → Checkmark appears
4. **Click "Next: Music"** → Tab 2 opens
5. **Tab 2: Music Selection**
   - API fetches solo musicians + bands filtered by city + music budget
   - User can select **multiple** musicians (e.g., 1 band + 2 solo artists)
   - Each selection toggles checkmark
6. **Click "Next: Lighting"** → Tab 3 opens
7. **Tab 3: Lighting Selection**
   - API fetches lighting designers filtered by city + lighting budget
   - User clicks one provider → Checkmark appears
8. **Click "Next: Sound"** → Tab 4 opens
9. **Tab 4: Sound Selection**
   - API fetches sound engineers filtered by city + sound budget
   - User clicks one provider → Checkmark appears
10. **Click "Confirm Selection"**
    - Console logs final selections
    - Modal closes

---

## 📋 Provider Card UI Details

### Venue Card
```jsx
📍 Hambantota Marina Event Deck
   Magampura Port Access Road, Hambantota
👥 Capacity: 340 guests
💰 LKR 75,000
📞 +94 781234567
```

### Music Card (Solo)
```jsx
🎤 John Doe
   [Solo Musician]
🎵 Rock, Blues, Jazz
💰 LKR 50,000
📞 +94 77 123 4567
🔗 Website | Spotify | Instagram
```

### Music Card (Band)
```jsx
🎸 The Jazz Collective
   [Band]
🎵 Jazz, Fusion, Latin
👥 5 members
💰 LKR 150,000
📞 +94 77 999 8888
🔗 YouTube | Instagram
```

### Lighting Card
```jsx
💡 Studio X Lighting
🎨 Stage Lighting, LED Walls, Special Effects
👥 Crew size: 8
💰 LKR 45,000
📞 +94 11 234 5678
🔗 Website
```

### Sound Card
```jsx
🔊 ProSound Inc
🔊 Live Sound, Recording, Equipment Rental
👥 Crew size: 6
💰 LKR 60,000
📞 +94 11 555 7777
🔗 Website
```

---

## 🔍 Filtering Logic

### City Filter
```python
# Backend (provider_repository.py)
def _city_regex(city: str) -> re.Pattern:
    return re.compile(re.escape(city), re.IGNORECASE)

query["$or"] = [
    {"city": regex},
    {"venueAddress": regex},
    {"address": regex},
    {"companyAddress": regex},
    {"base_city": regex}
]
```

**Searches multiple fields** to catch variations:
- `city: "Colombo"`
- `venueAddress: "123 Main St, Colombo"`
- `address: "Colombo 03"`

---

### Budget Filter
```python
# Backend (providers.py)
if max_budget_lkr:
    venues = [
        v for v in venues 
        if (v.get("avg_cost_lkr") or v.get("standard_rate_lkr") or 0) <= max_budget_lkr
    ]
```

**Checks both** `avg_cost_lkr` and `standard_rate_lkr` (fallback).

---

### Genre Filter (Music Only)
```python
if genre:
    genre_lower = genre.lower()
    all_music = [
        m for m in all_music
        if m.get("genres") and any(
            genre_lower in (g or "").lower() 
            for g in (m.get("genres") if isinstance(m.get("genres"), list) else [m.get("genres")])
        )
    ]
```

**Case-insensitive partial match**:
- User searches "Jazz" → Matches "Jazz", "jazz", "Jazz Fusion", "Latin Jazz"

---

## 🐛 Troubleshooting

### Issue: No providers appear
**Cause:** No users in MongoDB with matching role  
**Fix:** Register test users via frontend signup with correct roles:
- Role: `venue` → Creates venue provider
- Role: `musician` → Creates solo musician
- Role: `music_band` → Creates band
- Role: `lights` → Creates lighting designer
- Role: `sounds` → Creates sound engineer

### Issue: Budget filter too restrictive
**Cause:** `max_budget_lkr` set too low  
**Fix:** Increase budget or remove filter:
```javascript
// Don't pass max_budget_lkr if you want all results
const params = new URLSearchParams({ limit: '12' });
if (campaignCity) params.append('city', campaignCity);
// params.append('max_budget_lkr', budget.toString()); // REMOVE THIS LINE
```

### Issue: "Failed to fetch providers" error
**Cause:** Backend not running or CORS issue  
**Fix:**
1. Start backend: `uvicorn main:app --reload --port 1800`
2. Check CORS in `main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Allow all origins
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## ✅ Testing Checklist

### Backend Tests
```bash
# Test venue endpoint
curl "http://localhost:1800/planner/providers/venue?city=Hambantota&limit=5"

# Test music endpoint
curl "http://localhost:1800/planner/providers/music?genre=Jazz&limit=5"

# Test lighting endpoint
curl "http://localhost:1800/planner/providers/lighting?city=Colombo&limit=5"

# Test sound endpoint
curl "http://localhost:1800/planner/providers/sound?limit=5"
```

### Frontend Tests
1. ✅ Open planner → Generate concepts
2. ✅ Click concept card → Modal opens
3. ✅ Venue tab shows real venues from MongoDB
4. ✅ Click venue → Checkmark appears
5. ✅ Click "Next: Music" → Music tab loads
6. ✅ Select multiple musicians → All checkmarks appear
7. ✅ Click "Next: Lighting" → Lighting tab loads
8. ✅ Select lighting designer → Checkmark appears
9. ✅ Click "Next: Sound" → Sound tab loads
10. ✅ Select sound engineer → Checkmark appears
11. ✅ Click "Confirm Selection" → Console logs all selections

---

## 📊 Sample Console Output

```javascript
// When user clicks "Confirm Selection"
Final selections: {
  venue: "68ed78a2dc4bf0126fd5f39d",
  music: ["musician-id-1", "band-id-2", "musician-id-3"],
  lighting: "lighting-id-1",
  sound: "sound-id-1"
}

Selected providers: {
  venue: {
    name: "Hambantota Marina Event Deck",
    capacity: 340,
    standard_rate_lkr: 75000
  },
  music: [
    {
      name: "John Doe",
      provider_type: "solo",
      standard_rate_lkr: 50000
    },
    {
      name: "The Jazz Collective",
      provider_type: "band",
      standard_rate_lkr: 150000
    }
  ],
  lighting: {
    name: "Studio X Lighting",
    crew_size: 8,
    standard_rate_lkr: 45000
  },
  sound: {
    name: "ProSound Inc",
    crew_size: 6,
    standard_rate_lkr: 60000
  }
}
```

---

## 🚀 Next Steps

1. **Save Selections to Database**
   - Create endpoint: `POST /campaigns/{id}/planner/save-providers`
   - Store selected provider IDs in SQLite `event_plans` table
   - Add `providers` JSON column to store selections

2. **Add Provider Availability Check**
   - Query provider's calendar
   - Show "Available" / "Booked" badges
   - Filter out unavailable providers

3. **Implement Budget Warnings**
   - Calculate total cost of selections
   - Show warning if exceeds category budget
   - Suggest cheaper alternatives

4. **Add Provider Reviews/Ratings**
   - Fetch from MongoDB `reviews` collection
   - Display star ratings + review count
   - Sort by rating (highest first)

---

## 📚 Related Files

**Backend:**
- `backend-py/routers/providers.py` - Provider endpoints
- `backend-py/utils/provider_repository.py` - MongoDB query logic
- `backend-py/main.py` - Router registration

**Frontend:**
- `frontend/src/pages/InteractivePlannerResults.jsx` - Modal component
- `frontend/src/App.jsx` - Router integration

**Documentation:**
- `INTERACTIVE_PLANNER_REDESIGN.md` - Full redesign guide
- `REDESIGN_COMPLETE_SUMMARY.md` - Feature summary

---

**Status:** ✅ **Complete and functional!**  
**Next:** Save provider selections to database + implement availability check.
