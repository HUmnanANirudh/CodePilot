from .llm_client import LLMClient

class Narrative:
    def __init__(self, summary: dict, llm_client: LLMClient):
        self.summary = summary
        self.llm_client = llm_client

    def generate_what_it_is(self):
        prompt = (
            "You are an expert software architect who reads a repository for 5 minutes and describes it as a fable. "
            "Based on the following clusters, write a brief, insightful narrative (2-3 paragraphs) about the repository's origin story, "
            "the purpose, what problem it solves, and its personality. "
            "Your tone should be warm, insightful, authoritative, and slightly informal. Use first person plural ('This codebase is a living ledger...'). "
            "DO NOT use bullet points or lists.\n\n"
            "**Key Architectural Clusters:**\n"
        )
        for cluster, files in self.summary.get('clusters', {}).items():
            prompt += f"  - `{cluster}` ({len(files)} files)\n"
        
        prompt += "\nGenerate the fable now."
        return self.llm_client.generate(prompt)

    def generate_how_it_works(self):
        prompt = (
            "You are a principal software engineer. Based on the following repository clusters, "
            "describe the architecture flow. Explain what the core modules are, how data flows through them, "
            "what the entry points are, and what the key design patterns are. "
            "Produce a clear architectural narrative, not just a list of clusters.\n\n"
        )
        for cluster, files in self.summary.get('clusters', {}).items():
            prompt += f"  - **{cluster}**\n"
        return self.llm_client.generate(prompt)

    def generate_rebuild_prompt(self, intelligence: dict, tree_viewer: dict):
        import json
        tech_stack = ", ".join(intelligence.get("tech_stack", []))
        clusters = list(self.summary.get("clusters", {}).keys())
        
        markdown_prompt = (
            f"# System Prompt for AI Agent\n\n"
            f"You are operating within the `{intelligence.get('repo_name', 'repository')}` codebase.\n\n"
            f"## Tech Stack\n{tech_stack}\n\n"
            f"## Core Architecture\n"
            f"The application is organized into these main clusters:\n"
        )
        for c in clusters:
            markdown_prompt += f"- {c}\n"
            
        markdown_prompt += "\n## Key Hotspots (Focus Areas)\n"
        for h in self.summary.get("hotspots", []):
            markdown_prompt += f"- {h}\n"

        structured_prompt = (
            f"Repository context: {intelligence.get('repo_name', 'Project')} using {tech_stack}. "
            f"Main areas: {', '.join(clusters)}."
        )

        return {
            "markdown": markdown_prompt,
            "structured": structured_prompt,
            "json": {
                "role": "system",
                "content": markdown_prompt,
                "context": {
                    "tech_stack": intelligence.get("tech_stack", []),
                    "clusters": clusters,
                    "hotspots": self.summary.get("hotspots", [])
                }
            }
        }
