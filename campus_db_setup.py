import sqlite3
import json

def setup_database():
    """Create and populate the campus database with sample data"""
    conn = sqlite3.connect('campus_navigator.db')
    cursor = conn.cursor()
    
    # Create Buildings table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS buildings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        aliases TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        description TEXT,
        building_hours TEXT,
        image_url TEXT,
        building_code TEXT
    )
    ''')
    
    # Create Points of Interest table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS poi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        building_id INTEGER,
        floor TEXT,
        room_number TEXT,
        poi_type TEXT,
        description TEXT,
        hours TEXT,
        FOREIGN KEY (building_id) REFERENCES buildings(id)
    )
    ''')
    
    # Create Routes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_building_id INTEGER,
        to_building_id INTEGER,
        distance_meters INTEGER,
        walk_time_minutes INTEGER,
        route_description TEXT,
        waypoints TEXT,
        FOREIGN KEY (from_building_id) REFERENCES buildings(id),
        FOREIGN KEY (to_building_id) REFERENCES buildings(id)
    )
    ''')
    
    # Insert sample buildings
    buildings_data = [
        ('Main Library', 'library, lib', 18.0179, -76.7495, '123 Campus Drive',
         'Three-story central library with study rooms and computer labs',
         json.dumps({"mon-fri": "7:00 AM - 11:00 PM", "sat-sun": "9:00 AM - 9:00 PM"}),
         '/images/library.jpg', 'LIB'),
        
        ('Student Center', 'student union, SC', 18.0185, -76.7500, '456 University Blvd',
         'Hub for student activities, dining, and events',
         json.dumps({"mon-sun": "6:00 AM - 12:00 AM"}),
         '/images/student_center.jpg', 'SC'),
        
        ('Science Building', 'science, sci building', 18.0175, -76.7485, '789 Research Way',
         'Modern facility with labs for biology, chemistry, and physics',
         json.dumps({"mon-fri": "8:00 AM - 10:00 PM", "sat": "9:00 AM - 5:00 PM", "sun": "Closed"}),
         '/images/science.jpg', 'SCI'),
        
        ('Engineering Hall', 'engineering, eng hall', 18.0190, -76.7490, '321 Innovation Drive',
         'State-of-the-art engineering labs and classrooms',
         json.dumps({"mon-fri": "7:00 AM - 10:00 PM", "sat-sun": "9:00 AM - 6:00 PM"}),
         '/images/engineering.jpg', 'ENG'),
        
        ('Athletics Center', 'gym, fitness center, sports', 18.0170, -76.7505, '555 Athletic Way',
         'Full gym with pool, basketball courts, and fitness equipment',
         json.dumps({"mon-fri": "6:00 AM - 11:00 PM", "sat-sun": "8:00 AM - 10:00 PM"}),
         '/images/athletics.jpg', 'ATH'),
        
        ('Administration Building', 'admin, admissions', 18.0188, -76.7492, '100 Campus Circle',
         'Main administrative offices, admissions, and registrar',
         json.dumps({"mon-fri": "8:00 AM - 5:00 PM", "sat-sun": "Closed"}),
         '/images/admin.jpg', 'ADM')
    ]
    
    cursor.executemany('''
    INSERT INTO buildings (name, aliases, latitude, longitude, address, description, building_hours, image_url, building_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', buildings_data)
    
    # Insert sample POIs
    poi_data = [
        ('Reference Desk', 1, '1', None, 'service', 'Get research help from librarians', 
         json.dumps({"mon-fri": "8:00 AM - 8:00 PM", "sat-sun": "10:00 AM - 6:00 PM"})),
        ('Quiet Study Room', 1, '2', '201', 'study_space', '24-seat silent study area', None),
        ('Food Court', 2, '1', None, 'dining', 'Multiple food vendors and seating for 300', 
         json.dumps({"mon-sun": "7:00 AM - 10:00 PM"})),
        ('Chemistry Lab', 3, '2', '205', 'lab', 'Advanced chemistry laboratory', None),
        ('Computer Lab', 4, '1', '115', 'computer_lab', '40 workstations with engineering software',
         json.dumps({"mon-fri": "8:00 AM - 9:00 PM", "sat-sun": "10:00 AM - 6:00 PM"})),
        ('Swimming Pool', 5, '1', None, 'facility', 'Olympic-size indoor pool',
         json.dumps({"mon-fri": "6:00 AM - 9:00 PM", "sat-sun": "8:00 AM - 8:00 PM"}))
    ]
    
    cursor.executemany('''
    INSERT INTO poi (name, building_id, floor, room_number, poi_type, description, hours)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', poi_data)
    
    # Insert sample routes
    routes_data = [
        (1, 2, 150, 2, 'Exit library, turn right, walk along Campus Drive for 150m',
         json.dumps([[18.0179, -76.7495], [18.0182, -76.7498], [18.0185, -76.7500]])),
        (1, 3, 120, 2, 'Exit library, turn left toward Research Way',
         json.dumps([[18.0179, -76.7495], [18.0177, -76.7490], [18.0175, -76.7485]])),
        (2, 4, 180, 3, 'Exit Student Center, head north on University Blvd',
         json.dumps([[18.0185, -76.7500], [18.0187, -76.7495], [18.0190, -76.7490]])),
        (3, 4, 200, 3, 'Walk north along Research Way to Innovation Drive',
         json.dumps([[18.0175, -76.7485], [18.0182, -76.7488], [18.0190, -76.7490]])),
        (2, 5, 220, 3, 'Exit Student Center, head south on Athletic Way',
         json.dumps([[18.0185, -76.7500], [18.0178, -76.7503], [18.0170, -76.7505]])),
        (1, 6, 140, 2, 'Exit library, walk north to Campus Circle',
         json.dumps([[18.0179, -76.7495], [18.0183, -76.7494], [18.0188, -76.7492]]))
    ]
    
    cursor.executemany('''
    INSERT INTO routes (from_building_id, to_building_id, distance_meters, walk_time_minutes, route_description, waypoints)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', routes_data)
    
    conn.commit()
    conn.close()
    print("Database setup complete! Created campus_navigator.db with sample data.")

if __name__ == "__main__":
    setup_database()
