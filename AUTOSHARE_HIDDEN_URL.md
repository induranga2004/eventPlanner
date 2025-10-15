# AutoShare UI Update - Hidden Poster URL ✅

## Changes Made

### Before
The AutoShare form showed a visible "Poster Image URL" text field that users could edit.

### After
The poster image URL is now **hidden** and auto-populated from the AI Poster Wizard.

## What Changed

### 1. Hidden Input Field
**Removed:**
```jsx
<TextField label="Poster Image URL" name="photoUrl" value={form.photoUrl} 
  onChange={onChange} fullWidth required
  InputProps={{ startAdornment: <InputAdornment position="start">
    <ImageIcon fontSize="small" />
  </InputAdornment> }} 
/>
```

**Added:**
```jsx
{/* Hidden input for photoUrl - auto-populated from AI Wizard */}
<input type="hidden" name="photoUrl" value={form.photoUrl} />
```

### 2. Updated Preview Text
**Before:**
```
"Enter a public image URL to see a preview here."
```

**After:**
```
"Poster image will appear here when loaded from AI Wizard"
```

**Also changed:**
```
"Preview" → "Poster Preview"
```

## User Experience

### Form Fields (Now Visible):
1. ✅ Event Name
2. ✅ Date
3. ✅ Venue
4. ✅ Ticket Price
5. ✅ Audience
6. ❌ ~~Poster Image URL~~ (Hidden)

### How It Works:
1. User generates poster in **AI Poster Wizard**
2. Clicks **"Share to Social Media"**
3. Navigates to **AutoShare** page
4. Form auto-fills with event data **including photoUrl** (hidden)
5. Poster preview shows on the right
6. User can edit event details if needed
7. Clicks **Submit** to post to Mastodon

## Benefits

✅ **Cleaner UI** - One less field to confuse users  
✅ **Auto-populated** - photoUrl comes from AI Wizard automatically  
✅ **Still functional** - Hidden field still validates and submits  
✅ **Better UX** - Users don't need to see/edit the URL  
✅ **Preview shows** - Image still displays on the right side  

## Files Modified
- ✅ `frontend/src/pages/AutoShare.jsx` - Hidden photoUrl field, updated text

---
**Updated by**: GitHub Copilot  
**Date**: October 15, 2025
