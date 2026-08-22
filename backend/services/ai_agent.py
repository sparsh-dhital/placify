import os
import google.generativeai as genai
from pydantic import BaseModel
from dotenv import load_dotenv

# Load your secret key from the .env file
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# The exact data structure we want the AI to return
class InterviewPlan(BaseModel):
    technical_questions: list[str]
    recommended_difficulty: str
    focus_areas: list[str]

def get_interview_prep(student_major: str, target_role: str):
    # Initialize the fast, free Gemini 1.5 Flash model
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"Create a technical mock interview prep plan for a student majoring in {student_major} applying for a {target_role} role."
    
    # Force the AI to output perfect JSON matching our Pydantic class
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=InterviewPlan,
        ),
    )
    
    # Parse the AI's JSON string back into our Pydantic model so FastAPI can serve it
    return InterviewPlan.model_validate_json(response.text)