# Simplified Design API - Background Generation Only

## ✅ UPDATED WORKFLOW

### Previous Flow (Removed)
~~Generate Background → AI Harmonize with Artists → Return Composite~~

### New Flow (Current)
**Generate Background → Send to Frontend Editor → User Manually Composes**

---

## 🎯 What Changed

### **Removed Features:**
- ❌ `/harmonize` endpoint (AI automatic composition)
- ❌ `/start` endpoint (complex variant generation)
- ❌ `/batch-generate` endpoint
- ❌ `harmonize_img2img()` AI blending
- ❌ Automatic artist placement and blending
- ❌ Quality analyzer
- ❌ Text optimizer

### **Kept Features:**
- ✅ `/generate-backgrounds` - AI background generation
- ✅ `/upload` - Manual image upload
- ✅ `/postbacks/{campaign_id}` - Get generation history
- ✅ `/postback/render/{render_id}` - Get specific background
- ✅ MongoDB postback tracking
- ✅ Cloudinary uploads

---

## 🚀 Current API Endpoints

### 1. Generate AI Backgrounds
```http
POST /api/design/generate-backgrounds
```

**Request:**
```json
{
  "campaign_id": "abc123",
  "size": "square",
  "count": 3,
  "user_query": "vibrant concert atmosphere"
}
```

**Response:**
```json
{
  "campaign_id": "abc123",
  "render_id": "xyz789",
  "prompt": "vibrant neon concert atmosphere with purple lighting...",
  "bg_options": [
    {
      "image_url": "https://res.cloudinary.com/.../bg_square_1.png",
      "prompt": "...",
      "model": "FLUX.1-dev",
      "seed": 123456,
      "size": "square"
    },
    ...
  ]
}
```

**What Happens:**
1. Generates AI backgrounds based on event context
2. Uploads each background to Cloudinary
3. Saves metadata to MongoDB `postback` collection
4. Returns URLs for frontend editor

**Frontend Should:**
- Display the generated backgrounds
- Let user select one
- Open editor with selected background
- User manually adds: artists, text, logos, decorations

---

### 2. Upload Image
```http
POST /api/design/upload
```

**Request:**
```json
{
  "image": "data:image/png;base64,iVBOR...",
  "campaign_id": "abc123",
  "name": "final_poster"
}
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/.../upload.png",
  "public_id": "renders/abc123/xyz/final_poster",
  "size": 245678,
  "dimensions": "2048x2048"
}
```

**Use Cases:**
- Upload user-edited final poster
- Upload custom backgrounds
- Upload manually composed designs

---

### 3. Get Campaign Backgrounds
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
      "_id": "...",
      "cloudinary_url": "https://...",
      "prompt": "...",
      "model": "FLUX.1-dev",
      "event_name": "Summer Festival",
      "mood": "neon",
      "created_at": "2025-10-15T12:00:00Z",
      "metadata": {
        "generation_type": "background",
        "for_manual_editing": true
      }
    }
  ]
}
```

**Use Cases:**
- Show generation history
- Let user reuse previous backgrounds
- Build user gallery

---

### 4. Get Specific Background
```http
GET /api/design/postback/render/{render_id}
```

**Response:**
```json
{
  "_id": "...",
  "cloudinary_url": "https://...",
  "prompt": "...",
  ...
}
```

---

## 🎨 Frontend Integration

### Recommended Workflow

#### Step 1: Generate Backgrounds
```javascript
const response = await fetch('/api/design/generate-backgrounds', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaign_id: campaignId,
    size: 'square',
    count: 3
  })
});

const { bg_options } = await response.json();
```

#### Step 2: Display Options
```jsx
<div className="background-options">
  {bg_options.map(bg => (
    <img 
      key={bg.seed}
      src={bg.image_url}
      onClick={() => openEditor(bg)}
    />
  ))}
</div>
```

#### Step 3: Open Editor
```javascript
function openEditor(background) {
  editor.loadBackground(background.image_url);
  // User now manually:
  // - Adds artist photos
  // - Positions text
  // - Adds logos/decorations
  // - Adjusts colors/filters
}
```

#### Step 4: Export Final Design
```javascript
const finalImage = editor.exportAsDataURL();

// Upload to Cloudinary
await fetch('/api/design/upload', {
  method: 'POST',
  body: JSON.stringify({
    image: finalImage,
    campaign_id: campaignId,
    name: 'final_poster'
  })
});
```

---

## 📦 What Gets Saved to MongoDB

### Background Generation
```json
{
  "campaign_id": "abc123",
  "render_id": "xyz789",
  "cloudinary_url": "https://res.cloudinary.com/.../bg.png",
  "size": "square",
  "prompt": "vibrant neon concert atmosphere",
  "model": "FLUX.1-dev",
  "seed": 123456,
  "event_name": "Summer Festival",
  "mood": "neon",
  "palette": ["#9D00FF", "#00FFD1"],
  "artists": ["DJ Shadow", "The Beats"],
  "metadata": {
    "generation_type": "background",
    "for_manual_editing": true,
    "prompt_source": "ai_enhanced"
  },
  "created_at": "2025-10-15T12:00:00Z"
}
```

### Manual Upload
```json
{
  "campaign_id": "abc123",
  "render_id": "abc456",
  "cloudinary_url": "https://res.cloudinary.com/.../final.png",
  "size": "2048x2048",
  "metadata": {
    "generation_type": "manual_upload",
    "original_name": "final_poster"
  },
  "created_at": "2025-10-15T13:00:00Z"
}
```

---

## 🎯 Benefits of Manual Editing

### Why Remove AI Harmonization?

1. **✅ More Control** - Users have full creative control
2. **✅ Faster Iteration** - No waiting for AI processing
3. **✅ Better Quality** - Human composition often better than AI
4. **✅ Simpler System** - Less complexity, fewer dependencies
5. **✅ Lower Costs** - Fewer AI API calls
6. **✅ More Predictable** - No AI unpredictability

### What Users Can Do Manually:

- 🎨 Choose exact artist placement
- 📝 Position and style text perfectly  
- 🖼️ Add custom graphics and logos
- 🎭 Apply filters and effects
- 🌈 Fine-tune colors
- ⚡ Real-time preview
- 💾 Save multiple versions

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Required for background generation
OPENAI_API_KEY=your_openai_key
AI_ENABLE_FLUX=true
HF_TOKEN=your_hugging_face_token

# Required for storage
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret

# Required for postback tracking
MONGO_URI=mongodb+srv://...
MONGO_DB_NAME=eventplanner
```

---

## 📊 MongoDB Collection

**Collection:** `postback`

**Documents:** Background images only (no harmonized composites)

**Indexes:**
```javascript
db.postback.createIndex({ campaign_id: 1 })
db.postback.createIndex({ render_id: 1 })
db.postback.createIndex({ created_at: -1 })
```

---

## 🧪 Testing

### Test Background Generation
```bash
curl -X POST http://localhost:1800/api/design/generate-backgrounds \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "test123",
    "size": "square",
    "count": 2
  }'
```

### Test Upload
```bash
curl -X POST http://localhost:1800/api/design/upload \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0K...",
    "campaign_id": "test123",
    "name": "test_upload"
  }'
```

### Test Retrieval
```bash
curl http://localhost:1800/api/design/postbacks/test123
```

---

## 📝 Migration Notes

### For Existing Code

**Old harmonization code** is backed up at:
- `routers/design_old_with_harmonize.py.bak`

**If you need to restore:**
```bash
cd backend-py/routers
cp design_old_with_harmonize.py.bak design.py
```

**Frontend Changes Needed:**
1. Remove calls to `/harmonize`
2. Remove calls to `/start`
3. Update to use `/generate-backgrounds` only
4. Implement manual editor for composition

---

## 🎉 Summary

### Current System:
- ✅ **Generate** - AI creates beautiful backgrounds
- ✅ **Store** - Upload to Cloudinary
- ✅ **Track** - Save to MongoDB
- ✅ **Retrieve** - Get generation history
- ✅ **Simple** - Clean, focused API

### User Workflow:
1. Request background generation
2. Select favorite background
3. Open in editor
4. Manually compose poster
5. Export and upload final design

**Everything is simpler, faster, and more user-controlled!** 🚀
