# PostBack Integration: Cloudinary + MongoDB

This document explains the new **PostBack** system that automatically saves generated poster images to MongoDB after uploading to Cloudinary.

## Overview

When the AI Visual Composer generates images (backgrounds, harmonized composites, etc.), the system now:

1. **Generates** the image using AI (FLUX models)
2. **Uploads** to Cloudinary for CDN delivery
3. **Saves** metadata and Cloudinary URL to MongoDB `postback` collection

## Architecture

```
┌─────────────────┐
│  Design API     │
│  /api/design    │
└────────┬────────┘
         │
         ├──> Generate Image (AI/Gradient)
         │
         ├──> Upload to Cloudinary
         │    └─> Returns: cloudinary_url
         │
         └──> Save to MongoDB
              ├─> Collection: "postback"
              └─> Data: PostBackRecord
```

## Files Created

### 1. Model: `models/postback.py`
Defines the data structure for postback records:

```python
PostBackRecord:
  - campaign_id: str
  - render_id: str
  - cloudinary_url: str (primary image URL)
  - background_url: Optional[str]
  - composite_url: Optional[str]
  - size: str
  - prompt: Optional[str]
  - model: Optional[str]
  - seed: Optional[int]
  - event_name: Optional[str]
  - event_date: Optional[str]
  - mood: Optional[str]
  - palette: List[str]
  - artists: List[str]
  - metadata: Dict[str, Any]
  - created_at: datetime
```

### 2. Service: `services/postback_service.py`
Handles MongoDB operations:

- `save_postback(postback_data)` - Save new record
- `get_postbacks_by_campaign(campaign_id)` - Get all records for a campaign
- `get_postback_by_render_id(render_id)` - Get specific record

### 3. Updated: `routers/design.py`
All generation endpoints now save to MongoDB:

- `/generate-backgrounds` - Saves each generated background
- `/harmonize` - Saves harmonized composites (both simple and advanced)
- `/upload` - Saves manually uploaded images

## New API Endpoints

### Get Campaign Postbacks
```http
GET /api/design/postbacks/{campaign_id}
```

**Response:**
```json
{
  "campaign_id": "abc123",
  "count": 5,
  "postbacks": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "campaign_id": "abc123",
      "render_id": "xyz789",
      "cloudinary_url": "https://res.cloudinary.com/.../image.png",
      "size": "square",
      "prompt": "vibrant neon concert poster",
      "model": "FLUX.1-dev",
      "event_name": "Summer Music Festival",
      "mood": "neon",
      "palette": ["#9D00FF", "#00FFD1"],
      "created_at": "2025-10-15T12:00:00Z"
    }
  ]
}
```

### Get Specific Postback
```http
GET /api/design/postback/render/{render_id}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "campaign_id": "abc123",
  "render_id": "xyz789",
  "cloudinary_url": "https://res.cloudinary.com/.../image.png",
  ...
}
```

## Configuration

### Required Environment Variables

**Cloudinary** (in `backend-py/.env`):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**MongoDB** (in `backend-py/.env`):
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
MONGO_DB_NAME=eventplanner  # Optional if included in URI
```

## Testing

Run the integration test:

```bash
cd backend-py
python test_postback_integration.py
```

This will test:
- ✓ Cloudinary configuration
- ✓ MongoDB connection
- ✓ PostBack save functionality
- ✓ PostBack retrieval
- ✓ Complete upload flow

## Usage Example

### 1. Generate Backgrounds
```javascript
// Frontend request
const response = await fetch('/api/design/generate-backgrounds', {
  method: 'POST',
  body: JSON.stringify({
    campaign_id: 'campaign123',
    size: 'square',
    count: 3,
    user_query: 'vibrant concert atmosphere'
  })
});

// Automatically saved to MongoDB postback collection
```

### 2. Retrieve Generated Images
```javascript
// Get all images for a campaign
const postbacks = await fetch('/api/design/postbacks/campaign123');

console.log(postbacks.postbacks);
// [
//   { cloudinary_url: 'https://...', prompt: '...', ... },
//   { cloudinary_url: 'https://...', prompt: '...', ... },
//   ...
// ]
```

## Data Flow

1. **User Requests Image Generation** 
   → `/api/design/generate-backgrounds`

2. **Backend Generates Image**
   → AI model or gradient fallback

3. **Upload to Cloudinary**
   → `services/cloudinary_store.upload_image_bytes()`
   → Returns: `https://res.cloudinary.com/.../image.png`

4. **Save to MongoDB**
   → `services/postback_service.save_postback()`
   → Collection: `postback`
   → Includes: URL, prompt, metadata, timestamp

5. **Frontend Receives Response**
   → Contains Cloudinary URL for immediate display

6. **Later: Retrieve History**
   → `/api/design/postbacks/{campaign_id}`
   → Get all generated images with metadata

## Benefits

✅ **Complete Audit Trail** - Every generated image is tracked  
✅ **Campaign History** - View all images for a campaign  
✅ **Metadata Preservation** - Prompts, seeds, models stored  
✅ **Analytics Ready** - Track generation patterns, popular styles  
✅ **User Gallery** - Build user-facing image libraries  
✅ **Debugging** - Trace issues with generation parameters  

## MongoDB Collection Structure

**Collection Name:** `postback`

**Indexes (recommended):**
```javascript
db.postback.createIndex({ campaign_id: 1 })
db.postback.createIndex({ render_id: 1 })
db.postback.createIndex({ created_at: -1 })
db.postback.createIndex({ campaign_id: 1, created_at: -1 })
```

## Error Handling

- If **Cloudinary fails** → Image generation fails (exception raised)
- If **MongoDB fails** → Image still uploaded to Cloudinary, warning logged
- Non-critical: System continues functioning even if MongoDB save fails

## Future Enhancements

- 🔄 Background job to cleanup old postbacks
- 📊 Analytics dashboard for generation trends
- 🎨 User galleries with filtering by style/mood
- 🔍 Search postbacks by prompt text
- 📸 Thumbnail generation for quick preview
- 🗑️ Soft delete with retention policies

## Troubleshooting

### MongoDB Not Saving

Check:
1. `MONGO_URI` is set in `.env`
2. MongoDB cluster is accessible
3. Database user has write permissions
4. Run: `python test_postback_integration.py`

### Cloudinary Not Uploading

Check:
1. All `CLOUDINARY_*` vars are set in `.env`
2. API credentials are correct
3. Cloudinary account has storage quota
4. Run: `python test_postback_integration.py`

## Support

For issues or questions:
- Check logs: Look for `logger.error` messages in console
- Test connection: Run `test_postback_integration.py`
- Review `.env`: Ensure all required variables are set
