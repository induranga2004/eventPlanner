from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.start()

def schedule_job(func, run_date, args):
    scheduler.add_job(func=func, trigger="date", run_date=run_date, args=args)

# --- Social Post Scheduling Logic ---
from datetime import datetime, timedelta
from models.caption_agent import generate_captions
from models.post_agent import share_post

def handle_design_ready(event, poster_url):
    captions = generate_captions(event)
    event_date = datetime.strptime(event["date"], "%Y-%m-%d")
    scheduled_time = event_date - timedelta(days=7)

    schedule_job(share_post, scheduled_time, [poster_url, captions["instagram"]])
    print(f"✅ Post scheduled for {scheduled_time}")

if __name__ == "__main__":
    event = {
        "name": "Colombo Music Night",
        "date": "2025-12-10",
        "venue": "Colombo Stadium",
        "price": "2000 LKR",
        "audience": "18-30 music lovers"
    }
    poster_url = "https://via.placeholder.com/1080x1080.png?text=Music+Night"
    handle_design_ready(event, poster_url)

    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("Scheduler stopped.")
