from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://thunawasaresisun:ponnaravindu@cluster0.qfrw4x3.mongodb.net/eventPlanner")
client = MongoClient(MONGO_URI)
db = client["event_planner"]  # Database name
