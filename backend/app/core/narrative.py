import os
from .llm_client import LLMClient

class Narrative:
    def __init__(self, summary: dict, llm_client: LLMClient):
        self.summary = summary
        self.llm_client = llm_client

    def generate_what_it_is(self):
        """
        Produces a sharp, scannable repo identity.
        Structure: [one line identity] → [domain list] → [architecture style]
        No fantasy metaphors. Max 150 words.
        """
        tech_stack = self.summary.get('tech_stack', [])
        clusters = self.summary.get('clusters', {})
        cluster_list = list(clusters.items())

        prompt = (
            "You are a senior software architect analyzing a repository.\n"
            "Provide a SCANNABLE repository identity in this exact format:\n\n"
            "LINE 1: [Repository name] is [one sharp sentence describing what it IS and who it's for]\n\n"
            "DOMAINS:\n"
            "- [domain 1]\n"
            "- [domain 2]\n\n"
            "ARCHITECTURE STYLE: [e.g., modular systems library, layered monolith, event-driven microservices, monorepo workspace]\n\n"
            f"Tech stack: {', '.join(tech_stack[:8]) if tech_stack else 'unknown'}\n\n"
            "Key modules:\n"
        )
        for cluster, files in cluster_list[:12]:
            label = os.path.basename(cluster) if cluster and cluster != '.' else 'root'
            prompt += f"- {label}: {len(files)} files\n"

        prompt += "\nKeep under 150 words. Be precise, not poetic. No bullet points in the description."
        return self.llm_client.generate(prompt)

    def generate_how_it_works(self):
        """
        Describes execution flow and module interactions.
        Structure: [entry points] → [data flow] → [key patterns] → [boundaries]
        Max 200 words, structured with short sections.
        """
        clusters = self.summary.get('clusters', {})

        prompt = (
            "You are a principal software engineer. Describe this repository's architecture as a SYSTEM MAP.\n"
            "Use this EXACT format:\n\n"
            "ENTRY POINTS:\n"
            "[what triggers this system — API, CLI, UI, event listener]\n\n"
            "EXECUTION FLOW:\n"
            "[input] → [first layer] → [transformation] → [output]\n\n"
            "ARCHITECTURAL PATTERN:\n"
            "[layered / event-driven / pipe-and-filter / domain-driven / plugin / etc.]\n\n"
            "KEY BOUNDARIES:\n"
            "- [boundary 1]\n"
            "- [boundary 2]\n\n"
            "CRITICAL MODULES:\n"
        )
        for cluster, files in list(clusters.items())[:10]:
            label = os.path.basename(cluster) if cluster and cluster != '.' else 'root'
            prompt += f"- {label}\n"

        prompt += "\nMax 200 words. Technical, structured, scannable. No filler."
        return self.llm_client.generate(prompt)

    def generate_rebuild_prompt(self, intelligence: dict, tree_viewer: dict):
        import json
        tech_stack = ", ".join(intelligence.get("tech_stack", []))
        clusters = list(self.summary.get("clusters", {}).keys())
        hotspots = self.summary.get("hotspots", [])

        markdown_prompt = (
            f"# System Prompt for AI Agent\n\n"
            f"You are operating within the `{intelligence.get('repo_name', 'repository')}` codebase.\n\n"
            f"## Tech Stack\n{tech_stack}\n\n"
            f"## Core Architecture\n"
            f"The application is organized into these main clusters:\n"
        )
        for c in clusters[:15]:
            markdown_prompt += f"- {c}\n"

        markdown_prompt += "\n## Primary Modules (High Centrality — Architectural Hinges)\n"
        for h in hotspots[:10]:
            markdown_prompt += f"- {h}\n"

        structured_prompt = (
            f"Repository: {intelligence.get('repo_name', 'Project')} | "
            f"Stack: {tech_stack} | "
            f"Architecture: {len(clusters)} modules"
        )

        return {
            "markdown": markdown_prompt,
            "structured": structured_prompt,
            "json": {
                "role": "system",
                "content": markdown_prompt,
                "context": {
                    "tech_stack": intelligence.get("tech_stack", []),
                    "clusters": clusters[:15],
                    "hotspots": hotspots[:10]
                }
            }
        }
