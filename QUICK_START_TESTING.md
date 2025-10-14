# 🚀 Quick Start - Interactive Planner Testing

## ⚡ 3-Minute Setup

### 1. Backend (Terminal 1)
```powershell
cd d:\Projects\eventPlanner\backend-py
uvicorn main:app --reload --port 1800
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:1800
INFO:     Application startup complete.
```

### 2. Frontend (Terminal 2)
```powershell
cd d:\Projects\eventPlanner\frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 3. Open Browser
Navigate to: **http://localhost:5173/**

---

## 🎯 Test the New Features

### ✅ Feature 1: Unique Budget Distributions

**What to do:**
1. Fill wizard form (any values)
2. Click "Generate Plans"
3. Look at the 4 concept cards

**What to expect:**
- **Card 1:** Higher venue percentage (40%)
- **Card 2:** Higher music percentage (45%)
- **Card 3:** Higher lighting percentage (25%)
- **Card 4:** Higher sound percentage (20%)

**Before vs After:**
```
BEFORE: All 4 cards had 25% / 25% / 25% / 25% (identical)
AFTER:  Each card has DIFFERENT venue/music/lighting/sound splits
```

---

### ✅ Feature 2: AI Name Regeneration

**What to do:**
1. Find the refresh icon (🔄) on any concept card
2. Click it

**What to expect:**
- Loading spinner appears (1-2 seconds)
- New creative name appears via OpenAI
- Tagline updates too

**Example transformations:**
```
Before: "Colombo Live Showcase"
After:  "Electric Nights Rooftop Sessions"
        "Where city lights meet live beats under the stars"
```

**If OpenAI quota is exhausted:**
```
Fallback: "{City} Live Showcase"
(Still functional, just not AI-generated)
```

---

### ✅ Feature 3: Provider Selection Modal

**What to do:**
1. Click on any concept card (the whole card is clickable)
2. Modal opens with 4 tabs

**What to expect:**
- **Tab 1 (Venue):** List of venue options (currently mock data)
- **Tab 2 (Music):** Music acts (can select multiple)
- **Tab 3 (Lighting):** Lighting designers (single select)
- **Tab 4 (Sound):** Sound engineers (single select)
- Click through tabs → selections persist
- Click "Confirm Selection" → logs to console

**UI Features:**
- ✅ Checkmarks appear on completed tabs
- ✅ Progress indicator at top
- ✅ Smooth tab transitions
- ✅ Selected cards have blue border

---

## 🔍 What to Verify

### Backend Tests

#### Test 1: Budget Variations
```powershell
# In backend-py directory
python -c "from utils.concept_repository import list_concepts; [print(f'{c.title}: venue={next(co for co in c.costs if co.category==\"venue\").amount_lkr}, music={next(co for co in c.costs if co.category==\"music\").amount_lkr}') for c in list_concepts(4)]"
```

**Expected:** 4 concepts with different venue/music amounts.

#### Test 2: Name Generation
```powershell
curl -X POST http://localhost:1800/planner/regenerate-name -H "Content-Type: application/json" -d '{\"vibe\":\"energetic\",\"city\":\"Colombo\",\"budget_lkr\":1000000}'
```

**Expected:**
```json
{
  "title": "Colombo Nights Live Fest",
  "tagline": "Where energy meets unforgettable moments"
}
```

### Frontend Tests

#### Test 1: Card Hover
- Hover over any budget card
- Should scale up slightly (1.02x)

#### Test 2: Progress Bars
- Check each card has 4 colored bars
- Bars should animate from 0 to target width (1.2s)

#### Test 3: Modal Navigation
- Open modal
- Click each tab (Venue → Music → Lighting → Sound)
- Previous selections should persist

---

## 📸 Screenshots Checklist

### What Should You See?

1. **Planner Wizard** (unchanged)
   - Form with event details
   - "Generate Plans" button

2. **Budget Cards** (NEW!)
   - 4 cards in a grid
   - Different percentages per card
   - Refresh icon on each
   - Hover effect (scales)

3. **Provider Modal** (NEW!)
   - 4 tabs at top
   - Provider cards in grid
   - "Confirm Selection" button at bottom
   - Checkmarks on completed tabs

---

## 🐛 Troubleshooting

### Issue: Cards show identical budgets
**Fix:** Backend didn't restart after changes
```powershell
cd backend-py
# Stop uvicorn (Ctrl+C)
uvicorn main:app --reload --port 1800
```

### Issue: Refresh button doesn't work
**Check:**
1. Backend running? → `http://localhost:1800/docs`
2. Network tab in DevTools → Should see POST to `/planner/regenerate-name`
3. Console errors? → Check OpenAI API key in `.env`

### Issue: Modal doesn't open
**Check:**
1. Browser console for errors
2. Ensure framer-motion is installed:
   ```powershell
   cd frontend
   npm install framer-motion
   ```

### Issue: Styles look weird
**Fix:** Clear browser cache (Ctrl+Shift+Delete)

---

## ✨ Success Criteria

You'll know it's working when:

✅ **4 cards show DIFFERENT budget percentages**  
✅ **Clicking refresh icon changes the name (1-2s delay)**  
✅ **Clicking card opens modal with 4 tabs**  
✅ **Modal tabs show provider options (even if mock)**  
✅ **Animations are smooth (progress bars, hover, modal)**  

---

## 📊 Performance Benchmarks

| Action | Expected Time | What Happens |
|--------|---------------|--------------|
| Generate concepts | 1-3s | Backend calculates 4 budgets |
| Refresh name | 1-2s | OpenAI API call |
| Open modal | <100ms | Pure client-side render |
| Tab switch | <50ms | Pure React state change |

---

## 🎬 Demo Flow (for presentations)

### 1. Show Old System (Optional)
- Comment out `InteractivePlannerResults` in `App.jsx`
- Uncomment `PlannerResults`
- Show boring identical cards

### 2. Show New System
- Switch back to `InteractivePlannerResults`
- Generate plans → **4 unique budgets**
- Hover cards → **smooth animation**
- Click refresh → **AI generates new name**
- Click card → **modal opens**
- Navigate tabs → **select providers**
- Confirm → **log selections**

### 3. Explain Benefits
- **User control:** Choose specific providers
- **AI creativity:** Unique names via OpenAI
- **Flexibility:** Different budget strategies
- **Transparency:** See all options upfront

---

## 🔗 Next Steps After Testing

Once you've verified everything works:

1. **Implement Real Provider Data**
   - Create `/planner/providers/venue` endpoint
   - Fetch from MongoDB `users` collection (role filter)
   - Replace mock cards with real data

2. **Add State Persistence**
   - Save selections to SQLite campaign table
   - Update concept name when refreshed
   - Store final user choices

3. **Polish UI**
   - Loading skeletons
   - Error handling (network failures)
   - Success toast on confirmation
   - Mobile responsive design

4. **Deploy**
   - Build frontend: `npm run build`
   - Test production build
   - Deploy to hosting

---

## 📝 Quick Reference

### File Locations
```
Backend:
  - Endpoint: backend-py/routers/concept_names.py
  - Logic: backend-py/utils/concept_repository.py

Frontend:
  - Component: frontend/src/pages/InteractivePlannerResults.jsx
  - Router: frontend/src/App.jsx
```

### API Endpoints
```
GET  /campaigns/{id}/planner/generate?concepts=4
POST /planner/regenerate-name
```

### Ports
```
Backend:  http://localhost:1800
Frontend: http://localhost:5173
```

---

## 🎉 You're All Set!

**Everything is ready to test.** Just start both servers and open your browser.

**Questions?** Check these docs:
- [REDESIGN_COMPLETE_SUMMARY.md](./REDESIGN_COMPLETE_SUMMARY.md) - Full feature list
- [INTERACTIVE_PLANNER_REDESIGN.md](./INTERACTIVE_PLANNER_REDESIGN.md) - Implementation details

**Happy testing! 🚀**
