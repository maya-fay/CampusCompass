import sqlite3
import json
import sys
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional

# Configuration - read the Groq API key from environment
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
# Default Groq model can be overridden with env var
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-20b")

class CampusNavigator:
    def __init__(self, db_path='campus_navigator.db'):
        self.db_path = db_path
        self.llm_client = None
        self.model_name = None
        self.model_version = None
        self.llm_type = "groq"
        self._last_llm = None
        self.init_llm()

    def init_llm(self):
        """Initialize Groq client using the official `groq` package (v0.32.0 usage)."""
        try:
            from groq import Groq

            # Instantiate synchronous client. The Groq client reads GROQ_API_KEY from
            # the environment by default, but we pass it explicitly for clarity.
            client = Groq(api_key=GROQ_API_KEY)
            self.llm_client = client
            self.model_name = GROQ_MODEL
            self.model_version = None
            print(f"Using Groq client (model={self.model_name})", file=sys.stderr)
        except ImportError:
            print("Groq client not installed. Install with: pip install groq", file=sys.stderr)
            self.llm_client = None
        except Exception as e:
            print(f"Error initializing Groq client: {e}", file=sys.stderr)
            self.llm_client = None