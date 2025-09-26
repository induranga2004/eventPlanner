from openai import OpenAI
import json
from config.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_captions(event):
    prompt = f"""
    Generate social media captions for this event:

    Event: {event['name']}
    Date: {event['date']}
    Venue: {event['venue']}
    Ticket Price: {event['price']}
    Audience: {event['audience']}

    Rules:
    - Instagram: emojis + hashtags
    - Facebook: storytelling
    - LinkedIn: professional
    - Twitter: max 240 chars
    Return JSON.
    """
    resp = client.chat.completions.create(
        model="gpt-5-nano",
        messages=[{"role":"user","content":prompt}]
    )
    try:
        return json.loads(resp.choices[0].message.content)
    except:
        return {"instagram": resp.choices[0].message.content}
