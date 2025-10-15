# Simple Caption Generator - Mastodon Character Limit Fix ✅

## Issue
```
Mastodon API returned error 422: 
"Validation failed: Text character limit of 500 exceeded"
```

The AI-generated captions or the default captions were too long for Mastodon's 500-character limit.

## Solution
Created a **simple, non-AI caption generator** that:
- Uses only the event inputs (no AI calls)
- Keeps captions SHORT (under 300 chars with buffer)
- Platform-specific limits: Mastodon (500), Twitter (280)

## Changes Made

### 1. Updated `caption_agent.py` - Simple Caption Format

**New Caption Structure:**
```
🎉 {Event Name} | {Date} @ {Venue} | {Price}

#Event #Live
```

**Example:**
```
🎉 Summer Music Festival | 2025-07-15 @ Central Park | $45

#Event #Live
```

**Character Safety:**
- Base caption: Event info only
- Adds hashtags if total < 300 chars
- Truncates to 490 chars for Mastodon (10 char buffer)
- No long sentences or promotional text

### 2. Updated `main.py` - Platform-Specific Captions

**Before:**
```python
caption = captions.get("instagram", "Enjoy the event!")
```

**After:**
```python
target = (SHARE_TARGET or "instagram").lower()
caption = captions.get(target, captions.get("instagram", "Enjoy the event!"))
logger.info(f"Generated caption ({len(caption)} chars): {caption}")
```

Now uses the correct caption for each platform:
- `SHARE_TARGET=mastodon` → Uses mastodon caption (490 char max)
- `SHARE_TARGET=instagram` → Uses instagram caption (2200 char max)
- `SHARE_TARGET=twitter` → Uses twitter caption (240 char max)

## Caption Format Per Platform

| Platform | Limit | Our Max | Format |
|----------|-------|---------|--------|
| Mastodon | 500 | 490 | Short with emoji + hashtags |
| Twitter | 280 | 240 | Short, no hashtags |
| Instagram | 2200 | 300 | Short with hashtags |
| Facebook | Unlimited | 300 | Short with hashtags |

## Example Captions Generated

**Input:**
```json
{
  "name": "Rock Concert 2025",
  "date": "2025-12-31",
  "venue": "Madison Square Garden",
  "price": "$75"
}
```

**Output (Mastodon):**
```
🎉 Rock Concert 2025 | 2025-12-31 @ Madison Square Garden | $75

#Event #Live
```

**Character count:** ~75 chars ✅ (well under 500 limit)

## Testing

1. **Restart Python backend:**
   ```bash
   cd backend-py
   python -m uvicorn main:app --host 127.0.0.1 --port 1800 --reload
   ```

2. **Check logs for caption length:**
   ```
   INFO: Generated caption (75 chars): 🎉 Rock Concert 2025 | 2025-12-31...
   ```

3. **Test the flow:**
   - Go to `/auto-share`
   - Fill in event details
   - Submit
   - Caption should be SHORT and post successfully to Mastodon!

## Benefits

✅ **No AI needed** - Uses only form inputs  
✅ **Fast** - Instant caption generation  
✅ **Safe** - Always under character limits  
✅ **Simple** - Easy to read and understand  
✅ **Platform-aware** - Respects each platform's limits  

## Files Modified
- ✅ `backend-py/models/caption_agent.py` - Simplified caption generator
- ✅ `backend-py/main.py` - Platform-specific caption selection

---
**Fixed by**: GitHub Copilot  
**Date**: October 15, 2025
