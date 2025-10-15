"""
Test script to verify Cloudinary + MongoDB postback integration

This script tests:
1. Cloudinary configuration
2. MongoDB connection
3. PostBack service functionality
4. End-to-end image upload -> MongoDB save flow
"""

import sys
import os

# Add backend-py to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.cloudinary_store import init_cloudinary, upload_image_bytes, public_id, _USE_CLOUDINARY
from services.postback_service import postback_service
from models.postback import PostBackCreate
from utils.mongo_client import mongo_available, get_database
from PIL import Image
import io


def test_cloudinary_config():
    """Test Cloudinary configuration"""
    print("\n=== Testing Cloudinary Configuration ===")
    init_cloudinary()
    
    if _USE_CLOUDINARY:
        print("✓ Cloudinary is configured and ready")
        print(f"  Cloud Name: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
        return True
    else:
        print("✗ Cloudinary is NOT configured")
        print("  Will use local storage fallback")
        return False


def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\n=== Testing MongoDB Connection ===")
    
    if mongo_available():
        print("✓ MongoDB is connected")
        try:
            db = get_database()
            print(f"  Database: {db.name}")
            collections = db.list_collection_names()
            print(f"  Collections: {', '.join(collections) if collections else 'None'}")
            return True
        except Exception as e:
            print(f"✗ Error accessing database: {e}")
            return False
    else:
        print("✗ MongoDB is NOT connected")
        print("  Check MONGO_URI in .env file")
        return False


def test_postback_save():
    """Test saving a postback record to MongoDB"""
    print("\n=== Testing PostBack Save ===")
    
    try:
        # Create test data
        test_postback = PostBackCreate(
            campaign_id="test_campaign_123",
            render_id="test_render_456",
            cloudinary_url="https://res.cloudinary.com/demo/test_image.png",
            size="square",
            prompt="Test prompt for integration",
            model="test_model",
            event_name="Test Event",
            mood="neon",
            palette=["#9D00FF", "#00FFD1"],
            metadata={"test": True}
        )
        
        # Save to MongoDB
        result = postback_service.save_postback(test_postback)
        
        if result["success"]:
            print("✓ PostBack saved successfully")
            print(f"  MongoDB ID: {result['mongo_id']}")
            print(f"  Campaign ID: {test_postback.campaign_id}")
            print(f"  Render ID: {test_postback.render_id}")
            return True
        else:
            print(f"✗ PostBack save failed: {result['message']}")
            return False
            
    except Exception as e:
        print(f"✗ Error saving postback: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_postback_retrieval():
    """Test retrieving postback records from MongoDB"""
    print("\n=== Testing PostBack Retrieval ===")
    
    try:
        # Retrieve by campaign ID
        campaign_id = "test_campaign_123"
        postbacks = postback_service.get_postbacks_by_campaign(campaign_id)
        
        print(f"✓ Retrieved {len(postbacks)} postback(s) for campaign {campaign_id}")
        
        if postbacks:
            latest = postbacks[-1]
            print(f"  Latest postback:")
            print(f"    Cloudinary URL: {latest.get('cloudinary_url')}")
            print(f"    Event Name: {latest.get('event_name')}")
            print(f"    Created At: {latest.get('created_at')}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error retrieving postbacks: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_image_upload_flow():
    """Test complete flow: generate image -> upload to Cloudinary -> save to MongoDB"""
    print("\n=== Testing Complete Upload Flow ===")
    
    try:
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='#9D00FF')
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        img_bytes = buf.getvalue()
        
        # Upload to Cloudinary
        campaign_id = "flow_test_campaign"
        render_id = "flow_test_render"
        pid = public_id(campaign_id, render_id, "test_image")
        
        cloudinary_url = upload_image_bytes(img_bytes, pid, "png")
        print(f"✓ Image uploaded to: {cloudinary_url}")
        
        # Save to MongoDB
        postback_data = PostBackCreate(
            campaign_id=campaign_id,
            render_id=render_id,
            cloudinary_url=cloudinary_url,
            size="100x100",
            prompt="Test image upload flow",
            model="test_generator",
            metadata={"flow_test": True}
        )
        
        result = postback_service.save_postback(postback_data)
        
        if result["success"]:
            print(f"✓ Complete flow successful!")
            print(f"  Cloudinary URL: {cloudinary_url}")
            print(f"  MongoDB ID: {result['mongo_id']}")
            return True
        else:
            print(f"✗ MongoDB save failed: {result['message']}")
            return False
            
    except Exception as e:
        print(f"✗ Error in upload flow: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("CLOUDINARY + MONGODB POSTBACK INTEGRATION TEST")
    print("=" * 60)
    
    results = {
        "Cloudinary Config": test_cloudinary_config(),
        "MongoDB Connection": test_mongodb_connection(),
        "PostBack Save": test_postback_save(),
        "PostBack Retrieval": test_postback_retrieval(),
        "Complete Upload Flow": test_image_upload_flow(),
    }
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 60)
    
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
    else:
        print("⚠️  SOME TESTS FAILED - Check configuration")
    
    print("=" * 60)


if __name__ == "__main__":
    main()
