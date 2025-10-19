"""
Flask API for Campus Navigator Mobile App
Alternative to PHP backend - pure Python solution
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import sys
import os
import requests

# Import the navigator class
from campus_navigator_gemini import CampusNavigator

app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app

# Initialize navigator
navigator = CampusNavigator()

@app.route('/api', methods=['POST', 'OPTIONS'])
def process_query():
    """Handle chat queries from mobile app"""
    
    # Handle preflight CORS request
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            }), 400
        
        query = data['query'].strip()
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query cannot be empty'
            }), 400
        
        # Process query
        result = navigator.process_query(query)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/buildings', methods=['GET'])
def get_buildings():
    """Get list of all buildings"""
    try:
        conn = sqlite3.connect('campus_navigator.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, building_code, description, 
                   latitude, longitude, address
            FROM buildings 
            ORDER BY name
        ''')
        
        buildings = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({
            'success': True,
            'buildings': buildings
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/building/<int:building_id>', methods=['GET'])
def get_building(building_id):
    """Get details of a specific building"""
    try:
        conn = sqlite3.connect('campus_navigator.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM buildings WHERE id = ?', (building_id,))
        building = cursor.fetchone()
        
        if not building:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Building not found'
            }), 404
        
        # Get POIs for this building
        cursor.execute('SELECT * FROM poi WHERE building_id = ?', (building_id,))
        pois = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'building': dict(building),
            'pois': pois
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/route', methods=['POST'])
def get_route():
    """Get route between two buildings"""
    try:
        data = request.get_json()
        
        if not data or 'from_id' not in data or 'to_id' not in data:
            return jsonify({
                'success': False,
                'error': 'from_id and to_id are required'
            }), 400
        
        from_id = data['from_id']
        to_id = data['to_id']
        
        # Get route
        route = navigator.get_route(from_id, to_id)
        
        if not route:
            return jsonify({
                'success': False,
                'error': 'No route found between these buildings'
            }), 404
        
        # Get building details
        conn = sqlite3.connect('campus_navigator.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM buildings WHERE id = ?', (from_id,))
        from_building = dict(cursor.fetchone())
        
        cursor.execute('SELECT * FROM buildings WHERE id = ?', (to_id,))
        to_building = dict(cursor.fetchone())
        
        conn.close()
        
        return jsonify({
            'success': True,
            'route': route,
            'from_building': from_building,
            'to_building': to_building
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/search', methods=['GET'])
def search_buildings():
    """Search buildings by name or alias"""
    try:
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query is required'
            }), 400
        
        conn = sqlite3.connect('campus_navigator.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM buildings 
            WHERE LOWER(name) LIKE ? OR LOWER(aliases) LIKE ?
        ''', (f'%{query.lower()}%', f'%{query.lower()}%'))
        
        buildings = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({
            'success': True,
            'buildings': buildings,
            'count': len(buildings)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/directions', methods=['POST'])
def directions():
    """
    Returns distance, duration, and step-by-step walking directions
    between two coordinates. Body:
      { "origin": {"lat":..., "lng":...}, "destination": {"lat":..., "lng":...}, "mode":"walking" }
    """
    try:
        data = request.get_json(force=True)
        origin = data.get("origin")
        dest   = data.get("destination")
        mode   = data.get("mode", "walking")

        if not origin or not dest:
            return jsonify({"success": False, "error": "origin and destination are required"}), 400

        key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not key:
            return jsonify({"success": False, "error": "Server directions key missing"}), 500

        params = {
            "origin": f'{origin["lat"]},{origin["lng"]}',
            "destination": f'{dest["lat"]},{dest["lng"]}',
            "mode": mode,
            "key": key,
        }
        r = requests.get("https://maps.googleapis.com/maps/api/directions/json", params=params, timeout=10)
        j = r.json()
        status = j.get("status", "UNKNOWN_ERROR")
        if status != "OK":
            return jsonify({"success": False, "error": status, "details": j}), 400

        route = j["routes"][0]
        leg   = route["legs"][0]

        result = {
            "success": True,
            "distanceText": leg["distance"]["text"],
            "durationText": leg["duration"]["text"],
            "startAddress": leg.get("start_address", ""),
            "endAddress":   leg.get("end_address", ""),
            "polyline": route["overview_polyline"]["points"],
            "steps": [
                {
                    "html": s["html_instructions"],
                    "distance": s["distance"]["text"],
                    "duration": s["duration"]["text"]
                } for s in leg["steps"]
            ]
        }
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Campus Navigator API',
        'version': '1.0.0'
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Check if database exists
    if not os.path.exists('campus_navigator.db'):
        print("ERROR: Database not found! Run setup_database.py first.")
        sys.exit(1)
    
    print("=" * 50)
    print("Campus Navigator API Server")
    print("=" * 50)
    print("\nEndpoints:")
    print("  POST   /api              - Process chat query")
    print("  GET    /api/buildings    - List all buildings")
    print("  GET    /api/building/<id> - Get building details")
    print("  POST   /api/route        - Get route between buildings")
    print("  POST   /api/directions   - Get directions between coordinates")
    print("  GET    /api/search?q=    - Search buildings")
    print("  GET    /api/health       - Health check")
    print("\nStarting server on http://0.0.0.0:5000")
    print("=" * 50)
    
    # Run server
    # Use 0.0.0.0 to allow mobile devices to connect
    app.run(host='0.0.0.0', port=5000, debug=True)