from fastapi import APIRouter
from app.core.db_client import db_client
from app.core.langchain_service import langchain_service
import json

router = APIRouter()

@router.get("/analytics/{repo_id}/health")
def get_health(repo_id: str):
    repo = db_client.get_repo_by_id(repo_id)
    return {"status": "ok", "metrics": repo.get("metrics") if repo else None}

@router.get("/analytics/{repo_id}/dead-code")
def get_dead_code(repo_id: str):
    prompt = "Find any potential dead code, unused functions, or deprecated methods in the codebase. Respond ONLY with a valid JSON array of objects with keys: 'file', 'line', 'description'. Do not use markdown blocks."
    try:
        result = langchain_service.generate_insight(repo_id, prompt)
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        dead_code_data = json.loads(result.strip())
        return {"dead_code": dead_code_data}
    except Exception as e:
        return {"dead_code": [], "error": str(e)}

@router.get("/analytics/{repo_id}/architecture")
def get_architecture(repo_id: str):
    prompt = "Identify the core modules of this repository and how they depend on each other. Respond ONLY with a valid JSON object with keys 'nodes' (array of {id, label}) and 'edges' (array of {source, target}). Do not use markdown blocks."
    try:
        result = langchain_service.generate_insight(repo_id, prompt)
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        architecture_data = json.loads(result.strip())
        return {"architecture": architecture_data}
    except Exception as e:
        return {"architecture": None, "error": str(e)}
