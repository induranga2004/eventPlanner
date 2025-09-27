import requests

print("🎓 Testing GRADUATION Event:")
r = requests.post("http://127.0.0.1:1800/campaigns", json={"name": "Test Graduation"})
campaign_id = r.json()["id"]

plan_data = {
    "campaign_id": campaign_id,
    "event_name": "Test Graduation",
    "event_type": "graduation",
    "city": "Colombo",
    "venue": "",
    "event_date": "2025-12-01",
    "attendees_estimate": 150,
    "audience_profile": "Graduates and families",
    "total_budget_lkr": 2000000,
    "number_of_concepts": 4
}

r2 = requests.post(f"http://127.0.0.1:1800/campaigns/{campaign_id}/planner/generate", json=plan_data)
if r2.status_code == 200:
    result = r2.json()
    print("✅ Generated graduation concepts:")
    for concept in result["concepts"]:
        print(f"   🎨 {concept['id']}: {concept['title']}")
else:
    print(f"❌ Error: {r2.status_code}")
    print(r2.text)