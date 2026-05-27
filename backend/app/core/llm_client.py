import os
import sys
import time
from google.genai import client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.config import settings

class LLMClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self._client = client.Client(api_key=self.api_key)

    def generate(self, prompt: str, retries: int = 3, backoff: float = 2.0):
        """
        Generates a narrative using the Gemini API with retry on transient errors.
        """
        system_prompt = (
            "You are a principal software engineer, a master of software architecture and design patterns. "
            "You have been tasked with providing a high-level analysis of a new codebase. "
            "Your analysis should be presented as a 'code fable' - a short, insightful story that helps engineers understand the repository's structure, "
            "potential challenges, and key areas of interest. The tone should be technical, objective, and engaging.\n\n"
            "Based on the following analysis summary, write a code fable for the repository:\n\n"
        )
        full_prompt = system_prompt + prompt

        last_error = None
        for attempt in range(retries):
            try:
                response = self._client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=full_prompt
                )
                return response.text
            except Exception as e:
                last_error = e
                if attempt < retries - 1:
                    wait_time = backoff ** attempt
                    print(f"LLM error (attempt {attempt + 1}/{retries}): {e}. Retrying in {wait_time:.1f}s...")
                    time.sleep(wait_time)
                else:
                    print(f"Error generating narrative after {retries} attempts: {e}")

        return "There was an error generating the narrative."
