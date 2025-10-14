# 🎵 Provider Selection - Quick Reference Card

## 🚀 Quick Start (2 Minutes)

### Terminal 1: Backend
```powershell
cd d:\Projects\eventPlanner\backend-py
uvicorn main:app --reload --port 1800
```

### Terminal 2: Frontend
```powershell
cd d:\Projects\eventPlanner\frontend
npm run dev
```

### Browser
Open: **http://localhost:5173** (or 5175 if 5173 is taken)

---

## 📊 API Endpoints at a Glance

| Endpoint | Purpose | Multi-Select? |
|----------|---------|---------------|
| `GET /planner/providers/venue` | Fetch venues | ❌ Single |
| `GET /planner/providers/music` | Fetch musicians + bands | ✅ **Multi** |
| `GET /planner/providers/lighting` | Fetch lighting designers | ❌ Single |
| `GET /planner/providers/sound` | Fetch sound engineers | ❌ Single |

---

## 🔍 Query Parameters

### All Endpoints
- `city` - Filter by city (e.g., "Colombo", "Hambantota")
- `max_budget_lkr` - Maximum budget
- `limit` - Max results (default: 12)

### Venue Only
- `min_capacity` - Minimum guest capacity

### Music Only
- `genre` - Filter by genre (e.g., "Jazz", "Rock")

### Lighting/Sound Only
- `min_crew_size` - Minimum crew size

---

## 🎯 MongoDB Roles Required

To see providers, you need users in MongoDB with these roles:

| Role | Creates | Multi-Select? |
|------|---------|---------------|
| `venue` | Venue provider | ❌ |
| `musician` | Solo musician | ✅ |
| `music_band` | Band/ensemble | ✅ |
| `lights` | Lighting designer | ❌ |
| `sounds` | Sound engineer | ❌ |

---

## 💡 Quick Test Commands

```bash
# Test venue endpoint
curl "http://localhost:1800/planner/providers/venue?city=Hambantota&limit=5"

# Test music endpoint (returns solo + bands)
curl "http://localhost:1800/planner/providers/music?genre=Jazz&limit=5"

# Test lighting endpoint
curl "http://localhost:1800/planner/providers/lighting?city=Colombo&limit=5"

# Test sound endpoint
curl "http://localhost:1800/planner/providers/sound?limit=5"
```

---

## 🎨 UI Flow

```
Generate Concepts (4 cards)
  ↓
Click Card
  ↓
Modal Opens → Tab 1: Venue
  ├─ API fetches venues by city + budget
  ├─ Click venue → ☑️ Checkmark
  └─ Click "Next: Music"
      ↓
Tab 2: Music (**Multi-Select**)
  ├─ API fetches musicians + bands
  ├─ Click artist 1 → ☑️
  ├─ Click band 1 → ☑️ (can select multiple!)
  ├─ Click artist 2 → ☑️
  └─ Click "Next: Lighting"
      ↓
Tab 3: Lighting
  ├─ API fetches lighting designers
  ├─ Click designer → ☑️
  └─ Click "Next: Sound"
      ↓
Tab 4: Sound
  ├─ API fetches sound engineers
  ├─ Click engineer → ☑️
  └─ Click "Confirm Selection"
      ↓
Console logs final selections
```

---

## 🐛 Troubleshooting (1-Minute Fixes)

### No providers appear?
**Fix:** Register test users with roles: `venue`, `musician`, `music_band`, `lights`, `sounds`

### Budget filter too strict?
**Fix:** Remove this line in modal:
```javascript
// if (budget) params.append('max_budget_lkr', budget.toString());
```

### CORS errors?
**Fix:** Check `backend-py/main.py` has:
```python
allow_origins=["*"]
```

### Frontend errors?
**Fix:** Install framer-motion:
```powershell
cd frontend
npm install framer-motion
```

---

## 📋 Example MongoDB Document (Venue)

```json
{
  "role": "venue",
  "name": "Hambantota Marina Event Deck",
  "venueAddress": "Magampura Port Access Road, Hambantota",
  "capacity": 340,
  "standardRate": 75000,
  "phone": "+94 781234567"
}
```

---

## ✅ Success Checklist

- [ ] Backend running on port 1800
- [ ] Frontend running on port 5173
- [ ] Generated 4 concepts
- [ ] Clicked concept card → Modal opened
- [ ] Venue tab shows real data
- [ ] Selected venue → Checkmark appeared
- [ ] Music tab shows solo + bands
- [ ] Selected **multiple** musicians
- [ ] Lighting tab shows designers
- [ ] Sound tab shows engineers
- [ ] Clicked "Confirm Selection"
- [ ] Console logged final selections

---

## 📖 Full Documentation

- **PROVIDER_SYSTEM_COMPLETE.md** - Complete guide
- **PROVIDER_SELECTION_SYSTEM.md** - Technical details
- **INTERACTIVE_PLANNER_REDESIGN.md** - Planner overview
- **QUICK_START_TESTING.md** - 3-minute setup

---

## 🎉 Status

✅ **Ready to test!**

**Files:**
- `backend-py/routers/providers.py` ✅
- `backend-py/main.py` ✅ (router registered)
- `frontend/src/pages/InteractivePlannerResults.jsx` ✅

**Next:** Save provider selections to database!

---

**Updated:** October 14, 2025  
**Version:** 1.0.0
