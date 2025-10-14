"""
Update existing musicians and bands with missing profile fields.
Adds genres, experience, standardRate, and contact information.
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import from backend-py
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from pymongo import MongoClient
import random

load_dotenv()

# Sample data for musicians
MUSIC_GENRES = [
    ["Pop", "Rock"],
    ["Jazz", "Blues"],
    ["Classical", "Contemporary"],
    ["Hip Hop", "R&B"],
    ["Electronic", "Dance"],
    ["Country", "Folk"],
    ["Reggae", "Ska"],
    ["Metal", "Hard Rock"],
    ["Indie", "Alternative"],
    ["Soul", "Funk"]
]

EXPERIENCE_LEVELS = [
    "5+ years professional experience",
    "10+ years performing artist",
    "15+ years in music industry",
    "3+ years live performances",
    "8+ years session musician",
    "Professional touring artist",
    "Award-winning performer",
    "Conservatory trained musician",
    "Self-taught professional",
    "Studio and live performer"
]

def update_musicians():
    """Update solo musicians with missing fields"""
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        print("ERROR: MONGO_URI not found in .env file")
        return
    
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client['eventPlanner']
    users_collection = db['users']
    
    print("=" * 60)
    print("UPDATING SOLO MUSICIANS")
    print("=" * 60)
    
    musicians = list(users_collection.find({'role': 'musician'}))
    print(f"\nFound {len(musicians)} musicians\n")
    
    updated_count = 0
    for musician in musicians:
        name = musician.get('name', 'Unknown')
        updates = {}
        
        # Add genres if missing
        if not musician.get('genres'):
            updates['genres'] = random.choice(MUSIC_GENRES)
        
        # Add experience if missing
        if not musician.get('experience'):
            updates['experience'] = random.choice(EXPERIENCE_LEVELS)
        
        # Add standardRate if missing (between 30k-80k LKR)
        if not musician.get('standardRate'):
            updates['standardRate'] = random.randint(30, 80) * 1000
        
        # Add contact if missing and phone exists
        if not musician.get('contact') and musician.get('phone'):
            updates['contact'] = musician.get('phone')
        elif not musician.get('contact'):
            updates['contact'] = f"+94 7{random.randint(10000000, 99999999)}"
        
        if updates:
            result = users_collection.update_one(
                {'_id': musician['_id']},
                {'$set': updates}
            )
            if result.modified_count > 0:
                updated_count += 1
                print(f"✓ Updated: {name}")
                for key, value in updates.items():
                    if key == 'genres':
                        print(f"  - {key}: {', '.join(value)}")
                    else:
                        print(f"  - {key}: {value}")
                print()
        else:
            print(f"○ Skipped: {name} (already has all fields)")
    
    print(f"\nUpdated {updated_count} of {len(musicians)} musicians")
    return updated_count

def update_bands():
    """Update music bands with missing fields"""
    mongo_uri = os.getenv('MONGO_URI')
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client['eventPlanner']
    users_collection = db['users']
    
    print("\n" + "=" * 60)
    print("UPDATING MUSIC BANDS")
    print("=" * 60)
    
    bands = list(users_collection.find({'role': 'music_band'}))
    print(f"\nFound {len(bands)} bands\n")
    
    updated_count = 0
    for band in bands:
        name = band.get('bandName') or band.get('name', 'Unknown')
        updates = {}
        
        # Fix genres format - convert string to array
        genres = band.get('genres')
        if genres:
            if isinstance(genres, str):
                # Split string like "Rock,Pop" into array
                updates['genres'] = [g.strip() for g in genres.split(',')]
            elif not isinstance(genres, list):
                updates['genres'] = [str(genres)]
        else:
            updates['genres'] = random.choice(MUSIC_GENRES)
        
        # Add experience if missing
        if not band.get('experience'):
            updates['experience'] = random.choice(EXPERIENCE_LEVELS)
        
        # Add standardRate if missing (between 80k-200k LKR for bands)
        if not band.get('standardRate'):
            updates['standardRate'] = random.randint(80, 200) * 1000
        
        # Add contact if missing
        if not band.get('contact'):
            updates['contact'] = f"+94 7{random.randint(10000000, 99999999)}"
        
        # Ensure members field exists
        if not band.get('members'):
            updates['members'] = random.randint(3, 7)
        
        if updates:
            result = users_collection.update_one(
                {'_id': band['_id']},
                {'$set': updates}
            )
            if result.modified_count > 0:
                updated_count += 1
                print(f"✓ Updated: {name}")
                for key, value in updates.items():
                    if key == 'genres':
                        print(f"  - {key}: {', '.join(value)}")
                    else:
                        print(f"  - {key}: {value}")
                print()
        else:
            print(f"○ Skipped: {name} (already has all fields)")
    
    print(f"\nUpdated {updated_count} of {len(bands)} bands")
    return updated_count

def verify_updates():
    """Verify that updates were successful"""
    mongo_uri = os.getenv('MONGO_URI')
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client['eventPlanner']
    users_collection = db['users']
    
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)
    
    # Check musicians
    musicians = list(users_collection.find({'role': 'musician'}).limit(2))
    print("\nSample Musicians:")
    for m in musicians:
        print(f"\n  {m.get('name')}")
        print(f"    Genres: {m.get('genres')}")
        print(f"    Experience: {m.get('experience')}")
        print(f"    Rate: LKR {m.get('standardRate'):,}" if m.get('standardRate') else "    Rate: Not set")
        print(f"    Contact: {m.get('contact')}")
    
    # Check bands
    bands = list(users_collection.find({'role': 'music_band'}).limit(2))
    print("\nSample Bands:")
    for b in bands:
        print(f"\n  {b.get('bandName') or b.get('name')}")
        print(f"    Genres: {b.get('genres')}")
        print(f"    Members: {b.get('members')}")
        print(f"    Experience: {b.get('experience')}")
        print(f"    Rate: LKR {b.get('standardRate'):,}" if b.get('standardRate') else "    Rate: Not set")
        print(f"    Contact: {b.get('contact')}")

if __name__ == '__main__':
    try:
        print("\n🎵 MUSIC PROVIDER DATABASE UPDATER 🎵\n")
        
        # Update musicians
        musician_count = update_musicians()
        
        # Update bands
        band_count = update_bands()
        
        # Verify
        verify_updates()
        
        print("\n" + "=" * 60)
        print(f"✓ COMPLETE: Updated {musician_count} musicians and {band_count} bands")
        print("=" * 60)
        print("\nYou can now refresh your frontend to see the updated data!")
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
