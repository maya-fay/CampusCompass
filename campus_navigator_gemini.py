import sqlite3
import json
import sys
import os
from typing import Dict, List, Optional

# Configuration - Set your API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyBG8812ExIiTex-yo__TIunXbMZnu_SA_I")

class CampusNavigator:
    def __init__(self, db_path='campus_navigator.db'):
        self.db_path = db_path
        self.llm_client = None
        self.init_llm()
    
    def init_llm(self):
        """Initialize Google Gemini client"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
            self.llm_type = "gemini"
            print("Using Google Gemini (FREE)", file=sys.stderr)
        except ImportError:
            print("Google Generative AI not installed. Install with: pip install google-generativeai", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Error initializing Gemini: {e}", file=sys.stderr)
            sys.exit(1)
    
    def query_llm(self, prompt: str, system_prompt: str) -> str:
        """Send query to Gemini and get response"""
        try:
            full_prompt = f"{system_prompt}\n\nUser Query: {prompt}"
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"LLM Error: {e}", file=sys.stderr)
            return "I'm having trouble processing that right now. Please try again."
    
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
        try:
            # Extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(response[start:end])
            return {"location": "", "query_type": "info"}
        except:
            return {"location": "", "query_type": "info"}
    
    def search_building(self, location_name: str) -> Optional[Dict]:
        """Search for building in database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Search by name or aliases
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
        
        # Try direct route
        cursor.execute('''
        SELECT * FROM routes 
        WHERE from_building_id = ? AND to_building_id = ?
        ''', (from_building_id, to_building_id))
        
        row = cursor.fetchone()
        
        # Try reverse route
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
            return self.query_llm(prompt, system_prompt)
        
        context = f"""Building Information:
Name: {building_data['name']}
Description: {building_data['description']}
Address: {building_data['address']}
Hours: {building_data['building_hours']}
"""
        
        if route_data:
            context += f"""

Route Information:
From: {from_building['name']}
To: {building_data['name']}
Distance: {route_data['distance_meters']} meters
Walking Time: {route_data['walk_time_minutes']} minutes
Directions: {route_data['route_description']}
"""
        
        system_prompt = """You are a friendly campus navigation assistant. Provide helpful, conversational responses about campus locations.
- Be concise but informative (2-3 sentences max)
- Use natural language
- Include relevant details like hours and directions
- Be encouraging and helpful"""
        
        query_type = query_data.get('query_type', 'info')
        original_query = query_data.get('original_query', '')
        
        if query_type == "hours":
            prompt = f"The user asked: '{original_query}'. Tell them the hours for {building_data['name']} in a friendly way. Hours: {building_data['building_hours']}"
        elif query_type == "directions" and route_data:
            prompt = f"The user asked: '{original_query}'. Give them clear walking directions from {from_building['name']} to {building_data['name']}. Use this info: {context}"
        else:
            prompt = f"The user asked: '{original_query}'. Tell them about {building_data['name']} location and what's there. Use this info: {context}"
        
        return self.query_llm(prompt, system_prompt)
    
    def process_query(self, user_query: str) -> Dict:
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
        
        # Generate response
        response_text = self.generate_response(query_data, building_data, route_data, from_building)
        
        # Prepare result
        result = {
            'success': True,
            'response': response_text,
            'building': building_data,
            'route': route_data,
            'pois': pois
        }
        
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
