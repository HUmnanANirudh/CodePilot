from fastapi import APIRouter
from app.core.langchain_service import langchain_service

router = APIRouter()

@router.post("/generate/onboarding/{repo_id}")
def generate_onboarding(repo_id: str):
    prompt = "Generate a comprehensive onboarding guide for a new developer joining this project."
    result = langchain_service.generate_insight(repo_id, prompt)
    return {"markdown": result}

@router.post("/generate/architecture/{repo_id}")
def generate_architecture(repo_id: str):
    prompt = "Analyze the architecture of this repository and provide a detailed explanation of its modules and patterns."
    result = langchain_service.generate_insight(repo_id, prompt)
    return {"markdown": result}

@router.post("/generate/guided-tour/{repo_id}")
def generate_tour(repo_id: str):
    prompt = "Create an interactive guided tour explaining the flow of execution and the most important files."
    result = langchain_service.generate_insight(repo_id, prompt)
    return {"markdown": result}
