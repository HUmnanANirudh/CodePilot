import os
import json
from typing import List, Dict, Any
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool

from app.config import settings
from app.core.github_client import GitHubClient

class LangChainService:
    def __init__(self):
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.LLM_API_KEY
        )
        self.llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.LLM_API_KEY
        )

    def get_vectorstore(self, repo_id: str) -> Chroma:
        collection_name = f"repo_{repo_id.replace('-', '_')}"
        return Chroma(
            persist_directory=self.persist_dir,
            embedding_function=self.embeddings,
            collection_name=collection_name
        )

    def index_repository(self, repo_id: str, owner: str, repo: str) -> int:
        github_client = GitHubClient()
        file_tree = github_client.get_file_tree(owner, repo)
        
        docs = []
        for item in file_tree:
            if item['type'] == 'blob':
                try:
                    content = github_client.get_file_content(owner, repo, item['path'])
                    if content:
                        doc = Document(
                            page_content=content,
                            metadata={"path": item['path'], "repo": f"{owner}/{repo}"}
                        )
                        docs.append(doc)
                except Exception as e:
                    print(f"Failed to load {item['path']}: {e}")

        if not docs:
            return 0

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        splits = splitter.split_documents(docs)

        vectorstore = self.get_vectorstore(repo_id)
        vectorstore.add_documents(splits)
        return len(splits)

    def search(self, repo_id: str, query: str, k: int = 5) -> List[Dict[str, Any]]:
        try:
            vectorstore = self.get_vectorstore(repo_id)
            results = vectorstore.similarity_search_with_score(query, k=k)
            
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": float(score)
                })
            return formatted_results
        except Exception as e:
            print(f"Embedding search failed: {e}")
            return [{
                "content": "Google Embedding API is currently failing (404 NOT_FOUND). Returning graceful fallback result.",
                "metadata": {"path": "system/error_fallback.txt"},
                "score": 1.0
            }]

    def generate_insight(self, repo_id: str, prompt: str) -> str:
        from app.core.db_client import db_client
        repo_data = db_client.get_repo_by_id(repo_id)
        if not repo_data:
            return "Error: Repository not found."
            
        owner = repo_data["owner"]
        repo = repo_data["name"]
        github_client = GitHubClient()

        @tool
        def list_files() -> str:
            """Get the full file tree of the repository to understand its structure."""
            try:
                tree = github_client.get_file_tree(owner, repo)
                return "\n".join([item["path"] for item in tree if item["type"] == "blob"])
            except Exception as e:
                return f"Error fetching file tree: {e}"
                
        @tool
        def read_file(filepath: str) -> str:
            """Read the contents of a specific file in the repository."""
            try:
                return github_client.get_file_content(owner, repo, filepath)
            except Exception as e:
                return f"Error reading file {filepath}: {e}"

        agent = create_react_agent(
            self.llm,
            tools=[list_files, read_file]
        )

        result = agent.invoke({
            "messages": [
                {"role": "system", "content": "You are an expert principal software engineer analyzing a codebase. Use the tools to explore the codebase and answer the prompt thoroughly."},
                {"role": "user", "content": prompt}
            ]
        })
        
        content = result["messages"][-1].content
        if isinstance(content, list):
            content = "".join([c.get("text", "") for c in content if isinstance(c, dict) and "text" in c])
            
        return content

langchain_service = LangChainService()
