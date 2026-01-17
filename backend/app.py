from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)
# Allow CORS for local development
CORS(app)

DB_NAME = 'green_careers.db'

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        career_goal TEXT,
        life_points INTEGER DEFAULT 0,
        badge_level TEXT DEFAULT 'Beginner'
    )''')
    
    # Skills table
    c.execute('''CREATE TABLE IF NOT EXISTS user_skills (
        user_id INTEGER,
        skill_name TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')
    
    # LiFE Actions Log
    c.execute('''CREATE TABLE IF NOT EXISTS user_life_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action_id TEXT,
        action_name TEXT,
        points INTEGER,
        category TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')

    # Seed initial data if empty
    # For now, we'll just keep it simple.
    
    conn.commit()
    conn.close()
    print("Database initialized.")

# --- Mock Data ---

JOBS_DB = [
    {
        "id": 1,
        "title": "Solar Energy Engineer",
        "sector": "Renewable Energy",
        "description": "Design and implement solar PV systems for residential and commercial use.",
        "salary": "₹8-12 LPA",
        "demand": "High",
        "skills_required": ["Solar PV Basics", "Electrical Engineering", "AutoCAD", "Project Management"],
        "min_life_points": 100,
        "is_govt_role": False,
        "ndc_impact": "Contributes to India's 500GW renewable energy target by 2030."
    },
    {
        "id": 2,
        "title": "Urban Sustainability Officer",
        "sector": "Smart Cities",
        "description": "Government role. Plan and monitor city-wide sustainability initiatives.",
        "salary": "₹10-15 LPA",
        "demand": "Medium",
        "skills_required": ["Urban Planning", "GIS", "Waste Management", "Public Policy"],
        "min_life_points": 300,
        "is_govt_role": True,
        "ndc_impact": "Directly supports sustainable urbanization and emissions reduction targets."
    },
    {
        "id": 3,
        "title": "Climate Data Analyst",
        "sector": "Climate Tech",
        "description": "Analyze climate models and data to predict trends and inform policy.",
        "salary": "₹12-18 LPA",
        "demand": "Very High",
        "skills_required": ["Python", "Data Analysis", "Climate Modeling", "Statistics"],
        "min_life_points": 50,
        "is_govt_role": False,
        "ndc_impact": "Provides critical data for monitoring NDC progress."
    },
    {
        "id": 4,
        "title": "Agro-Forestry Consultant",
        "sector": "Sustainable Agriculture",
        "description": "Help farmers implement sustainable forestry practices.",
        "salary": "₹6-9 LPA",
        "demand": "Growing",
        "skills_required": ["Agriculture", "Soil Science", "Forestry", "Community Engagement"],
        "min_life_points": 150,
        "is_govt_role": False,
        "ndc_impact": "Increases carbon sinks through forest cover expansion (2.5-3B tons CO2e)."
    },
    {
        "id": 5,
        "title": "E-Waste Management Specialist",
        "sector": "Circular Economy",
        "description": "Manage and optimize e-waste recycling processes.",
        "salary": "₹7-10 LPA",
        "demand": "High",
        "skills_required": ["Waste Management", "Supply Chain", "Environmental Law", "Logistics"],
        "min_life_points": 200,
        "is_govt_role": True,
        "ndc_impact": "Reduces environmental pollution and promotes circular economy."
    }
]

COURSES_DB = [
    {
        "id": "c1",
        "title": "Introduction to Solar Energy",
        "provider": "NPTEL",
        "duration": "8 weeks",
        "level": "Beginner",
        "skills_taught": ["Solar PV Basics", "Renewable Energy"],
        "life_points_reward": 50
    },
    {
        "id": "c2",
        "title": "Urban Planning for Sustainability",
        "provider": "Coursera",
        "duration": "12 weeks",
        "level": "Intermediate",
        "skills_taught": ["Urban Planning", "Public Policy"],
        "life_points_reward": 80
    },
    {
        "id": "c3",
        "title": "Data Science for Climate Change",
        "provider": "EdX",
        "duration": "10 weeks",
        "level": "Advanced",
        "skills_taught": ["Python", "Data Analysis", "Climate Modeling"],
        "life_points_reward": 100
    }
]

LIFE_ACTIONS_DB = {
    "energy": [
        {"id": "e1", "action": "Install LED Bulbs", "points": 10, "carbon": 0.1, "skill": "Energy Efficiency", "category": "Beginner"},
        {"id": "e2", "action": "Install Solar Water Heater", "points": 50, "carbon": 0.5, "skill": "Renewable Tech", "category": "Intermediate"},
        {"id": "e3", "action": "Home Energy Audit", "points": 30, "carbon": 0.2, "skill": "Energy Auditing", "category": "Intermediate"}
    ],
    "transport": [
        {"id": "t1", "action": "Use Public Transport (Weekly)", "points": 20, "carbon": 0.3, "skill": "Sustainable Mobility", "category": "Beginner"},
        {"id": "t2", "action": "Cycle to Work", "points": 40, "carbon": 0.4, "skill": "Active Transport", "category": "Intermediate"},
        {"id": "t3", "action": "Buy EV", "points": 200, "carbon": 1.5, "skill": "EV Technology", "category": "Advanced"}
    ],
    "waste": [
        {"id": "w1", "action": "Start Composting", "points": 30, "carbon": 0.2, "skill": "Organic Waste Mgmt", "category": "Intermediate"},
        {"id": "w2", "action": "Zero Single-Use Plastic", "points": 25, "carbon": 0.1, "skill": "Waste Reduction", "category": "Beginner"}
    ]
}

# --- Routes ---

@app.route('/api/init', methods=['POST'])
def initialize():
    init_db()
    return jsonify({"message": "Database initialized"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    
    if not user:
        # Auto-register for demo purposes
        c.execute("INSERT INTO users (name, email, password, life_points) VALUES (?, ?, ?, ?)",
                  (data.get('name', 'User'), email, 'password', 0))
        conn.commit()
        user_id = c.lastrowid
        user = {"id": user_id, "name": data.get('name', 'User'), "email": email, "life_points": 0, "career_goal": ""}
    else:
        user = dict(user)
    
    conn.close()
    return jsonify(user)

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db()
    c = conn.cursor()
    
    user = c.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    skills = [row['skill_name'] for row in c.execute("SELECT skill_name FROM user_skills WHERE user_id = ?", (user_id,))]
    actions = [dict(row) for row in c.execute("SELECT * FROM user_life_actions WHERE user_id = ?", (user_id,))]
    
    user_data = dict(user)
    user_data['skills'] = skills
    user_data['life_actions'] = actions
    
    conn.close()
    return jsonify(user_data)

@app.route('/api/user/<int:user_id>/update', methods=['POST'])
def update_user(user_id):
    data = request.json
    conn = get_db()
    c = conn.cursor()
    
    if 'careerGoal' in data:
        c.execute("UPDATE users SET career_goal = ? WHERE id = ?", (data['careerGoal'], user_id))
    
    if 'skills' in data:
        c.execute("DELETE FROM user_skills WHERE user_id = ?", (user_id,))
        for skill in data['skills']:
            c.execute("INSERT INTO user_skills (user_id, skill_name) VALUES (?, ?)", (user_id, skill))
            
    conn.commit()
    conn.close()
    return jsonify({"message": "Profile updated"})

@app.route('/api/user/<int:user_id>/action', methods=['POST'])
def add_action(user_id):
    data = request.json
    points = data.get('points', 0)
    
    conn = get_db()
    c = conn.cursor()
    
    # Log action
    c.execute("INSERT INTO user_life_actions (user_id, action_id, action_name, points, category) VALUES (?, ?, ?, ?, ?)",
              (user_id, data['id'], data['action'], points, data['category']))
    
    # Update total points
    c.execute("UPDATE users SET life_points = life_points + ? WHERE id = ?", (points, user_id))
    
    # Update badge (Simple logic)
    c.execute("SELECT life_points FROM users WHERE id = ?", (user_id,))
    total_points = c.fetchone()['life_points']
    
    new_badge = 'Beginner'
    if total_points > 100: new_badge = 'Climate Champion'
    if total_points > 300: new_badge = 'Sustainability Leader'
    if total_points > 500: new_badge = 'Planet Guardian'
    
    c.execute("UPDATE users SET badge_level = ? WHERE id = ?", (new_badge, user_id))
    
    conn.commit()
    conn.close()
    return jsonify({"message": "Action recorded", "new_total": total_points, "badge": new_badge})

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume():
    data = request.json
    text = data.get('text', '').lower()
    
    # Mock Intelligence: Keyword matching (Simulating NLP)
    # In a real hackathon, you could use a lightweight NLP lib like spacy or simple regex
    known_skills = [
        "Solar PV Basics", "Electrical Engineering", "AutoCAD", "Project Management",
        "Urban Planning", "GIS", "Waste Management", "Public Policy",
        "Python", "Data Analysis", "Climate Modeling", "Statistics",
        "Agriculture", "Soil Science", "Forestry", "Community Engagement",
        "Supply Chain", "Environmental Law", "Logistics"
    ]
    
    found_skills = []
    for skill in known_skills:
        if skill.lower() in text:
            found_skills.append(skill)
            
    # Also look for synonyms
    if "solar" in text and "energy" in text: found_skills.append("Solar PV Basics")
    if "code" in text or "coding" in text: found_skills.append("Python")
    
    return jsonify({"skills": list(set(found_skills))})

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    user_id = request.args.get('user_id')
    jobs = [job.copy() for job in JOBS_DB] # Deep copy to match fresh every time
    
    if user_id:
        conn = get_db()
        c = conn.cursor()
        user_skills = [row['skill_name'] for row in c.execute("SELECT skill_name FROM user_skills WHERE user_id = ?", (user_id,))]
        user_life_points_row = c.execute("SELECT life_points FROM users WHERE id = ?", (user_id,)).fetchone()
        user_life_points = user_life_points_row['life_points'] if user_life_points_row else 0
        conn.close()
        
        # Calculate match
        for job in jobs:
            matched = set(user_skills).intersection(set(job['skills_required']))
            match_score = int((len(matched) / len(job['skills_required'])) * 100) if job['skills_required'] else 0
            
            # LiFE Boost
            life_points_gap = max(0, job['min_life_points'] - user_life_points)
            job['meetsLifeRequirement'] = life_points_gap == 0
            job['lifePointsNeeded'] = life_points_gap
            job['matchedSkills'] = list(matched)
            job['missingSkills'] = list(set(job['skills_required']) - matched)
            job['match'] = match_score
            
            # --- Smart Course Recommendations ---
            # Suggest courses for missing skills
            recommended = []
            for missing in job['missingSkills']:
                for course in COURSES_DB:
                    if missing in course['skills_taught']:
                        if course not in recommended:
                            recommended.append(course)
            job['recommended_courses'] = recommended[:2] # Limit to 2
            
            # Boost logic
            if job['meetsLifeRequirement']:
                job['lifeBoost'] = 15
                job['match'] = min(100, match_score + 15)
            else:
                job['lifeBoost'] = 0
                
        # Sort by match
        jobs.sort(key=lambda x: x['match'], reverse=True)
        
    return jsonify(jobs)

@app.route('/api/courses', methods=['GET'])
def get_courses():
    return jsonify(COURSES_DB)

@app.route('/api/life-actions', methods=['GET'])
def get_life_actions():
    return jsonify(LIFE_ACTIONS_DB)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
