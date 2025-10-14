# 🧪 Testing Guide: Event Planner → AI Poster Integration

## 🚀 Quick Start

### Prerequisites
1. ✅ Backend running on http://127.0.0.1:1800
2. ✅ Frontend running on http://localhost:5175
3. ✅ OpenAI API key configured in backend

### Test Scenario: "Summer Music Festival"

---

## 📋 Step-by-Step Test

### 1. Create Event Plan
1. Navigate to: `http://localhost:5175/planner`
2. Fill in the form:
   ```
   Event Name: Summer Music Festival
   City: Colombo
   Venue: Galle Face Hotel
   Date: 2024-12-31
   Budget: 1000000 LKR
   Attendees: 250
   Vibe: High-energy musical night
   ```
3. Click **"Generate Plans"**
4. Wait for 3 concept cards to appear

### 2. Select Concept
1. Review the 3 generated concepts
2. Click **"Select This Plan"** on your favorite
3. **Provider Selection Modal** opens

### 3. Select Providers

#### Venue Tab
- Click on **1 venue provider** (any)
- Note the cost and amenities

#### Music Tab
- Select **2-3 musicians/bands**
- **IMPORTANT**: Choose musicians with different genres
  - Example: Rock band + Jazz artist + Electronic DJ
- This will create a rich genre mix for the poster

#### Lighting Tab
- Select **1 lighting provider**
- Check their hourly rate (affects tier inference)

#### Sound Tab
- Select **1 sound provider**
- Complete all selections

### 4. Confirm Selection
1. Click **"Confirm Selection"** button (bottom-right of modal)
2. Modal should close
3. **Watch for animations**:
   - ✨ Success Snackbar appears (bottom-left)
     - Message: "Event plan saved! Click the button to create stunning posters..."
   - 🎨 Floating Action Button (FAB) appears (bottom-right)
     - Gradient blue background
     - Text: "Create Event Poster"
     - Brush icon

### 5. Navigate to AI Wizard
1. Click the **FAB button** (bottom-right)
2. Should navigate to `/ai-poster-wizard`
3. Page loads with Color Hunt theme gradient background

### 6. Auto-Load Verification
**Step 0: Event Context**

Expected behavior:
- Page shows loading spinner initially
- After 1-2 seconds:
  - ✅ Event name displays: "Summer Music Festival"
  - ✅ Venue displays: "Galle Face Hotel"
  - ✅ Date displays: "2024-12-31"
  - ✅ Budget displays: "LKR 1,000,000"
  - ✅ Concept displays: Selected concept title + tagline
  - ✅ Custom query pre-filled with smart text like:
    ```
    Professional poster for Summer Music Festival at Galle Face Hotel Colombo 
    featuring [musician names] ([genres]) with high-energy vibrant atmosphere
    ```
- **Auto-advance**: After 1.5 seconds, should jump to Step 1

### 7. Background Generation
**Step 1: Generate Backgrounds**

Expected behavior:
- Loading spinner with text: "Generating stunning backgrounds..."
- After 10-30 seconds (depends on OpenAI):
  - ✅ Grid of 4 background images appears
  - ✅ Each image is 300px tall, clickable
  - ✅ Click one → border turns blue (#5B99C2)
  - ✅ "Selected" badge appears on chosen image
- Buttons available:
  - **"Regenerate"**: Creates 4 new backgrounds
  - **"Harmonize Design"**: Proceeds to next step (only enabled when 1 selected)

**Verification Checklist**:
- [ ] All 4 images loaded successfully
- [ ] Images reflect event genre/mood
- [ ] Selection state changes on click
- [ ] "Harmonize" button only enabled when 1 selected

### 8. Harmonization
**Step 2: Harmonize Design**

Click **"Harmonize Design"**

Expected behavior:
- Loading spinner with text: "Harmonizing your design..."
- Backend processes:
  - Adds event name typography
  - Adds date/venue details
  - Processes musician photos (if provided)
  - Removes backgrounds from musician photos (rembg)
  - Overlays musicians on chosen background
- After 30-60 seconds:
  - ✅ Final posters appear (usually 2-4 variations)
  - ✅ Each poster shows:
    - Event name: "SUMMER MUSIC FESTIVAL"
    - Date: "December 31, 2024"
    - Venue: "Galle Face Hotel"
    - Musician images (if photos provided)
  - ✅ Download button below each poster

**Verification Checklist**:
- [ ] Event name visible and prominent
- [ ] Date formatted correctly
- [ ] Venue name included
- [ ] Musicians appear (if photos provided)
- [ ] Typography matches genre/mood
- [ ] Colors harmonize with background

### 9. Download Posters
1. Click **"Download Poster"** button on each
2. Files should download with names:
   ```
   Summer_Music_Festival_1.png
   Summer_Music_Festival_2.png
   ...
   ```
3. Success Snackbar appears: "✅ Downloaded poster [N]"
4. Open downloaded files:
   - ✅ High resolution (1920x1080 or similar)
   - ✅ Event details readable
   - ✅ Professional quality

### 10. Regenerate Test
1. Click **"Generate More"** button
2. Should return to Step 1
3. Can select different background
4. Can regenerate entirely new set
5. Test workflow loop

---

## 🎨 Visual Verification

### Color Hunt Theme Check
- [ ] Background gradient visible: Dark purple-blue → Medium blue → Light blue
- [ ] All text in cream (#F9DBBA)
- [ ] Buttons have gradient (#5B99C2 → #1A4870)
- [ ] Cards have glass morphism effect (backdrop blur)
- [ ] Borders are cream with 20% opacity
- [ ] Shadows have light blue tint

### Animation Check
- [ ] Step transitions smooth (fade + slide)
- [ ] Background cards animate in sequence (stagger 0.1s each)
- [ ] Hover effects work (scale 1.05, translateY -8px)
- [ ] FAB button has spring animation when appearing
- [ ] Snackbars slide in from bottom

### Responsive Check
- [ ] Layout adapts to window width
- [ ] Cards reflow in grid (auto-fit minmax(300px, 1fr))
- [ ] Text remains readable at all sizes
- [ ] Buttons stack on mobile
- [ ] Images scale proportionally

---

## 🔍 Data Verification

### localStorage Check
1. Open browser DevTools (F12)
2. Go to **Application → Local Storage → http://localhost:5175**
3. Find key: `eventPlanningContext`
4. Value should be JSON object:
   ```json
   {
     "campaign_id": "uuid-here",
     "event_name": "Summer Music Festival",
     "venue": "Galle Face Hotel",
     "event_date": "2024-12-31",
     "attendees_estimate": 250,
     "total_budget_lkr": 1000000,
     "selectedConcept": {
       "title": "...",
       "tagline": "...",
       "costs": [...]
     },
     "selections": {
       "venue": {...},
       "music": [{...}, {...}],
       "lighting": {...},
       "sound": {...}
     },
     "timestamp": "2024-..."
   }
   ```

### Backend API Check
Open: `http://127.0.0.1:1800/api/event-context/`

Should return JSON array with your saved context:
```json
[
  {
    "campaign_id": "uuid",
    "event_name": "Summer Music Festival",
    ...
  }
]
```

### Network Tab Verification
1. Open DevTools → Network tab
2. Filter by **Fetch/XHR**
3. Look for successful requests:
   - ✅ `POST /api/event-context/save` → 200 OK
   - ✅ `POST /design/start-from-event` → 200 OK
   - ✅ `POST /design/generate-backgrounds` → 200 OK
   - ✅ `POST /design/harmonize` → 200 OK

---

## 🐛 Common Issues & Solutions

### Issue: FAB button doesn't appear
**Solution**:
- Check browser console for errors
- Verify provider selection confirmed
- Check if `window.showPosterCTA` function exists
- Ensure modal closed successfully

### Issue: Event context not loading in wizard
**Solution**:
- Check localStorage has `eventPlanningContext` key
- Verify backend API responds to GET request
- Check browser console for CORS errors
- Ensure EventPlanningProvider wraps app in main.jsx

### Issue: Smart query is generic
**Solution**:
- Verify musicians have `genres` array populated
- Check venue string includes city name
- Ensure cost distribution calculated
- Review `generateSmartQuery` function logic

### Issue: Backgrounds don't reflect event style
**Solution**:
- Check if genres extracted correctly (DevTools console)
- Verify `event_aware_prompts.py` receiving event context
- Review OpenAI prompt in backend logs
- Try regenerating with different query

### Issue: Musicians not appearing in final poster
**Solution**:
- Verify musician providers have `photo` field populated
- Check if photo URLs accessible
- Review backend logs for rembg errors
- Ensure harmonization received musician_image_urls array

### Issue: Download fails
**Solution**:
- Check if image URLs valid (paste in browser)
- Verify CORS allows image download
- Try right-click → Save Image As
- Check browser download permissions

---

## 📊 Expected Performance

### Timing Benchmarks
- **Provider selection save**: < 1 second
- **Context load on wizard mount**: < 500ms
- **Background generation**: 15-30 seconds (OpenAI API)
- **Harmonization**: 30-60 seconds (image processing + AI)
- **Download**: Instant (client-side)

### API Response Sizes
- Event context: ~5-10 KB
- Background images: ~500 KB - 2 MB each
- Harmonized posters: ~1-3 MB each

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ⚠️ IE11 not supported (React 18 requirement)

---

## ✅ Success Criteria

### Functional Requirements
- [x] Event data persists across navigation
- [x] No manual data re-entry required
- [x] Genres correctly inferred from musicians
- [x] Mood correctly inferred from budget
- [x] Colors match genre palette
- [x] Smart query includes event details
- [x] Posters include real event data
- [x] Downloads work with correct filenames

### UX Requirements
- [x] Auto-load reduces friction
- [x] Loading states prevent confusion
- [x] Error messages user-friendly
- [x] Success feedback via Snackbar
- [x] FAB button discoverable
- [x] Theme consistent throughout
- [x] Animations smooth and professional

### Technical Requirements
- [x] 0 console errors
- [x] 0 network failures
- [x] localStorage sync works
- [x] Backend API responds
- [x] CORS configured correctly
- [x] Images load without errors

---

## 🎉 Test Complete!

If all steps pass, the integration is **fully functional**. Users can now:

1. Plan their event with real budget/providers
2. Automatically flow into AI poster generation
3. Get genre-aware, mood-aware, budget-aware designs
4. Download professional-quality posters
5. All without leaving the app or re-entering data

**Status**: 🚀 READY FOR PRODUCTION (pending database migration)

---

## 📝 Feedback Template

After testing, note:

### What Worked Well
- 
- 
- 

### Issues Found
- 
- 
- 

### Suggested Improvements
- 
- 
- 

### Overall Rating
- Functionality: ___ / 5
- UX: ___ / 5
- Performance: ___ / 5
- Design: ___ / 5
