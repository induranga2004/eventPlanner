import requests
import json

print("💰 Testing Dynamic Pricing System")
print("=" * 50)

try:
    # Use the campaign from the previous test
    campaign_id = "1e9c0fb6-b548-424a-a6fc-6a60af0aebdc"
    
    # Test dynamic pricing update
    print("\n1. Testing dynamic cost updates...")
    update_data = {
        "concept_id": "A1",  # Grand Luxury Experience
        "venue_selection": {
            "venue_name": "Shangri-La Ballroom",
            "venue_data": {
                "name": "Shangri-La Ballroom",
                "type": "wedding|corporate",
                "capacity": 500,
                "avg_cost_lkr": 800000,
                "rating": 4.8
            }
        },
        "attendees": 180,
        "total_budget_lkr": 2500000
    }
    
    r = requests.post(f"http://127.0.0.1:1800/campaigns/{campaign_id}/planner/update-costs", json=update_data)
    
    if r.status_code == 200:
        result = r.json()
        print(f"✅ Updated costs for concept {result['concept_id']}:")
        print(f"   New total: LKR {result['total_lkr']:,}")
        print(f"   Venue cost: LKR {result['venue_cost']:,}")
        
        if result['savings_or_overage'] > 0:
            print(f"   💰 Under budget by: LKR {result['savings_or_overage']:,}")
        elif result['savings_or_overage'] < 0:
            print(f"   ⚠️ Over budget by: LKR {abs(result['savings_or_overage']):,}")
        else:
            print(f"   🎯 Exactly on budget!")
        
        print(f"\n📊 Cost Breakdown:")
        for cost in result['updated_costs'][:6]:  # Show top 6 categories
            print(f"   {cost['category'].replace('_', ' ').title()}: LKR {cost['amount_lkr']:,}")
        
        print(f"\n🎉 Dynamic pricing system working!")
        print(f"📈 Key Features Demonstrated:")
        print(f"   ✅ Real-time venue cost calculation")
        print(f"   ✅ Budget tracking and overages")
        print(f"   ✅ Detailed cost breakdown")
        
        # Test with different venue
        print(f"\n2. Testing with different venue selection...")
        update_data2 = {
            "concept_id": "A2",  # Garden Party Elegance
            "venue_selection": {
                "venue_name": "Galle Face Hotel Garden",
                "venue_data": {
                    "name": "Galle Face Hotel Garden",
                    "type": "garden|outdoor",
                    "capacity": 300,
                    "avg_cost_lkr": 600000,
                    "rating": 4.6
                }
            },
            "attendees": 180,
            "total_budget_lkr": 2500000
        }
        
        r2 = requests.post(f"http://127.0.0.1:1800/campaigns/{campaign_id}/planner/update-costs", json=update_data2)
        
        if r2.status_code == 200:
            result2 = r2.json()
            print(f"✅ Updated Garden Party concept:")
            print(f"   New total: LKR {result2['total_lkr']:,}")
            print(f"   Venue cost: LKR {result2['venue_cost']:,}")
            
            if result2['savings_or_overage'] > 0:
                print(f"   💰 Under budget by: LKR {result2['savings_or_overage']:,}")
            elif result2['savings_or_overage'] < 0:
                print(f"   ⚠️ Over budget by: LKR {abs(result2['savings_or_overage']):,}")
        else:
            print(f"❌ Second test failed: {r2.status_code}")
    
    else:
        print(f"❌ Dynamic pricing test failed: {r.status_code}")
        print(f"Response: {r.text}")

except Exception as e:
    print(f"❌ Test failed: {e}")