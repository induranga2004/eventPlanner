import requests
from config.config import IG_ACCESS_TOKEN, IG_USER_ID

def share_post(image_url, caption):
    create_url = f"https://graph.facebook.com/v17.0/{IG_USER_ID}/media"
    payload = {"image_url": image_url, "caption": caption, "access_token": IG_ACCESS_TOKEN}
    res = requests.post(create_url, data=payload)
    creation_id = res.json().get("id")

    publish_url = f"https://graph.facebook.com/v17.0/{IG_USER_ID}/media_publish"
    publish_res = requests.post(publish_url, data={
        "creation_id": creation_id,
        "access_token": IG_ACCESS_TOKEN
    })
    return publish_res.json()
