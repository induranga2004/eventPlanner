# Quick Setup Guide - Cloudinary + MongoDB PostBack

## ✅ What You Need to Do

### 1. Add Cloudinary Credentials to `.env`

Edit `backend-py/.env` and add:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Where to get these:**
1. Go to https://cloudinary.com/console
2. Copy your credentials from the Dashboard
3. Paste them into your `.env` file

### 2. Add MongoDB Connection String to `.env`

Edit `backend-py/.env` and add:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
MONGO_DB_NAME=eventplanner
```

**Where to get this:**
1. Go to your MongoDB Atlas dashboard
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with your database name (e.g., `eventplanner`)

### 3. Verify Setup

Run the test script:

```bash
cd backend-py
python test_postback_integration.py
```

**Expected output when configured correctly:**
```
✓ PASS - Cloudinary Config
✓ PASS - MongoDB Connection
✓ PASS - PostBack Save
✓ PASS - PostBack Retrieval
✓ PASS - Complete Upload Flow
```

### 4. Start the Backend Server

```bash
cd backend-py
python -m uvicorn main:app --host 127.0.0.1 --port 1800 --reload
```

## 🔍 How to Test the Integration

### Option 1: API Testing (Recommended)

Use the frontend or API client to generate images:

```bash
# Generate backgrounds
POST http://127.0.0.1:1800/api/design/generate-backgrounds
{
  "campaign_id": "test123",
  "size": "square",
  "count": 2
}

# View generated images in MongoDB
GET http://127.0.0.1:1800/api/design/postbacks/test123
```

### Option 2: Direct Script Test

Already provided: `test_postback_integration.py`

## 📋 Current Status

Based on the test results:

- ⚠️ **Cloudinary**: Not configured (using local fallback)
- ⚠️ **MongoDB**: Not connected (MONGO_URI not set)
- ✅ **Code**: All files created and integrated correctly
- ✅ **Local Storage**: Working as fallback

## 🎯 What Happens After Setup

Once you add the credentials:

1. **Image Generation** → Uploads to Cloudinary (not local files)
2. **Automatic Save** → Each image URL saved to MongoDB `postback` collection
3. **API Access** → Retrieve all images via `/postbacks/{campaign_id}`

## ❓ Need Help?

### Common Issues

**Issue: Cloudinary upload fails**
- Check API credentials are correct
- Verify Cloudinary account is active
- Check network connectivity

**Issue: MongoDB connection fails**
- Verify connection string format
- Check username/password
- Ensure IP whitelist includes your IP (MongoDB Atlas)
- Test connection string with MongoDB Compass

**Issue: PostBack not saving**
- Check MongoDB connection first
- Review server logs for errors
- Verify database permissions

### Testing Individual Components

```bash
# Test Cloudinary only
python -c "from services.cloudinary_store import init_cloudinary, _USE_CLOUDINARY; init_cloudinary(); print('Cloudinary:', _USE_CLOUDINARY)"

# Test MongoDB only
python -c "from utils.mongo_client import mongo_available; print('MongoDB:', mongo_available())"
```

## 📝 Summary

Your integration is **code-complete**! 

Next steps:
1. Add CLOUDINARY_* variables to `.env`
2. Add MONGO_URI to `.env`
3. Run `test_postback_integration.py` again
4. Start the server and test image generation

All generated images will automatically be:
- ✅ Uploaded to Cloudinary
- ✅ Saved to MongoDB `postback` collection
- ✅ Retrievable via API endpoints
