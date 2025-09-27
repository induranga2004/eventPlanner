import requests
import json

print("🎭 Testing Dynamic Concept Names by Event Type")
print("=" * 60)

BASE_URL = "http://127.0.0.1:1800"

def test_event_type_concepts(event_type, event_name):
    try:
        print(f"\n🎯 Testing {event_type.upper()} Event:")
        print("-" * 30)
        
        # Create campaign
        campaign_response = requests.post(f"{BASE_URL}/campaigns", json={
            "name": f"Test {event_name}"
        })
        
        if campaign_response.status_code != 200:
            print(f"❌ Campaign creation failed: {campaign_response.status_code}")
            return
            
        campaign = campaign_response.json()
        campaign_id = campaign["id"]
        
        # Generate concepts for this event type
        plan_data = {
            "campaign_id": campaign_id,
            "event_name": f"Test {event_name}",
            "event_type": event_type,
            "city": "Colombo",
            "venue": "",
            "event_date": "2025-12-01",
            "attendees_estimate": 150,
            "audience_profile": f"People attending {event_name}",
            "special_instructions": "",
            "total_budget_lkr": 2000000,
            "number_of_concepts": 4
        }
        
        plan_response = requests.post(f"{BASE_URL}/campaigns/{campaign_id}/planner/generate", json=plan_data)
        
        if plan_response.status_code == 200:
            plan_result = plan_response.json()
            print(f"✅ Generated concepts for {event_type}:")
            
            for concept in plan_result["concepts"]:
                print(f"   🎨 {concept['id']}: {concept['title']}")
                
        else:
            print(f"❌ Failed to generate concepts: {plan_response.status_code}")
            print(f"Error: {plan_response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

# Test different event types
test_cases = [
    ("wedding", "Wedding Ceremony"),
    ("birthday", "Birthday Party"), 
    ("concert", "Music Concert"),
    ("corporate", "Corporate Event"),
    ("graduation", "Graduation Ceremony")
]

for event_type, event_name in test_cases:
    test_event_type_concepts(event_type, event_name)

print(f"\n🎉 Dynamic concept naming test completed!")
print(f"📊 Each event type should show unique concept names!")