from fastapi import APIRouter
from app.core.db_client import db_client

router = APIRouter()

@router.get("/analytics/{repo_id}/health")
def get_health(repo_id: str):
    repo = db_client.get_repo_by_id(repo_id)
    return {"status": "ok", "metrics": repo.get("metrics") if repo else None}

@router.get("/analytics/{repo_id}/dead-code")
def get_dead_code(repo_id: str):
    return {"dead_code": []}

@router.get("/analytics/{repo_id}/architecture")
def get_architecture(repo_id: str):
    repo = db_client.get_repo_by_id(repo_id)
    return {"architecture": repo.get("modules") if repo else None}
