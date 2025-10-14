# 🎨 Interactive Planner Redesign - Implementation Guide

## Overview
Transformed the planner from static concept cards into an interactive, multi-step event design experience with:
- ✅ **4 Unique Budget Distributions** (automatically varied)
- ✅ **AI-Powered Name Generator** (refresh button per concept)
- ✅ **Provider Selection Modal** (venue → music → lighting → sound)
- ✅ **Material-UI Theme Integration** (consistent with dashboard/profile)
- ✅ **Framer Motion Animations** (smooth transitions)

---

## ✨ New Features

### 1. Budget Variations (Backend)
Each concept now uses a different cost distribution strategy:

| Concept | Venue | Music | Lighting | Sound | Focus |
|---------|-------|-------|----------|-------|-------|
| #1      | 40%   | 35%   | 15%      | 10%   | **Venue-focused** |
| #2      | 30%   | 45%   | 15%      | 10%   | **Music-heavy** |
| #3      | 35%   | 30%   | 25%      | 10%   | **Lighting showcase** |
| #4      | 30%   | 35%   | 15%      | 20%   | **Premium sound** |

**Location:** `backend-py/utils/concept_repository.py` → `list_concepts()`

### 2. AI Name Regeneration (Backend)
**Endpoint:** `POST /planner/regenerate-name`

**Request:**
```json
{
  "vibe": "high-energy musical night",
  "city": "Colombo",
  "audience": "live music fans",
  "budget_lkr": 1000000,
  "attendees": 150
}
```

**Response:**
```json
{
  "title": "Electric Nights Rooftop Sessions",
  "tagline": "Where city lights meet live beats under the stars"
}
```

**Location:** `backend-py/routers/concept_names.py`

**Usage:** Click the refresh icon on any concept card to generate a new creative name via OpenAI.

### 3. Interactive Frontend Components

#### **InteractivePlannerResults.jsx**
- **Budget Cards**: Animated progress bars, hover effects, selection state
- **Refresh Button**: Per-concept name regeneration with loading spinner
- **Selection**: Click card to select → Opens provider modal

#### **ProviderSelectionModal**
- **4-Step Tabs**: Venue → Music → Lighting → Sound
- **Provider Cards**: Click to select (multi-select for music)
- **Progress Indicator**: Checkmarks on completed tabs
- **Confirmation**: Final "Confirm Selection" button

---

## 🚀 Setup Instructions

### Backend
1. **Register New Router** (already done):
   ```python
   # backend-py/main.py
   from routers.concept_names import router as concept_names_router
   app.include_router(concept_names_router)
   ```

2. **Start Server**:
   ```bash
   cd backend-py
   uvicorn main:app --reload --port 1800
   ```

3. **Test Name Generation**:
   ```bash
   curl -X POST http://localhost:1800/planner/regenerate-name \
     -H "Content-Type: application/json" \
     -d '{"vibe":"energetic","city":"Colombo","budget_lkr":1000000,"attendees":150}'
   ```

### Frontend
1. **Install Framer Motion** (if not already):
   ```bash
   cd frontend
   npm install framer-motion
   ```

2. **Update App Routing** (next step):
   Replace `<PlannerResults />` with `<InteractivePlannerResults />` in your router.

3. **Start Dev Server**:
   ```bash
   npm run dev
   ```

---

## 📁 File Structure

```
backend-py/
├── routers/
│   ├── planner.py          # Existing planner endpoints
│   ├── concept_names.py    # NEW: Name regeneration
│   └── venues.py           # Existing venue suggestions
├── utils/
│   └── concept_repository.py  # MODIFIED: 4 unique budget splits
└── main.py                 # MODIFIED: Added concept_names router

frontend/src/
├── pages/
│   ├── PlannerWizard.jsx           # Existing (unchanged)
│   ├── PlannerResults.jsx          # OLD: Static concept cards
│   └── InteractivePlannerResults.jsx  # NEW: Interactive version
└── theme/
    └── index.js            # Existing MUI theme (reused)
```

---

## 🎨 UI Flow

### Old Flow
```
Fill Wizard → Generate → View Static Cards → Select Concept → Done
```

### New Flow
```
Fill Wizard 
  → Generate (4 unique budget options)
  → Review Budget Cards
     ├─ Click Refresh to regenerate name (per concept)
     └─ Click Card to select
  → Provider Selection Modal
     ├─ Step 1: Choose Venue
     ├─ Step 2: Choose Music Acts (multi-select)
     ├─ Step 3: Choose Lighting Designer
     └─ Step 4: Choose Sound Engineer
  → Confirm & Submit
```

---

## 🔧 Next Steps (Implementation Checklist)

### Phase 1: Core Integration ✅
- [x] Create backend name generation endpoint
- [x] Add 4 unique budget distributions
- [x] Build interactive frontend components
- [x] Add Material-UI theme integration

### Phase 2: Provider Data (In Progress)
- [ ] Fetch real venue list from `/venues/suggest`
- [ ] Create `/planner/providers/music` endpoint (filter by genre)
- [ ] Create `/planner/providers/lighting` endpoint
- [ ] Create `/planner/providers/sound` endpoint
- [ ] Populate modal tabs with real data

### Phase 3: State Management
- [ ] Implement concept title update on refresh
- [ ] Store user selections (venue/music/lighting/sound)
- [ ] Submit final selection to backend
- [ ] Update campaign with selected providers

### Phase 4: Polish
- [ ] Add loading skeletons for slow API calls
- [ ] Implement error handling (e.g., OpenAI quota)
- [ ] Add success toast on selection
- [ ] Mobile responsive design
- [ ] Accessibility improvements (ARIA labels)

---

## 🎬 Demo Usage

### Step 1: Generate Plans
1. Go to `/planner`
2. Fill wizard form:
   - Event name: "Sunset Sessions"
   - Venue: "Downtown"
   - Date: 60 days from now
   - Attendees: 150
   - Budget: LKR 1,000,000
   - Concepts: 4
3. Click "Generate Plans"

### Step 2: Review Options
- You'll see 4 cards with **different budget splits**:
  - Option 1: Venue-focused (40% venue)
  - Option 2: Music-heavy (45% music)
  - Option 3: Lighting showcase (25% lighting)
  - Option 4: Premium sound (20% sound)

### Step 3: Customize Name
- Click refresh icon on any card
- New name generates via OpenAI
- Example: "Electric Nights Rooftop Sessions"

### Step 4: Select Providers
- Click any card to select
- Modal opens with 4 tabs
- Select venue → music → lighting → sound
- Click "Confirm Selection"

---

## 🐛 Troubleshooting

### "OpenAI quota exceeded"
The name generator falls back to `"{City} Live Showcase"` when quota is exhausted. This is expected and graceful.

### "Provider options not showing"
You need to implement the provider fetch endpoints (Phase 2 above). Currently shows mock data.

### "Concept name not updating after refresh"
You need to add state management to update the concept in the parent component's state. See Phase 3 checklist.

### "Styling doesn't match dashboard"
The component uses your existing MUI theme from `src/theme/index.js`. Ensure `ThemeProvider` wraps your app in `main.jsx`.

---

## 📊 API Reference

### POST /planner/regenerate-name
Generate creative concept name.

**Request:**
```typescript
{
  vibe?: string;      // default: "high-energy musical night"
  city?: string;      // default: "Colombo"
  audience?: string;  // default: "live music fans"
  budget_lkr?: number; // default: 1000000
  attendees?: number;  // default: 150
}
```

**Response:**
```typescript
{
  title: string;    // 4-6 words
  tagline: string;  // 8-12 words
}
```

### GET /campaigns/{id}/planner/generate
(Existing) Now returns 4 concepts with unique budget splits.

**Response:** Each concept has:
```typescript
{
  id: string;
  title: string;
  costs: [
    { category: "venue" | "music" | "lighting" | "sound", amount_lkr: number }
  ];
  total_lkr: number;
}
```

---

## 💡 Design Decisions

### Why 4 Budget Options?
Provides meaningful variety without overwhelming users. Each strategy serves a different event style:
- **Venue-focused**: Premium location, standard production
- **Music-heavy**: Headline acts, basic venue
- **Lighting showcase**: Visual spectacle, balanced budget
- **Premium sound**: Audiophile-grade, perfect for recordings

### Why Separate Provider Selection?
- **User Control**: Choose specific vendors vs. auto-assignment
- **Transparency**: See all options before committing
- **Flexibility**: Mix-and-match providers across categories
- **Discovery**: Learn about available talent in your area

### Why OpenAI for Names?
- **Creativity**: Unique names vs. generic templates
- **Context-Aware**: Adapts to budget/vibe/city
- **Fallback**: Still works without quota (uses city name)

---

## 🎯 Performance Notes

- **Name Generation**: ~1-2s (OpenAI API call)
- **Budget Shuffling**: Instant (computed on backend)
- **Modal Rendering**: <100ms (client-side only)
- **Provider Fetch**: TBD (depends on data source)

---

## 🔐 Security Considerations

- **OpenAI API Key**: Stored in backend `.env`, never exposed to frontend
- **Rate Limiting**: Consider adding for name regeneration (prevent abuse)
- **Input Validation**: All user inputs sanitized before OpenAI prompts
- **CORS**: Already configured in `main.py`

---

## 📝 Code Examples

### Using the Name Generator (Frontend)
```javascript
const refreshName = async (conceptId) => {
  const res = await fetch('http://localhost:1800/planner/regenerate-name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vibe: 'energetic rooftop party',
      city: 'Colombo',
      budget_lkr: 1500000,
    }),
  });
  const { title, tagline } = await res.json();
  // Update your state here
};
```

### Accessing Budget Variations (Backend)
```python
from utils.concept_repository import list_concepts

concepts = list_concepts(limit=4)
for c in concepts:
    print(f"{c.title}: {c.cost_split}")
# Output: 4 concepts with different venue/music/lighting/sound splits
```

---

## 🎉 What's Working Now

✅ Backend generates 4 unique budget options  
✅ Name refresh endpoint operational  
✅ Frontend renders interactive cards  
✅ Modal opens with tab navigation  
✅ Animations and theme applied  
✅ Budget progress bars animate  
✅ Selection state tracked  

## 🚧 What Needs Implementation

⏳ Provider data endpoints  
⏳ Real venue/music/lighting/sound lists  
⏳ State update on name refresh  
⏳ Final selection submission  
⏳ Mobile optimization  

---

**Ready to continue?** Let me know which phase to tackle next!
