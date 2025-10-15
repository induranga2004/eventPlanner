from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from models.caption_agent import generate_captions
from models.post_agent import share_post

scheduler = BackgroundScheduler()
scheduler.start()

def schedule_job(func, run_date, args):
    scheduler.add_job(func=func, trigger="date", run_date=run_date, args=args)

# --- Social Post Scheduling Logic ---

def handle_design_ready(event, poster_url):
    captions = generate_captions(event)
    event_date = datetime.strptime(event["date"], "%Y-%m-%d")
    scheduled_time = event_date - timedelta(days=7)

    schedule_job(share_post, scheduled_time, [poster_url, captions["instagram"]])
    print(f"✅ Post scheduled for {scheduled_time}")

def schedule_auto_shares(event, poster_url):
    event_date = datetime.strptime(event["date"], "%Y-%m-%d")
    intervals = [7, 3, 1]
    for days_before in intervals:
        scheduled_time = event_date - timedelta(days=days_before)
        def job():
            captions = generate_captions(event)
            share_post(poster_url, captions["instagram"])
            print(f"✅ Auto-shared post for {event['name']} at {scheduled_time}")
        schedule_job(job, scheduled_time, [])
        print(f"Scheduled auto-share {days_before} days before event: {scheduled_time}")

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
    schedule_auto_shares(event, poster_url)

    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("Scheduler stopped.")
