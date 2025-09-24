import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Example configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key'
    # Add other configurations as needed
