import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Config variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
IG_ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN")
IG_USER_ID = os.getenv("IG_USER_ID")

