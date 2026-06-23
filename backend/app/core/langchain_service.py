import os
import json
from typing import List, Dict, Any
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain.agents import create_agent
from langchain_core.tools import tool

from app.config import settings
from app.core.github_client import GitHubClient

class LangChainService:
    def __init__(self):
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            api_key=settings.OPENAI_API_KEY
        )
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            api_key=settings.OPENAI_API_KEY
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

    def generate_insight(self, repo_id: str, prompt: str) -> str:
        # Agent that has access to search_repo tool
        vectorstore = self.get_vectorstore(repo_id)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

        @tool
        def search_docs(query: str) -> str:
            """Search documentation and codebase for relevant information."""
            docs = retriever.invoke(query)
            return "\n\n".join([f"File: {d.metadata.get('path')}\n{d.page_content}" for d in docs])

        agent = create_agent(
            model=self.llm,
            tools=[search_docs],
            system_prompt="You are an expert principal software engineer analyzing a codebase."
        )

        result = agent.invoke({
            "messages": [{"role": "user", "content": prompt}]
        })
        return result["messages"][-1].content

langchain_service = LangChainService()
