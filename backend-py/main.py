import os
from fastapi import FastAPI
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Check for OpenAI API key
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable not found. Please set it in your .env file.")

# --- FastAPI App ---
app = FastAPI(
    title="CrewAI Content Creation API",
    description="An API to generate content using a CrewAI agent.",
)

class TopicRequest(BaseModel):
    topic: str

# --- CrewAI Setup ---

# 1. Create the Agent
content_writer = Agent(
    role='Marketing Content Creator',
    goal='Generate engaging and creative content about a given topic: {topic}',
    backstory=(
        "You are a renowned Content Creator, known for your insightful and engaging articles. "
        "You transform complex concepts into compelling narratives."
    ),
    verbose=True,
    allow_delegation=False
)

# 2. Create the Task
# The task description now directly uses the {topic} placeholder
write_content_task = Task(
    description=(
        "Write a short, engaging blog post about {topic}. "
        "The post should be easy to understand, interesting, and no more than 3 paragraphs."
    ),
    expected_output='A 3-paragraph blog post about the specified topic.',
    agent=content_writer
)

# 3. Create the Crew
# The crew is simplified as it only has one agent and one task
content_creation_crew = Crew(
    agents=[content_writer],
    tasks=[write_content_task],
    process=Process.sequential,
    verbose=True
)

# --- API Endpoint ---

@app.post("/generate-content", summary="Generate content about a topic")
def generate_content(request: TopicRequest):
    """
    Kicks off the content creation crew to generate a blog post about the specified topic.
    """
    try:
        # The input for the crew is a dictionary with the topic
        inputs = {'topic': request.topic}
        result = content_creation_crew.kickoff(inputs=inputs)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/", summary="Health Check")
def read_root():
    """
    A simple health check endpoint.
    """
    return {"status": "API is running"}

# To run this application:
# 1. Make sure you have an .env file with your OPENAI_API_KEY.
# 2. Run the command: uvicorn main:app --reload
