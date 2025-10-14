# 🔧 Troubleshooting Guide - Issues Fixed!

## Issues Identified and Fixed

### ❌ Issue 1: "No providers found for this category in Colombo"

**Root Cause:** `MONGO_URI` environment variable was not set in `.env` file

**Symptoms:**
- Provider modal shows "No providers found" message
- Backend logs show: `Mongo unavailable for role venue: MONGO_URI environment variable is not set`
- All provider endpoints return empty arrays

**Fix Applied:** ✅
1. Added `MONGO_URI=` to `.env` file with instructions
2. Updated `.env.example` with MongoDB connection examples

**Action Required:** 🚨 **YOU MUST ADD YOUR MONGODB CONNECTION STRING**

---

### ❌ Issue 2: Only 1 Plan Generated Instead of 4

**Root Cause:** `concept_ids()` function in `planner/service.py` called `list_concepts()` without passing the limit parameter

**Symptoms:**
- User requests 4 concepts
- Only 1 concept is generated and returned
- Frontend shows single card instead of 4

**Fix Applied:** ✅
Changed:
```python
# BEFORE (WRONG)
def concept_ids(n: int) -> List[str]:
    concepts = list_concepts()  # ❌ No limit passed
    return [record.concept_id for record in concepts[: max(0, n)]]

# AFTER (CORRECT)
def concept_ids(n: int) -> List[str]:
    concepts = list_concepts(limit=n)  # ✅ Limit passed correctly
    return [record.concept_id for record in concepts]
```

**Action Required:** ✅ **ALREADY FIXED - NO ACTION NEEDED**

---

## 🚀 How to Fix MongoDB Connection

### Step 1: Get Your MongoDB Connection String

#### Option A: Local MongoDB
If you have MongoDB running locally:
```
mongodb://localhost:27017/eventplanner
```

#### Option B: MongoDB Atlas (Cloud)
If you're using MongoDB Atlas:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eventplanner?retryWrites=true&w=majority
```

**Get your connection string:**
1. Go to MongoDB Atlas → Clusters → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your credentials

---

### Step 2: Add to .env File

**File:** `backend-py/.env`

**Add this line:**
```bash
MONGO_URI=mongodb://localhost:27017/eventplanner
# OR
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/eventplanner
```

**Full .env example:**
```bash
# OpenAI API Key
OPENAI_API_KEY=sk-proj-...your-key...

# MongoDB Connection (ADD THIS!)
MONGO_URI=mongodb://localhost:27017/eventplanner

# Other settings...
CLOUDINARY_CLOUD_NAME=dqc6bds8p
# ... rest of file
```

---

### Step 3: Verify MongoDB Connection

Run this test script:
```bash
cd backend-py
python -c "
from utils.mongo_client import mongo_available, get_users_collection
if mongo_available():
    collection = get_users_collection()
    count = collection.count_documents({})
    print(f'✅ MongoDB connected! Found {count} documents in users collection')
    
    venue_count = collection.count_documents({'role': 'venue'})
    print(f'   - Venues: {venue_count}')
else:
    print('❌ MongoDB not available. Check MONGO_URI in .env')
"
```

**Expected output (SUCCESS):**
```
✅ MongoDB connected! Found 47 documents in users collection
   - Venues: 12
```

**If you see error:**
```
❌ MongoDB not available. Check MONGO_URI in .env
```
→ Go back to Step 1 and check your connection string

---

### Step 4: Restart Backend

**IMPORTANT:** You MUST restart the backend server after changing `.env`

```bash
# Stop current server (Ctrl+C)
cd backend-py
uvicorn main:app --reload --port 1800
```

---

### Step 5: Test Provider Endpoints

```bash
# Test venue endpoint
curl "http://localhost:1800/planner/providers/venue?city=Colombo&limit=5"

# Should return venues from MongoDB:
# [{"id": "...", "name": "Hambantota Marina Event Deck", ...}]
```

**If still showing empty `[]`:**
1. Check MongoDB has documents with `role: "venue"`
2. Verify city field matches (case-insensitive search)
3. Check backend logs for errors

---

## 🎯 Testing Checklist

### Test 1: Concept Generation (4 Plans)
1. Open frontend: http://localhost:5173
2. Fill wizard form
3. Set "Number of Concepts" to **4**
4. Click "Generate Plans"
5. **Expected:** See 4 concept cards with different budget splits

**If still only 1 concept:**
- Backend change may not have taken effect
- Restart backend: `uvicorn main:app --reload --port 1800`

---

### Test 2: Provider Fetching
1. Generate 4 concepts
2. Click any concept card
3. Modal opens → Click "Venue" tab
4. **Expected:** See venues from MongoDB (not "No providers found")

**If still showing "No providers found":**
- MONGO_URI not set correctly → Check Step 2
- Backend not restarted → Check Step 4
- No venues in MongoDB → Add test venues (see below)

---

## 📊 Adding Test Data to MongoDB

If your MongoDB `users` collection is empty, add test data:

### Test Venue
```javascript
db.users.insertOne({
  email: "test.venue@example.com",
  role: "venue",
  name: "Test Concert Hall",
  venueAddress: "123 Main Street, Colombo",
  capacity: 500,
  standardRate: 100000,
  phone: "+94 11 234 5678",
  subscriptionPlan: "free",
  createdAt: new Date()
})
```

### Test Musician
```javascript
db.users.insertOne({
  email: "test.musician@example.com",
  role: "musician",
  name: "John Doe",
  genres: ["Rock", "Blues"],
  experience: "10 years",
  standardRate: 50000,
  phone: "+94 77 123 4567",
  subscriptionPlan: "free",
  createdAt: new Date()
})
```

### Test Band
```javascript
db.users.insertOne({
  email: "test.band@example.com",
  role: "music_band",
  bandName: "The Test Band",
  genres: ["Jazz", "Fusion"],
  members: 5,
  standardRate: 150000,
  phone: "+94 77 999 8888",
  subscriptionPlan: "free",
  createdAt: new Date()
})
```

---

## 🐛 Common Errors & Solutions

### Error: "pymongo is not installed"
**Solution:**
```bash
cd backend-py
pip install pymongo
```

---

### Error: "MongoClient is not defined"
**Solution:**
```bash
pip install pymongo
# Then restart backend
```

---

### Error: "Unable to connect to MongoDB"
**Possible causes:**
1. MongoDB server not running
2. Wrong connection string
3. Network firewall blocking connection

**Solutions:**
```bash
# Check if MongoDB is running (local)
mongod --version

# Test connection manually
mongosh "mongodb://localhost:27017"

# Check MongoDB Atlas whitelist (if cloud)
# → Go to Atlas → Network Access → Add your IP
```

---

### Error: "Authentication failed"
**Solution:**
Check username/password in connection string:
```
mongodb://USERNAME:PASSWORD@host:port/database
# Make sure USERNAME and PASSWORD are correct
# Escape special characters: @ → %40, : → %3A
```

---

## ✅ Verification Commands

### Check .env file has MONGO_URI
```powershell
cd backend-py
Get-Content .env | Select-String "MONGO_URI"
```

**Expected output:**
```
MONGO_URI=mongodb://localhost:27017/eventplanner
```

---

### Test MongoDB Connection (Python)
```bash
python -c "from utils.mongo_client import mongo_available; print('✅ Connected' if mongo_available() else '❌ Not connected')"
```

---

### Test Provider Fetch (Python)
```bash
python -c "from utils.provider_repository import list_venues; venues = list_venues(city='Colombo', limit=5); print(f'Found {len(venues)} venues')"
```

---

### Test Concept Generation (Python)
```bash
python -c "from utils.concept_repository import list_concepts; concepts = list_concepts(limit=4); print(f'Generated {len(concepts)} concepts')"
```

---

## 🎉 Success Indicators

### ✅ All Fixed When You See:

1. **Backend logs NO LONGER show:**
   ```
   Mongo unavailable for role venue: MONGO_URI environment variable is not set
   ```

2. **Provider endpoint returns data:**
   ```bash
   curl "http://localhost:1800/planner/providers/venue?limit=1"
   # [{"id": "...", "name": "...", "capacity": 500}]
   ```

3. **Frontend modal shows venues:**
   ```
   Venue Tab:
   ✅ Hambantota Marina Event Deck
   ✅ Colombo Grand Ballroom
   ✅ Galle Fort Rooftop
   ```

4. **4 concepts generated:**
   ```
   ✅ Concept #1: Venue-focused (40% venue)
   ✅ Concept #2: Music-heavy (45% music)
   ✅ Concept #3: Lighting showcase (25% lighting)
   ✅ Concept #4: Premium sound (20% sound)
   ```

---

## 📝 Summary of Changes

### Files Modified:
1. ✅ `backend-py/.env` - Added MONGO_URI placeholder
2. ✅ `backend-py/.env.example` - Added MongoDB connection examples
3. ✅ `backend-py/planner/service.py` - Fixed concept_ids() to pass limit

### What Was Wrong:
1. ❌ MONGO_URI environment variable not set → Providers couldn't be fetched
2. ❌ concept_ids() didn't pass limit → Only 1 concept generated

### What's Fixed:
1. ✅ .env has MONGO_URI field (you need to fill it)
2. ✅ concept_ids() now passes limit=n correctly
3. ✅ Will generate 4 concepts when requested

---

## 🚀 Next Steps

1. **Add your MongoDB connection string to `.env`** (Step 2 above)
2. **Restart backend server** (Step 4 above)
3. **Test provider fetching** (Step 5 above)
4. **Test concept generation** (Test 1 above)
5. **Test provider modal** (Test 2 above)

---

## 📞 Still Having Issues?

If providers still don't show after adding MONGO_URI:

1. **Check MongoDB has users:**
   ```bash
   mongosh "your-connection-string"
   use eventplanner
   db.users.countDocuments()  // Should be > 0
   ```

2. **Check user roles:**
   ```bash
   db.users.distinct("role")  // Should include "venue", "musician", etc.
   ```

3. **Check backend logs:**
   - Look for "Mongo unavailable" messages
   - Look for connection errors
   - Check port 1800 is accessible

4. **Restart everything:**
   ```bash
   # Stop backend (Ctrl+C)
   # Stop frontend (Ctrl+C)
   
   # Start backend
   cd backend-py
   uvicorn main:app --reload --port 1800
   
   # Start frontend (new terminal)
   cd frontend
   npm run dev
   ```

---

**Last Updated:** October 14, 2025  
**Status:** ✅ **Issues identified and fixed. Add MONGO_URI to complete setup.**
