from .llm_client import LLMClient

class Narrative:
    def __init__(self, summary: dict, llm_client: LLMClient):
        self.summary = summary
        self.llm_client = llm_client

    def generate_story(self):
        # This is a placeholder for generating the repository narrative
        prompt = self._format_prompt()
        story = self.llm_client.generate(prompt)
        return story

    def _format_prompt(self):
        """
        Formats a detailed prompt for the Copilot client to generate a repository narrative.
        """
        prompt = (
            "You are a principal software engineer tasked with analyzing a new codebase. "
            "Based on the following summary, write a brief, insightful narrative (2-3 paragraphs) about the repository's architecture, potential risks, and areas of interest. "
            "Your tone should be technical, objective, and slightly informal, like you're talking to your team.\n\n"
            "**Codebase Analysis Summary:**\n"
            "- **Identified Hotspots (Top 10 most active files):**\n"
        )

        for hotspot in self.summary.get('hotspots', []):
            prompt += f"  - `{hotspot}`\n"

        prompt += "\n- **Key Architectural Clusters (by directory):**\n"
        for cluster, files in self.summary.get('clusters', {}).items():
            prompt += f"  - **Cluster:** `{cluster}` ({len(files)} files)\n"
        
        prompt += (
            "\n**Your Task:**\n"
            "1.  **Synthesize:** Briefly describe the likely purpose and structure of the application based on the clusters.\n"
            "2.  **Analyze Hotspots:** What do the hotspots suggest about recent development activity or potential complexity?\n"
            "3.  **Identify Risks:** Are there any potential risks or code smells suggested by the file names or groupings (e.g., large, monolithic clusters)?\n"
            "4.  **Suggest Next Steps:** What would you investigate next?\n\n"
            "Generate the narrative now."
        )
        return prompt

    def generate_architecture_summary(self):
        prompt = (
            "You are a principal software engineer. Based on the following repository clusters and hotspots, "
            "provide a concise, high-level Architecture Summary explaining how this application is likely structured, "
            "the core components, and how they interact. Keep it under 200 words.\n\n"
        )
        for cluster, files in self.summary.get('clusters', {}).items():
            prompt += f"  - **{cluster}**\n"
        return self.llm_client.generate(prompt)

    def generate_agent_prompt(self, intelligence: dict, tree_viewer: dict):
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
