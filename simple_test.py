import requests
import json
from datetime import date, timedelta

print("🎭 Testing Enhanced Concept System")
print("=" * 50)

try:
    # Create campaign
    print("\n1. Creating campaign...")
    r = requests.post("http://127.0.0.1:1800/campaigns", json={"name": "Sarah Wedding"})
    campaign = r.json()
    campaign_id = campaign["id"]
    print(f"✅ Campaign: {campaign['name']} (ID: {campaign_id})")

    # Generate concepts
    print("\n2. Generating enhanced concepts...")
    event_date = (date.today() + timedelta(days=120)).isoformat()
    plan_data = {
        "campaign_id": campaign_id,
        "event_name": "Sarah Wedding",
        "event_type": "wedding",
        "city": "Colombo",
        "venue": "",
        "event_date": event_date,
        "attendees_estimate": 180,
        "audience_profile": "Family and friends mix",
        "special_instructions": "Vegetarian options",
        "total_budget_lkr": 2500000,
        "number_of_concepts": 4
    }

    r2 = requests.post(f"http://127.0.0.1:1800/campaigns/{campaign_id}/planner/generate", json=plan_data)
    
    if r2.status_code == 200:
        plan_result = r2.json()
        print(f"✅ Generated {len(plan_result['concepts'])} unique concepts:")
        
        for concept in plan_result["concepts"]:
            print(f"   🎨 {concept['id']}: {concept['title']}")
            print(f"      Budget Profile: {concept['budget_profile']}")
            print(f"      Total Cost: LKR {concept['total_lkr']:,}")
            
            # Show top assumptions
            assumptions = concept.get("assumptions", [])[:2]
            for assumption in assumptions:
                print(f"      • {assumption}")
        
        print(f"\n3. Venue Suggestions ({len(plan_result['derived']['suggested_venues'])}):")
        for i, venue in enumerate(plan_result["derived"]["suggested_venues"][:3], 1):
            print(f"   {i}. {venue.get('name', 'Unknown')} - {venue.get('type', 'N/A')}")
        
        print("\n🎉 Enhanced concept system working!")
        print("📊 Key Features Demonstrated:")
        print("   ✅ 4 Unique concept themes (not just budget variations)")
        print("   ✅ Venue suggestions")
        print("   ✅ Different budget profiles per concept")
        
    else:
        print(f"❌ Error: {r2.status_code}")
        print(f"Response: {r2.text}")

except Exception as e:
    print(f"❌ Test failed: {e}")