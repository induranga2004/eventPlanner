#!/usr/bin/env python3
"""
Test OpenAI integration for venue finder
"""
import requests
import json
import os
import sys

# Add the backend-py directory to the path to import modules
sys.path.append('backend-py')

def test_openai_venues():
    print("🤖 Testing OpenAI Venue Integration")
    print("=" * 40)
    
    # Test the venue suggestions endpoint
    url = "http://127.0.0.1:8000/venues/suggest"
    params = {
        "city": "Colombo",
        "event_type": "wedding",
        "top_k": 5
    }
    
    try:
        print(f"🔍 Requesting venues for {params['event_type']} in {params['city']}...")
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            venues = response.json()
            print(f"✅ Found {len(venues)} venues")
            
            for i, venue in enumerate(venues, 1):
                print(f"\n{i}. {venue.get('name', 'Unknown')}")
                print(f"   Type: {venue.get('type', 'N/A')}")
                print(f"   Capacity: {venue.get('capacity', 'N/A')}")
                print(f"   Rating: {venue.get('rating', 'N/A')}")
                print(f"   Source: {venue.get('source', 'csv')}")
                
                # Show AI enhancements if available
                if venue.get('ai_insights'):
                    print(f"   AI Insights: {venue['ai_insights']}")
                if venue.get('suitability_score'):
                    print(f"   Suitability Score: {venue['suitability_score']}/100")
                    
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the server is running on port 8000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

def check_openai_config():
    print("\n🔧 OpenAI Configuration Check")
    print("=" * 30)
    
    # Check if OpenAI API key is set
    if os.getenv("OPENAI_API_KEY"):
        print("✅ OPENAI_API_KEY is set")
    else:
        print("⚠️  OPENAI_API_KEY not found in environment")
        print("   To enable AI-enhanced venue recommendations:")
        print("   1. Get an API key from https://platform.openai.com/api-keys")
        print("   2. Create a .env file in backend-py/ with:")
        print("      OPENAI_API_KEY=your_api_key_here")

if __name__ == "__main__":
    check_openai_config()
    test_openai_venues()
