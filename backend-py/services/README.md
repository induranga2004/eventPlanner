# Services Directory

This directory is for business logic and service functions.

## Purpose:
- CrewAI agent configurations
- AI service integrations
- Business logic separation

## Example Structure:
```
services/
├── ai_service.py
├── post_service.py
└── crew_service.py
```

## Example Service:
```python
from crewai import Agent, Task, Crew

class AIPostService:
    def __init__(self):
        # Initialize AI service
        pass
    
    def generate_post(self, event_data):
        # Service implementation
        pass
```