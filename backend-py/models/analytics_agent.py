import requests
from config.config import IG_ACCESS_TOKEN

def fetch_post_metrics(post_id):
    url = f"https://graph.facebook.com/v23.0/{post_id}"
    fields = "like_count,comments_count,insights.metric(impressions)"
    res = requests.get(f"{url}?fields={fields}&access_token={IG_ACCESS_TOKEN}")
    data = res.json()
    return {
        "likes": data.get("like_count", 0),
        "comments": data.get("comments_count", 0),
        "reach": data.get("insights", {}).get("data", [{}])[0].get("values", [{}])[0].get("value", 0)
    }
