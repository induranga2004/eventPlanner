#!/usr/bin/env python3
"""
Test script for advanced event planner architecture
"""
import requests
import json
from datetime import date, timedelta

BASE_URL = "http://127.0.0.1:8000"

def test_advanced_architecture():
    print("🚀 Testing Advanced Event Planner Architecture")
    print("=" * 50)
    
    try:
        # Test 1: Create a campaign
        print("\n1. Creating campaign...")
        campaign_data = {"name": "My Wedding 2025"}
        response = requests.post(f"{BASE_URL}/campaigns", json=campaign_data)
        if response.status_code == 200:
            campaign = response.json()
            campaign_id = campaign["id"]
            print(f"✅ Campaign created: {campaign['name']} (ID: {campaign_id})")
        else:
            print(f"❌ Campaign creation failed: {response.status_code}")
            return
        
        # Test 2: Generate advanced event plan
        print("\n2. Generating advanced event plan...")
        event_date = (date.today() + timedelta(days=90)).isoformat()
        plan_data = {
            "campaign_id": campaign_id,
            "event_name": "Sarah & John's Wedding",
            "event_type": "wedding",
            "city": "Colombo",
            "venue": "",
            "event_date": event_date,
            "attendees_estimate": 150,
            "audience_profile": "Close family and friends, traditional ceremony",
            "special_instructions": "Vegetarian menu preferred",
            "total_budget_lkr": 2000000,
            "number_of_concepts": 3
        }
        
        response = requests.post(f"{BASE_URL}/campaigns/{campaign_id}/planner/generate", json=plan_data)
        if response.status_code == 200:
            plan = response.json()
            print(f"✅ Event plan generated with {len(plan['concepts'])} concepts")
            print(f"   - Suggested venues: {len(plan['derived']['suggested_venues'])}")
            print(f"   - Timeline items: {len(plan['timeline'])}")
            print(f"   - Budget per person: ~LKR {plan['concepts'][0]['total_lkr'] // plan_data['attendees_estimate']:,}")
        else:
            print(f"❌ Plan generation failed: {response.status_code}")
            print(response.text)
            return
        
        # Test 3: Test venue suggestions
        print("\n3. Testing venue suggestions...")
        response = requests.get(f"{BASE_URL}/venues/suggest?city=Colombo&event_type=wedding&top_k=5")
        if response.status_code == 200:
            venues = response.json()
            print(f"✅ Found {len(venues)} venue suggestions")
            for venue in venues[:2]:  # Show first 2
                print(f"   - {venue.get('name', 'N/A')} (Rating: {venue.get('rating', 'N/A')})")
        else:
            print(f"❌ Venue suggestions failed: {response.status_code}")
        
        # Test 4: Test CrewAI content generation
        print("\n4. Testing CrewAI content generation...")
        content_data = {"topic": "wedding planning tips"}
        response = requests.post(f"{BASE_URL}/generate-content", json=content_data)
        if response.status_code == 200:
            content = response.json()
            print(f"✅ Generated content: {len(content['content'])} characters")
            print(f"   Preview: {content['content'][:100]}...")
        else:
            print(f"❌ Content generation failed: {response.status_code}")
        
        print("\n🎉 Advanced architecture tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the server is running on port 8000")
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

if __name__ == "__main__":
    test_advanced_architecture()