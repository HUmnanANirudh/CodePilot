# CodePilot

### AI-Powered GitHub Engineering Assistant + Repository Analytics

> Your internal engineering copilot — connect repositories, ask questions about your codebase, detect dead code, and get instant architecture insights. Powered by LangChain, vector embeddings, and LLMs.
---

## What is CodePilot?

CodePilot is an **AI-powered engineering assistant** that connects to your GitHub repositories and transforms them into a searchable, queryable knowledge base. Think of it as **ChatGPT for your codebase** meets **SonarQube-lite analytics**.

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Connect Repos** | Link any GitHub repository — CodePilot indexes the entire codebase |
| **Semantic Search** | Search code by meaning, not just keywords. Find relevant functions, patterns, and implementations |
| **AI Chat** | Ask natural language questions about your codebase and get grounded, cited answers |
| **Architecture Diagrams** | Auto-generate dependency graphs and module relationship visualizations |
| **Dead Code Detection** | Identify unused functions, orphaned modules, and unreferenced exports |
| **Health Dashboard** | Repository health scoring — code quality, complexity, documentation coverage |
| **Onboarding Docs** | Auto-generate onboarding documentation for new team members |
---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **API** | FastAPI | REST |
| **LLM** | LangChain | RAG pipeline, chains, prompt orchestration |
| **Vector Store** | ChromaDB | Code embeddings for semantic search |
| **Database** | PostgreSQL | Structured data — repos, files, metrics |
| **Cache & Queue** | Redis | Task queue for async indexing |
| **Frontend** | React 19 + Vite + TailwindCSS | Dashboard & chat UI |
| **Visualization** | Recharts + React Flow | Charts, graphs, architecture diagrams |
| **Code Parsing** | Tree-sitter | AST-aware code chunking |

---

```
POST   /api/repositories              # Connect a GitHub repo
GET    /api/repositories              # List connected repos
GET    /api/repositories/{id}         # Repo details + indexing status
DELETE /api/repositories/{id}         # Remove repo + all data
POST   /api/repositories/{id}/reindex # Re-index repository
```

### Search & Chat

```
POST   /api/search                   # Semantic code search
WS     /api/chat/{repo_id}           # AI chat (WebSocket, streaming)
GET    /api/chat/{repo_id}/sessions  # Chat session history
```

### Analytics & Generation
```
GET    /api/analytics/{repo_id}/health        # Health score breakdown
GET    /api/analytics/{repo_id}/dead-code     # Dead code report
GET    /api/analytics/{repo_id}/architecture  # Architecture graph data
POST   /api/generate/onboarding/{repo_id}     # Generate onboarding docs
POST   /api/generate/architecture/{repo_id}   # Generate architecture diagram
```
---