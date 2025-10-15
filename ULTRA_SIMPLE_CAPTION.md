# Ultra-Simple Caption Generator ✅

## The Issue
Still getting Mastodon 422 error - caption over 500 characters.

## The Solution
**COMPLETELY NEW CAPTION** - Ultra-simple, no AI, just the 4 fields you asked for:

### New Caption Format
```
{Name} • {Date} • {Venue} • {Price}
```

### Examples

**Input:**
```json
{
  "name": "Rock Concert",
  "date": "2025-12-31",
  "venue": "Madison Square Garden",
  "price": "$75"
}
```

**Output:**
```
Rock Concert • 2025-12-31 • Madison Square Garden • $75
```

**Character count:** ~58 chars ✅

---

**Another Example:**
```json
{
  "name": "Summer Music Festival",
  "date": "2025-07-15",
  "venue": "Central Park Amphitheater",
  "price": "$45-$120"
}
```

**Output:**
```
Summer Music Festival • 2025-07-15 • Central Park Amphitheater • $45-$120
```

**Character count:** ~78 chars ✅

## What Changed

### 1. Removed ALL AI
- **Before:** Used OpenAI API with fallback
- **After:** ALWAYS uses simple caption (no AI at all)

```python
def generate_captions(event):
    """Generate simple captions without AI - always use deterministic version."""
    # ALWAYS use simple captions (no AI)
    return _deterministic_captions(event)
```

### 2. Ultra-Simple Caption Function
- **Only uses:** Name, Date, Venue, Price
- **Separator:** Bullet points (•)
- **No emojis:** Just clean text
- **No hashtags:** Just the facts
- **No promotional text:** Just event info
- **Max length:** 400 chars (well under 500 limit)

```python
def _deterministic_captions(event):
    name = event.get("name", "Event")
    date = event.get("date", "")
    venue = event.get("venue", "")
    price = event.get("price", "")
    
    parts = []
    if name: parts.append(name)
    if date: parts.append(date)
    if venue: parts.append(venue)
    if price: parts.append(price)
    
    caption = " • ".join(parts)
    
    # Safety: truncate if over 400 chars
    if len(caption) > 400:
        caption = caption[:400]
    
    return {"mastodon": caption, ...}
```

## Key Features

✅ **No AI** - Never calls OpenAI  
✅ **Always short** - Max 400 characters  
✅ **Simple format** - Just the 4 inputs separated by bullets  
✅ **No emojis** - Clean professional text  
✅ **No hashtags** - No extra characters  
✅ **Same for all platforms** - Consistent everywhere  

## Files Changed
- ✅ `backend-py/models/caption_agent.py` - Completely rewritten

## Testing

1. **Your backend should auto-reload** (check terminal)
2. **Test with AutoShare form:**
   - Name: "Test Event"
   - Date: "2025-10-20"
   - Venue: "Test Venue"
   - Price: "$50"
3. **Expected Caption:**
   ```
   Test Event • 2025-10-20 • Test Venue • $50
   ```
   (35 characters - way under 500 limit!)

## Why This Will Work

- **Old caption might have been:** AI-generated with long descriptions, emojis, hashtags → 500+ chars ❌
- **New caption is:** Just "Name • Date • Venue • Price" → ~50-100 chars ✅

The caption is now impossible to exceed 500 characters unless your event name itself is super long!

---
**Fixed by**: GitHub Copilot  
**Date**: October 15, 2025  
**Caption Format**: Name • Date • Venue • Price
