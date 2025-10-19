import sqlite3
import json
import sys
import os
import uuid
import traceback
from datetime import datetime
from typing import Dict, List, Optional
import importlib

# Default Groq model can be overridden with env var; but read API key at init time
# === Configuration ===
# === Configuration (Hardcoded) ===
GROQ_API_KEY = "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"  # 🔒 Replace with your actual API key
GROQ_MODEL = "openai/gpt-oss-20b"   # or another model you want to use

print("DEBUG: module load - sys.executable:", sys.executable)
print("DEBUG: module load - sys.version:", sys.version)
print("DEBUG: module load - sys.path:\n", "\n".join(sys.path))

# Try to locate groq package at import time
try:
    import groq as _groq
    print("DEBUG: groq import succeeded at module load. groq file:", getattr(_groq, '__file__', 'no __file__'))
except Exception as e:
    print("DEBUG: groq import failed at module load:", repr(e))

# DEBUG: Starting campus_navigator_groq module
print("DEBUG: Entering campus_navigator_groq module...")

class CampusNavigator:
    def __init__(self, db_path='campus_navigator.db'):
        self.db_path = db_path
        self.llm_client = None
        self.model_name = None
        self.model_version = None
        self.llm_type = "groq"
        self._last_llm = None
        # Store any initialization error so query_llm can provide better diagnostics
        self._init_error = None
        self._init_traceback = None
        # API key and model used for this instance (populated at init)
        self._api_key = None
        self._model = None
        self.init_llm()

    def init_llm(self):
        """Initialize Groq client using the official `groq` package (v0.32.0 usage)."""
        print("DEBUG: Initializing Groq client in init_llm...")
        print("DEBUG: init_llm - sys.executable:", sys.executable)
        print("DEBUG: init_llm - sys.version:", sys.version)
        print("DEBUG: init_llm - sys.path:\n", "\n".join(sys.path))

        # Read API key from environment
        api_key = os.environ.get("GROQ_API_KEY")
        if api_key:
            print("DEBUG: API key successfully read.")
        else:
            print("DEBUG: API key NOT found in environment.")

        # Attempt to import groq here and print details
        try:
            groq = importlib.import_module('groq')
            print("DEBUG: groq import succeeded in init_llm. Location:", getattr(groq, '__file__', 'no __file__'))
            # Print a couple attributes if present
            print("DEBUG: groq attributes available:", [a for a in dir(groq) if not a.startswith('_')][:20])
        except Exception as e:
            import traceback
            print("DEBUG: groq import failed in init_llm:", repr(e))
            print(traceback.format_exc())

        # Proceed with Groq client initialization
        try:
            print("DEBUG: Attempting to instantiate Groq client...")
            from groq import Groq

            # Use the hardcoded values
            api_key = GROQ_API_KEY
            model = GROQ_MODEL

            # Read API key from environment
            api_key = os.environ.get("GROQ_API_KEY")
            if api_key:
                print("DEBUG: API key successfully read.")
            else:
                print("DEBUG: API key NOT found in environment.")

            print("DEBUG: Attempting to instantiate Groq client...")
            client = Groq(api_key=api_key)
            self.llm_client = client
            self._api_key = api_key
            self._model = model
            self.model_name = model
            self.model_version = None
            print(f"Using Groq client (model={self.model_name})", file=sys.stderr)
        except ImportError:
            print("Groq client not installed. Install with: pip install groq", file=sys.stderr)
            self.llm_client = None
            self._init_error = "Groq client not installed"
        except Exception as e:
            tb = traceback.format_exc()
            print(f"Error initializing Groq client: {e}\n{tb}", file=sys.stderr)
            self.llm_client = None
            self._init_error = str(e)
            self._init_traceback = tb



    def query_llm(self, prompt: str, system_prompt: str) -> dict:
        """Send query to Groq and get response.

        This function returns a dict with keys: { 'text', 'raw', 'ok', 'error' }.
        Replace the NotImplemented section with the exact SDK call for your Groq client.
        """
        full_prompt = f"{system_prompt}\n\nUser Query: {prompt}"

        # If the client wasn't configured, return a clear error for debugging
        if not self.llm_client:
            # Provide actionable diagnostics: was init the problem? is the key missing?
            key_present = bool(self._api_key)
            err_parts = ["Groq client not configured. Set GROQ_API_KEY and install the Groq SDK."]
            if self._init_error:
                err_parts.append(f"Init error: {self._init_error}")
            err_parts.append(f"GROQ_API_KEY set: {key_present}")
            err = " | ".join(err_parts)
            print(err, file=sys.stderr)
            self._last_llm = {
                'text': None,
                'raw': None,
                'ok': False,
                'error': err,
                'init_error': self._init_error,
                'init_traceback': self._init_traceback,
            }
            return {'text': "I'm having trouble processing that right now. Please try again.", 'raw': None, 'ok': False, 'error': err}

        try:
            # Use the Groq chat completions API. We send a system message then the user message.
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ]

            completion = self.llm_client.chat.completions.create(
                messages=messages,
                model=self.model_name,
            )

            # Extract text from the first choice (defensive parsing)
            text = None
            try:
                # According to the Groq client, `completion.choices[0].message.content` holds the text
                text = completion.choices[0].message.content
            except Exception:
                try:
                    # Fallback for other shapes
                    text = completion.choices[0].message["content"]
                except Exception:
                    text = str(completion)

            # Raw representation: prefer to_dict() if available
            try:
                raw_repr = completion.to_dict() if hasattr(completion, 'to_dict') else str(completion)
            except Exception:
                raw_repr = str(completion)

            self._last_llm = {'text': text, 'raw': raw_repr, 'ok': True}
            return {'text': text, 'raw': raw_repr, 'ok': True, 'error': None}
        except Exception as e:
            err = str(e)
            tb = traceback.format_exc()
            print(f"Groq LLM Error: {err}\n{tb}", file=sys.stderr)
            self._last_llm = {'text': None, 'raw': None, 'ok': False, 'error': err, 'error_trace': tb}
            return {'text': "I'm having trouble processing that right now. Please try again.", 'raw': None, 'ok': False, 'error': err}

    def extract_location(self, user_query: str) -> Dict:
        """Use LLM to extract location information from user query"""
        system_prompt = """You are a campus navigation assistant. Extract the location or building name from the user's query.
Return ONLY a JSON object with these fields:
- "location": the main location/building mentioned
- "query_type": one of ["location", "directions", "hours", "info"]
- "from_location": if asking for directions (optional)

Examples:
"Where is the library?" -> {"location": "library", "query_type": "location"}
"How do I get from library to student center?" -> {"location": "student center", "from_location": "library", "query_type": "directions"}
"What time does the gym close?" -> {"location": "gym", "query_type": "hours"}
"""

        response = self.query_llm(user_query, system_prompt)
        text = response.get('text') if isinstance(response, dict) else str(response)
        try:
            # Extract JSON from response
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
            return {"location": "", "query_type": "info"}
        except Exception:
            return {"location": "", "query_type": "info"}

    def search_building(self, location_name: str) -> Optional[Dict]:
        """Search for building in database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''
        SELECT * FROM buildings 
        WHERE LOWER(name) LIKE ? OR LOWER(aliases) LIKE ?
        ''', (f'%{location_name.lower()}%', f'%{location_name.lower()}%'))

        row = cursor.fetchone()
        conn.close()

        if row:
            return dict(row)
        return None

    def get_route(self, from_building_id: int, to_building_id: int) -> Optional[Dict]:
        """Get route between two buildings"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''
        SELECT * FROM routes 
        WHERE from_building_id = ? AND to_building_id = ?
        ''', (from_building_id, to_building_id))

        row = cursor.fetchone()

        if not row:
            cursor.execute('''
            SELECT * FROM routes 
            WHERE from_building_id = ? AND to_building_id = ?
            ''', (to_building_id, from_building_id))
            row = cursor.fetchone()

        conn.close()

        if row:
            return dict(row)
        return None

    def get_pois(self, building_id: int) -> List[Dict]:
        """Get points of interest in a building"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM poi WHERE building_id = ?', (building_id,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def generate_response(self, query_data: Dict, building_data: Optional[Dict], 
                         route_data: Optional[Dict] = None, from_building: Optional[Dict] = None) -> str:
        """Use LLM to generate natural language response"""

        if not building_data:
            system_prompt = "You are a helpful campus navigation assistant."
            prompt = f"The user asked: '{query_data.get('original_query', '')}'. We couldn't find that location on campus. Apologize politely and ask if they meant something else or if they'd like to see all available locations."
            resp = self.query_llm(prompt, system_prompt)
            return resp.get('text') if isinstance(resp, dict) else str(resp)

        context = f"""Building Information:
Name: {building_data['name']}
Description: {building_data['description']}
Address: {building_data['address']}
Hours: {building_data.get('building_hours')}
"""

        if route_data:
            context += f"""

Route Information:
From: {from_building['name']}
To: {building_data['name']}
Distance: {route_data.get('distance_meters')} meters
Walking Time: {route_data.get('walk_time_minutes')} minutes
Directions: {route_data.get('route_description')}
"""

        system_prompt = """You are a friendly campus navigation assistant. Provide helpful, conversational responses about campus locations.
- Be concise but informative (2-3 sentences max)
- Use natural language
- Include relevant details like hours and directions
- Be encouraging and helpful"""

        query_type = query_data.get('query_type', 'info')
        original_query = query_data.get('original_query', '')

        if query_type == "hours":
            prompt = f"The user asked: '{original_query}'. Tell them the hours for {building_data['name']} in a friendly way. Hours: {building_data.get('building_hours')}"
        elif query_type == "directions" and route_data:
            prompt = f"The user asked: '{original_query}'. Give them clear walking directions from {from_building['name']} to {building_data['name']}. Use this info: {context}"
        else:
            prompt = f"The user asked: '{original_query}'. Tell them about {building_data['name']} location and what's there. Use this info: {context}"

        resp = self.query_llm(prompt, system_prompt)
        return resp.get('text') if isinstance(resp, dict) else str(resp)

    def process_query(self, user_query: str, debug: bool = False) -> Dict:
        """Main function to process user query"""
        print(f"Processing query: {user_query}", file=sys.stderr)

        # Extract location from query
        query_data = self.extract_location(user_query)
        query_data['original_query'] = user_query

        print(f"Extracted data: {query_data}", file=sys.stderr)

        location = query_data.get('location', '')
        from_location = query_data.get('from_location', '')

        # Search for building
        building_data = self.search_building(location)
        from_building = self.search_building(from_location) if from_location else None

        # Get route if needed
        route_data = None
        if building_data and from_building and query_data['query_type'] == 'directions':
            route_data = self.get_route(from_building['id'], building_data['id'])

        # Get POIs
        pois = []
        if building_data:
            pois = self.get_pois(building_data['id'])

        # Generate response (this will update self._last_llm with the final LLM result if any)
        response_text = self.generate_response(query_data, building_data, route_data, from_building)

        # Determine provenance
        request_id = uuid.uuid4().hex
        timestamp = datetime.utcnow().isoformat() + 'Z'

        llm_info = getattr(self, '_last_llm', None)
        if llm_info and llm_info.get('ok'):
            response_source = 'llm'
        else:
            response_source = 'fallback'

        result = {
            'success': True,
            'request_id': request_id,
            'timestamp': timestamp,
            'response': response_text,
            'response_source': response_source,
            'model': getattr(self, 'model_name', None),
            'model_version': getattr(self, 'model_version', None),
            'building': building_data,
            'route': route_data,
            'pois': pois
        }

        # Include raw llm payload only in debug mode
        if debug and llm_info and llm_info.get('raw'):
            result['llm_raw'] = llm_info.get('raw')

        return result


def main():
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No query provided'}))
        sys.exit(1)

    user_query = sys.argv[1]

    try:
        navigator = CampusNavigator()
        result = navigator.process_query(user_query)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
