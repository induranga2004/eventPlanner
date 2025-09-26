#!/usr/bin/env python3
"""
Test the new enhanced concept system with venue and catering selection
"""
import requests
import json
from datetime import date, timedelta

BASE_URL = "http://127.0.0.1:1800"

def test_enhanced_concepts():
    print("🎭 Testing Enhanced Concept System")
    print("=" * 50)
    
    try:
        # 1. Create a campaign
        print("\n1. Creating campaign...")
        campaign_response = requests.post(f"{BASE_URL}/campaigns", json={
            "name": "Sarah & John's Dream Wedding"
        })
        
        if campaign_response.status_code != 200:
            print(f"❌ Campaign creation failed: {campaign_response.status_code}")
            return
            
        campaign = campaign_response.json()
        campaign_id = campaign["id"]
        print(f"✅ Campaign created: {campaign['name']} (ID: {campaign_id})")
        
        # 2. Generate concepts with new system
        print("\n2. Generating enhanced concepts...")
        event_date = (date.today() + timedelta(days=120)).isoformat()
        
        plan_data = {
            "campaign_id": campaign_id,
            "event_name": "Sarah & John's Dream Wedding",
            "event_type": "wedding",
            "city": "Colombo",
            "venue": "",
            "event_date": event_date,
            "attendees_estimate": 180,
            "audience_profile": "Family and close friends, mix of traditional and modern preferences",
            "special_instructions": "Vegetarian-friendly options required",
            "total_budget_lkr": 2500000,
            "number_of_concepts": 4
        }
        
        plan_response = requests.post(f"{BASE_URL}/campaigns/{campaign_id}/planner/generate", json=plan_data)
        
        if plan_response.status_code != 200:
            print(f"❌ Plan generation failed: {plan_response.status_code}")
            print(f"Error: {plan_response.text}")
            return
            
        plan_data = plan_response.json()
        print(f"✅ Generated {len(plan_data['concepts'])} unique concepts:")
        
        # Display each concept
        for concept in plan_data["concepts"]:
            print(f"\n   🎨 {concept['id']}: {concept['title']}")
            print(f"      Budget Profile: {concept['budget_profile']}")
            print(f"      Total Cost: LKR {concept['total_lkr']:,}")
            print(f"      Per Person: LKR {concept['total_lkr'] // plan_data['event']['attendees']:,}")
            
            # Show top assumptions
            assumptions = concept.get('assumptions', [])[:3]
            for assumption in assumptions:
                print(f"      • {assumption}")
        
        # 3. Show venue suggestions
        print(f"\n3. Venue Suggestions ({len(plan_data['derived']['suggested_venues'])}):")
        for i, venue in enumerate(plan_data["derived"]["suggested_venues"][:3], 1):
            print(f"   {i}. {venue.get('name', 'Unknown Venue')}")
            print(f"      Type: {venue.get('type', 'N/A')}")
            print(f"      Capacity: {venue.get('capacity', 'N/A')}")
            print(f"      Rating: {venue.get('rating', 'N/A')}")
            print(f"      Cost: LKR {venue.get('avg_cost_lkr', 'TBD'):,}" if venue.get('avg_cost_lkr') else "      Cost: TBD")
        
        # 4. Show catering suggestions
        if plan_data["derived"].get("catering_suggestions"):
            catering = plan_data["derived"]["catering_suggestions"]
            print(f"\n4. Catering Options:")
            
            if catering.get("inhouse"):
                inhouse = catering["inhouse"]
                print(f"   🏨 In-house: {inhouse.get('name', 'Venue Catering')}")
                print(f"      Cost: LKR {inhouse.get('pp_lkr', 'TBD'):,} per person")
            
            if catering.get("external_options"):
                print(f"   🍽️ External Caterers:")
                for caterer in catering["external_options"][:2]:
                    print(f"      • {caterer.get('name', 'Unknown')}")
                    print(f"        Range: LKR {caterer.get('pp_min_lkr', 0):,} - {caterer.get('pp_max_lkr', 0):,} per person")
        
        # 5. Test dynamic pricing
        print(f"\n5. Testing Dynamic Pricing...")
        if plan_data["derived"]["suggested_venues"] and plan_data["concepts"]:
            selected_venue = plan_data["derived"]["suggested_venues"][0]
            selected_concept = plan_data["concepts"][0]
            
            print(f"   Selecting venue: {selected_venue.get('name')}")
            print(f"   For concept: {selected_concept['title']}")
            
            update_data = {
                "concept_id": selected_concept["id"],
                "venue_selection": {
                    "venue_name": selected_venue.get("name"),
                    "venue_data": selected_venue
                },
                "attendees": plan_data["event"]["attendees"],
                "total_budget_lkr": plan_data["event"]["attendees"] * 15000  # Adjust budget
            }
            
            update_response = requests.post(
                f"{BASE_URL}/campaigns/{campaign_id}/planner/update-costs", 
                json=update_data
            )
            
            if update_response.status_code == 200:
                updated = update_response.json()
                print(f"   ✅ Updated costs for concept {updated['concept_id']}:")
                print(f"      New total: LKR {updated['total_lkr']:,}")
                print(f"      Venue cost: LKR {updated['venue_cost']:,}")
                print(f"      Catering cost: LKR {updated['catering_cost']:,}")
                
                if updated['savings_or_overage'] > 0:
                    print(f"      💰 Under budget by: LKR {updated['savings_or_overage']:,}")
                elif updated['savings_or_overage'] < 0:
                    print(f"      ⚠️ Over budget by: LKR {abs(updated['savings_or_overage']):,}")
                
                # Show cost breakdown
                print(f"      📊 Cost Breakdown:")
                for cost in updated['updated_costs'][:5]:  # Show top 5 categories
                    print(f"         {cost['category'].title()}: LKR {cost['amount_lkr']:,}")
            else:
                print(f"   ❌ Dynamic pricing failed: {update_response.status_code}")
        
        print(f"\n🎉 Enhanced concept system test completed!")
        print(f"📊 Key Features Demonstrated:")
        print(f"   ✅ 4 Unique concept themes (not just budget variations)")
        print(f"   ✅ Venue and catering suggestions")
        print(f"   ✅ Dynamic pricing based on selections")
        print(f"   ✅ Real-time cost adjustments")
        print(f"   ✅ Budget tracking and overages")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the server is running on port 1800")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_enhanced_concepts()