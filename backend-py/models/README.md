# Models Directory

This directory is for Pydantic models and data structures.

## Team Assignments:
- Heshan: AI-related models for post generation
- Integration models for API communication

## Example Structure:
```
models/
├── post_models.py
├── user_models.py
├── event_models.py
└── ai_models.py
```

## Example Model:
```python
from pydantic import BaseModel

class PostRequest(BaseModel):
    event_title: str
    event_description: str
    target_audience: str
```