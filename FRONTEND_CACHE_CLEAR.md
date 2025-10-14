# Clear Frontend Cache and Test New Categories

After refactoring the backend to use **venue/music/lighting/sound** cost categories instead of **catering/production/logistics**, follow these steps to ensure the UI reflects the new structure:

## 1. Clear Old Campaign Data

The frontend may be caching old campaign IDs or planner results. To reset:

### Option A: Clear Browser Storage
1. Open DevTools (F12)
2. Go to **Application** → **Storage** → **Clear site data**
3. Or manually delete keys in **Local Storage** related to campaigns

### Option B: Use Incognito/Private Window
- Open the planner in a private browsing window to avoid cached state

## 2. Restart Backend with Fresh Data

```bash
cd backend-py
python scripts/cleanup_legacy_plan_costs.py  # Purge old SQLite rows
# If using Mongo, also run:
# python scripts/cleanup_legacy_mongo_concepts.py
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 1800
```

## 3. Rebuild Frontend

```bash
cd frontend
npm run build  # Production build
# or
npm run dev    # Dev server
```

## 4. Test Planner Flow

1. Navigate to `/planner` in the UI
2. Fill in event details:
   - Event name
   - Venue
   - Date (at least 30 days out to avoid lead-time warnings)
   - Attendees: 150
   - Budget: LKR 1,000,000
   - Number of concepts: 2
3. Click **Generate Plans**

### Expected Result

Each concept card should now display **only**:
- **venue** (e.g., LKR 400,000)
- **music** (e.g., LKR 350,000)
- **lighting** (e.g., LKR 150,000)
- **sound** (e.g., LKR 100,000)

**Old categories** (catering, production, logistics, entertainment) should **not** appear.

## 5. Verify API Response

Check the network tab (DevTools → Network) for the `/planner/generate` response:

```json
{
  "concepts": [
    {
      "id": "fallback-live-showcase-1",
      "costs": [
        {"category": "venue", "amount_lkr": 400000},
        {"category": "music", "amount_lkr": 350000},
        {"category": "lighting", "amount_lkr": 150000},
        {"category": "sound", "amount_lkr": 100000}
      ]
    }
  ]
}
```

## Troubleshooting

### Still Seeing Old Categories?

1. **Check campaign age**: If you're viewing an old campaign created before the migration, it will still have legacy categories. Create a **new** campaign to see the updated structure.

2. **Verify DB cleanup**: Run SQLite check:
   ```bash
   cd backend-py
   sqlite3 planner.db "SELECT DISTINCT category FROM plan_costs"
   ```
   Should return: `venue`, `music`, `lighting`, `sound`

3. **Confirm concept source**: Check backend logs when generating plans:
   - If you see "Mongo unavailable" warnings, the system is using the fallback concept with correct categories.
   - If OpenAI quota is exceeded, the fallback is also used (also correct).

4. **Hard refresh**: In the browser, press Ctrl+Shift+R (Cmd+Shift+R on Mac) to bypass cache.

## Notes

- **When Mongo is unavailable** (no `MONGO_URI` set), the system generates placeholder concepts with the new categories.
- **When OpenAI quota is exhausted**, the system falls back to the same placeholder structure.
- All paths now enforce the `venue/music/lighting/sound` split, so legacy categories should never appear in fresh data.
