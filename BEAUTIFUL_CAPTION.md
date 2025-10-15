# Beautiful Caption Generator with Emojis ✨

## New Caption Format

### Structure
```
🎉 {Event Name}
📅 {Date}
📍 {Venue}
🎫 {Price}

✨ Don't miss out!
```

## Examples

### Example 1: Rock Concert
**Input:**
```json
{
  "name": "Rock Concert 2025",
  "date": "2025-12-31",
  "venue": "Madison Square Garden",
  "price": "$75"
}
```

**Generated Caption:**
```
🎉 Rock Concert 2025
📅 2025-12-31
📍 Madison Square Garden
🎫 $75

✨ Don't miss out!
```

**Character count:** ~95 chars ✅

---

### Example 2: Summer Festival
**Input:**
```json
{
  "name": "Summer Music Festival",
  "date": "2025-07-15",
  "venue": "Central Park",
  "price": "$45"
}
```

**Generated Caption:**
```
🎉 Summer Music Festival
📅 2025-07-15
📍 Central Park
🎫 $45

✨ Don't miss out!
```

**Character count:** ~80 chars ✅

---

### Example 3: Wedding Event
**Input:**
```json
{
  "name": "Sarah & John's Wedding",
  "date": "2025-11-20",
  "venue": "Grand Ballroom Hotel Imperial",
  "price": "Invitation Only"
}
```

**Generated Caption:**
```
🎉 Sarah & John's Wedding
📅 2025-11-20
📍 Grand Ballroom Hotel Imperial
🎫 Invitation Only

✨ Don't miss out!
```

**Character count:** ~110 chars ✅

## Features

✅ **Beautiful Emojis**
- 🎉 Celebration emoji for event name
- 📅 Calendar emoji for date
- 📍 Location pin for venue
- 🎫 Ticket emoji for price
- ✨ Sparkles for call-to-action

✅ **Simple English**
- Clean, easy-to-read format
- One line per detail
- Clear call-to-action: "Don't miss out!"

✅ **Safe Character Limits**
- Adds call-to-action if under 400 chars
- Removes call-to-action if needed
- Truncates at 450 chars max
- Always under Mastodon's 500 limit

✅ **No AI Required**
- Instant generation
- Consistent format
- Uses only your form inputs

## How It Works

```python
def _deterministic_captions(event):
    """Generate beautiful captions with emojis and simple English."""
    
    # Build caption with emojis
    🎉 Event Name
    📅 Date
    📍 Venue
    🎫 Price
    
    ✨ Don't miss out!
    
    # Safety checks
    - If > 400 chars: Remove call-to-action
    - If > 450 chars: Truncate
    - Always < 500 chars for Mastodon
```

## Character Safety

| Content | Typical Length | Max Safe |
|---------|---------------|----------|
| Event name + emoji | 20-50 chars | ✅ |
| Date + emoji | 15-20 chars | ✅ |
| Venue + emoji | 20-60 chars | ✅ |
| Price + emoji | 10-30 chars | ✅ |
| Call-to-action | 20 chars | ✅ |
| **Total** | **~100-150 chars** | **< 500** ✅ |

## Testing

Your backend should **auto-reload**. Try it now:

1. Go to `/auto-share`
2. Fill in:
   - Name: "Test Event"
   - Date: "2025-10-20"
   - Venue: "Test Venue"
   - Price: "$50"
3. Expected caption:
   ```
   🎉 Test Event
   📅 2025-10-20
   📍 Test Venue
   🎫 $50
   
   ✨ Don't miss out!
   ```

## Benefits

✅ **Beautiful** - Eye-catching emojis  
✅ **Clean** - One detail per line  
✅ **Simple** - Easy to read  
✅ **Short** - Typically 80-150 characters  
✅ **Safe** - Always under 500 char limit  
✅ **Engaging** - Call-to-action at the end  

---
**Created by**: GitHub Copilot  
**Date**: October 15, 2025  
**Format**: Emoji + Simple English + Variables
