#!/usr/bin/env python3
"""
Test the new catering endpoint functionality
"""
import requests
import json

def test_catering_endpoint():
    print("🍽️ Testing OpenAI-Powered Catering Endpoint")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:8000"
    
    # Test catering suggestions
    params = {
        "city": "Colombo",
        "event_type": "wedding", 
        "venue": "Shangri-La Ballroom",
        "attendees": 150,
        "total_budget_lkr": 2000000
    }
    
    try:
        print(f"🔍 Requesting catering suggestions for {params['event_type']} in {params['city']}")
        print(f"   Venue: {params['venue']}")
        print(f"   Attendees: {params['attendees']}")
        print(f"   Budget: LKR {params['total_budget_lkr']:,}")
        
        response = requests.get(f"{base_url}/catering/suggest", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Catering suggestions received!")
            
            # Show in-house catering if available
            if data.get("inhouse"):
                inhouse = data["inhouse"]
                print(f"\n🏨 In-house Catering Available:")
                print(f"   Venue: {inhouse.get('name', 'N/A')}")
                print(f"   Cost per person: LKR {inhouse.get('pp_lkr', 'N/A'):,}")
                print(f"   Website: {inhouse.get('website', 'N/A')}")
            
            # Show external options
            if data.get("external_options"):
                print(f"\n🍴 External Catering Options ({len(data['external_options'])}):")
                for i, option in enumerate(data["external_options"][:3], 1):
                    print(f"   {i}. {option.get('name', 'Unknown')}")
                    print(f"      Type: {option.get('type', 'N/A')}")
                    print(f"      Cost: LKR {option.get('pp_min_lkr', 0):,} - {option.get('pp_max_lkr', 0):,} per person")
                    print(f"      Rating: {option.get('rating', 'N/A')}")
                    if option.get('website'):
                        print(f"      Website: {option['website']}")
            
            # Show stall plan for concerts
            if data.get("stall_plan"):
                stall_plan = data["stall_plan"]
                print(f"\n🎪 Food Stall Plan:")
                print(f"   Recommended stalls: {stall_plan.get('stall_count', 'N/A')}")
                print(f"   Suggested mix: {', '.join(stall_plan.get('suggested_mix', []))}")
                print(f"   Per person spend: LKR {stall_plan.get('per_person_spend_lkr_range', [0, 0])[0]:,} - {stall_plan.get('per_person_spend_lkr_range', [0, 0])[1]:,}")
            
            # Show AI notes if available
            if data.get("notes"):
                print(f"\n💡 AI Recommendations:")
                for note in data["notes"]:
                    print(f"   • {note}")
            
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the server is running on port 8000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_concert_catering():
    print("\n🎵 Testing Concert Catering (Food Stalls)")
    print("=" * 45)
    
    params = {
        "city": "Colombo",
        "event_type": "concert",
        "attendees": 500,
        "total_budget_lkr": 1000000
    }
    
    try:
        response = requests.get("http://127.0.0.1:8000/catering/suggest", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Concert catering suggestions received!")
            
            if data.get("stall_plan"):
                stall_plan = data["stall_plan"]
                print(f"   🎪 Recommended stalls: {stall_plan.get('stall_count', 'N/A')}")
                print(f"   🍽️ Food categories: {', '.join(stall_plan.get('suggested_mix', []))}")
                
        else:
            print(f"❌ Concert catering test failed: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Concert test failed: {e}")

if __name__ == "__main__":
    test_catering_endpoint()
    test_concert_catering()
    print("\n🎉 Catering endpoint testing complete!")
    print("\n💡 Next steps:")
    print("   • Add your OpenAI API key to .env for AI-enhanced recommendations")
    print("   • Check the API docs at http://127.0.0.1:8000/docs")
    print("   • The endpoint works with CSV data even without OpenAI")