# Routers Directory

This directory is for FastAPI routers and endpoint definitions.

## Team Assignments:
- Heshan: AI post generation endpoints
- Integration endpoints for frontend communication

## Example Structure:
```
routers/
├── ai_posts.py
├── events.py
└── health.py
```

## Example Router:
```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/ai", tags=["AI"])

@router.post("/generate-post")
async def generate_post(request: PostRequest):
    # Implementation here
    pass
```