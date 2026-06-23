from fastapi import APIRouter
from pydantic import BaseModel
from app.core.langchain_service import langchain_service

router = APIRouter()

class SearchQuery(BaseModel):
    repo_id: str
    query: str

@router.post("/search")
def search(query_data: SearchQuery):
    results = langchain_service.search(query_data.repo_id, query_data.query)
    return {"results": results}
