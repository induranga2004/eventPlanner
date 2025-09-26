from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.start()

def schedule_job(func, run_date, args):
    scheduler.add_job(func=func, trigger="date", run_date=run_date, args=args)
