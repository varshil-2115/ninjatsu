import os
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, Response
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Progress, GameScore, Badge, DailyQuest, SiteVisit

app = Flask(__name__)

# Secret key for session encryption
app.secret_key = os.environ.get('SECRET_KEY', 'ninjatsu_secret_key_for_semester_3')

# Dynamic Database Connection (Production on Render or Local Fallback)
database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres123@localhost:5432/ninjatsu_db')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initializing the database
db.init_app(app)

# Hook to automatically create tables, badges, and default admin account on initial run
with app.app_context():
    db.create_all()
    
    # Insert dummy badges if the database is empty
    if Badge.query.count() == 0:
        b1 = Badge(name="Beginner Ninja", required_xp=0, icon_path="badge1.png")
        b2 = Badge(name="Shadow Trainee", required_xp=50, icon_path="badge2.png")
        b3 = Badge(name="Blade Master", required_xp=100, icon_path="badge3.png")
        db.session.add_all([b1, b2, b3])
        db.session.commit()

    # Automatically create or sync master admin account
    try:
        admin_exists = User.query.filter((User.username == 'ninjamaster') | (User.email == 'master@ninjatsu.com')).first()
        if not admin_exists:
            hashed_admin_pw = generate_password_hash('master150', method='pbkdf2:sha256')
            admin_user = User(username='ninjamaster', email='master@ninjatsu.com', password_hash=hashed_admin_pw, age=20)
            db.session.add(admin_user)
            db.session.commit()
            
            admin_progress = Progress(user_id=admin_user.id, current_level=5, total_xp=500)
            db.session.add(admin_progress)
            db.session.commit()
        else:
            admin_exists.password_hash = generate_password_hash('master150', method='pbkdf2:sha256')
            db.session.commit()
    except Exception:
        db.session.rollback()

# --- MIDDLEWARE ---

@app.before_request
def record_visitor():
    # Skip static files, favicon, API calls, and admin views
    if (request.path.startswith('/static') or 
        request.path.startswith('/admin') or 
        request.path.startswith('/api') or 
        request.path == '/favicon.ico'):
        return

    try:
        # Read visitor IP behind Render's reverse proxy
        visitor_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if visitor_ip and ',' in visitor_ip:
            visitor_ip = visitor_ip.split(',')[0].strip()

        visit = SiteVisit(ip_address=visitor_ip, endpoint=request.path)
        db.session.add(visit)
        db.session.commit()
    except Exception:
        db.session.rollback()

# --- ROUTES ---

@app.route('/')
def loading_screen():
    return render_template('loading.html')

@app.route('/home')
def homepage():
    return render_template('Ninjatsu_homepage.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.form
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        age = data.get('age')
        
        user_exists = User.query.filter((User.username == username) | (User.email == email)).first()
        if user_exists:
            flash('Username or Email already registered!', 'danger')
            return redirect(url_for('register'))
            
        hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, email=email, password_hash=hashed_pw, age=int(age))
        db.session.add(new_user)
        db.session.commit()
        
        new_progress = Progress(user_id=new_user.id, current_level=1, total_xp=0)
        db.session.add(new_progress)
        db.session.commit()
        
        flash('Registration Successful! Please Login, Ninja.', 'success')
        return redirect(url_for('login'))
        
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username

            if user.username.lower() in ['ninjamaster', 'admin']:
                flash('Welcome to the Master Control Center, Sensei!', 'success')
                return redirect(url_for('admin_panel'))

            flash('Welcome back to the Dojo!', 'success')
            return redirect(url_for('homepage'))
        else:
            flash('Invalid credentials, try again!', 'danger')
            return redirect(url_for('login'))
            
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    session.clear()
    flash('You have been logged out successfully!', 'info')
    return redirect(url_for('homepage'))

@app.route('/explore-games')
def explore_games():
    user_progress = None
    if 'user_id' in session:
        user_progress = Progress.query.filter_by(user_id=session['user_id']).first()
    return render_template('explore_game.html', user_progress=user_progress)

@app.route('/math-slice')
def math_slice():
    if 'user_id' not in session:
        flash('Please login first!', 'warning')
        return redirect(url_for('login'))
        
    user_progress = Progress.query.filter_by(user_id=session['user_id']).first()
    REQUIRED_XP = 50
    
    if not user_progress or user_progress.total_xp < REQUIRED_XP:
        flash(f'You need at least {REQUIRED_XP} Stars to enter Number Slice!', 'warning')
        return redirect(url_for('explore_games'))
        
    return render_template('math_slice.html')

@app.route('/start-learning')
def start_learning():
    if 'user_id' not in session:
        flash('Please login to play!', 'warning')
        return redirect(url_for('login'))
    
    user_progress = Progress.query.filter_by(user_id=session['user_id']).first()
    return render_template('start_learning.html', progress=user_progress)

@app.route('/rewards')
def rewards():
    if 'user_id' not in session:
        flash('Please login to the Dojo first!', 'warning')
        return redirect(url_for('login'))
        
    user_progress = Progress.query.filter_by(user_id=session['user_id']).first()
    all_badges = Badge.query.all()
    return render_template('reward.html', progress=user_progress, badges=all_badges)

@app.route('/daily-quests')
def daily_quests():
    if 'user_id' not in session:
        flash('Please login to view your Daily Quests!', 'warning')
        return redirect(url_for('login'))
        
    user_id = session['user_id']
    today_date = datetime.now().strftime('%Y-%m-%d')
    
    existing_quests = DailyQuest.query.filter_by(user_id=user_id, date_assigned=today_date).all()
    if not existing_quests:
        default_quests = [
            ("Solve 1 Math Puzzle", False),
            ("Play Word Race Game", False),
            ("Earn 50 XP Today", False)
        ]
        for q_name, status in default_quests:
            new_q = DailyQuest(user_id=user_id, quest_name=q_name, is_completed=status, date_assigned=today_date)
            db.session.add(new_q)
        db.session.commit()
        existing_quests = DailyQuest.query.filter_by(user_id=user_id, date_assigned=today_date).all()
        
    user_progress = Progress.query.filter_by(user_id=user_id).first()
    return render_template('daily_quests.html', quests=existing_quests, progress=user_progress)

@app.route('/word-ninja')
def word_ninja():
    if 'user_id' not in session:
        flash('Please login first!', 'warning')
        return redirect(url_for('login'))
    return render_template('word_ninja.html')

@app.route('/maze-adventure')
def maze_adventure():
    if 'user_id' not in session:
        flash('Please login first!', 'warning')
        return redirect(url_for('login'))
        
    user_progress = Progress.query.filter_by(user_id=session['user_id']).first()
    REQUIRED_XP = 100
    
    if not user_progress or user_progress.total_xp < REQUIRED_XP:
        flash(f'You need at least {REQUIRED_XP} Stars to enter Word Search!', 'warning')
        return redirect(url_for('explore_games'))
        
    return render_template('maze_adventure.html')

@app.route('/word-speed-run')
def word_speed_run():
    if 'user_id' not in session:
        flash('Please login first!', 'warning')
        return redirect(url_for('login'))
        
    user_progress = Progress.query.filter_by(user_id=session['user_id']).first()
    REQUIRED_LEVEL = 2
    if not user_progress or user_progress.current_level < REQUIRED_LEVEL:
        flash(f'Unlock Level {REQUIRED_LEVEL} in the Dojo to play Speed Trial!', 'warning')
        return redirect(url_for('start_learning'))
        
    return render_template('word_speed_run.html')

@app.route('/star-strike')
def star_strike():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('star_strike.html')

@app.route('/memory-ninja')
def memory_ninja():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('memory_ninja.html')

@app.route('/word-race')
def word_race():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('word_race.html')

# --- SECURE ADMIN PANEL ROUTES ---

@app.route('/admin-login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and username in ['ninjamaster', 'admin'] and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Welcome back, Grandmaster Admin!', 'success')
            return redirect(url_for('admin_panel'))
        else:
            flash('Invalid Admin Credentials!', 'danger')
            return redirect(url_for('admin_login'))
            
    return render_template('admin_login.html')

@app.route('/admin')
def admin_panel():
    if session.get('username') not in ['ninjamaster', 'admin']:
        flash('Please login as Admin to access Master Control!', 'warning')
        return redirect(url_for('login'))

    total_visits = SiteVisit.query.count()
    unique_visitors = db.session.query(SiteVisit.ip_address).distinct().count()

    students = User.query.filter(~User.username.in_(['ninjamaster', 'admin'])).order_by(User.id.asc()).all()
    total_students = len(students)

    total_xp_awarded = 0
    belt_counts = {"white": 0, "yellow": 0, "green": 0, "blue": 0, "black": 0}

    for student in students:
        xp = student.progress.total_xp if student.progress else 0
        total_xp_awarded += xp

        if xp >= 300:
            belt_counts["black"] += 1
        elif xp >= 200:
            belt_counts["blue"] += 1
        elif xp >= 100:
            belt_counts["green"] += 1
        elif xp >= 50:
            belt_counts["yellow"] += 1
        else:
            belt_counts["white"] += 1

    total_games_played = GameScore.query.count()
    game_breakdown = {
        "star_strike": GameScore.query.filter(GameScore.game_name.ilike('%Star%')).count(),
        "word_speed_run": GameScore.query.filter(GameScore.game_name.ilike('%Speed%')).count(),
        "word_race": GameScore.query.filter(GameScore.game_name.ilike('%Race%')).count(),
        "math_slice": GameScore.query.filter(GameScore.game_name.ilike('%Math%')).count(),
        "word_search": GameScore.query.filter(GameScore.game_name.ilike('%Search%') | GameScore.game_name.ilike('%Maze%')).count(),
        "word_ninja": GameScore.query.filter(GameScore.game_name.ilike('%Ninja%')).count()
    }

    total_quests_completed = DailyQuest.query.filter_by(is_completed=True).count()

    return render_template(
        'admin_dashboard.html',
        users=students,
        total_users=total_students,
        total_xp_awarded=total_xp_awarded,
        belt_distribution=belt_counts,
        game_stats=game_breakdown,
        total_games_played=total_games_played,
        total_quests_completed=total_quests_completed,
        total_page_views=total_visits,
        unique_visitors=unique_visitors
    )

@app.route('/admin/delete-user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    if session.get('username') not in ['ninjamaster', 'admin']:
        flash('Unauthorized Action!', 'danger')
        return redirect(url_for('login'))

    user_to_delete = User.query.get_or_404(user_id)
    db.session.delete(user_to_delete)
    db.session.commit()
    
    flash(f'Ninja #{user_id} has been removed from the Dojo!', 'success')
    return redirect(url_for('admin_panel'))

# API Route: Securely update score and XP
@app.route('/api/update-xp', methods=['POST'])
def update_xp():
    if 'user_id' not in session:
        return jsonify({'status': 'unauthorized'}), 401
        
    data = request.get_json() or {}
    xp_earned = data.get('xp', 1)
    game_name = data.get('game_name', 'Word Ninja')

    user_id = session['user_id']
    user_progress = Progress.query.filter_by(user_id=user_id).first()
    if user_progress:
        user_progress.total_xp += xp_earned
        
        new_level = (user_progress.total_xp // 50) + 1
        if new_level > user_progress.current_level:
            user_progress.current_level = min(new_level, 5)
            
        score_log = GameScore(user_id=user_id, game_name=game_name, score=xp_earned)
        db.session.add(score_log)
        
        today_date = datetime.now().strftime('%Y-%m-%d')
        pending_quests = DailyQuest.query.filter_by(user_id=user_id, date_assigned=today_date, is_completed=False).all()
        for quest in pending_quests:
            if 'Math' in quest.quest_name and ('Math' in game_name or 'math' in game_name.lower()):
                quest.is_completed = True
            elif 'Word' in quest.quest_name and ('Word' in game_name or 'word' in game_name.lower() or 'Race' in game_name):
                quest.is_completed = True
            elif 'Earn 50 XP' in quest.quest_name and user_progress.total_xp >= 50:
                quest.is_completed = True
            elif 'Quest' in quest.quest_name:
                quest.is_completed = True
            
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'total_xp': user_progress.total_xp,
            'current_level': user_progress.current_level
        })
        
    return jsonify({'status': 'error'}), 400

@app.route('/challenge/<username>')
def player_challenge(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return redirect(url_for('homepage'))
        
    progress = Progress.query.filter_by(user_id=user.id).first()
    total_stars = progress.total_xp if progress else 0
    
    if total_stars >= 300:
        belt = "Black Belt Master"
    elif total_stars >= 200:
        belt = "Blue Belt Striker"
    elif total_stars >= 100:
        belt = "Green Belt Warrior"
    elif total_stars >= 50:
        belt = "Yellow Belt Apprentice"
    else:
        belt = "White Belt Trainee"

    return render_template(
        'challenge.html',
        challenger=username,
        stars=total_stars,
        belt=belt
    )

@app.route('/robots.txt')
def robots():
    content = """User-agent: *
Allow: /
Allow: /home
Allow: /explore-games
Allow: /challenge/
Disallow: /admin
Disallow: /admin-login
Disallow: /api/
Disallow: /rewards

Sitemap: https://ninjatsu.onrender.com/sitemap.xml
"""
    return Response(content, mimetype="text/plain")

@app.route('/sitemap.xml')
def sitemap():
    content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ninjatsu.onrender.com/home</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ninjatsu.onrender.com/explore-games</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ninjatsu.onrender.com/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://ninjatsu.onrender.com/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
"""
    return Response(content, mimetype="application/xml")

if __name__ == '__main__':
    app.run(debug=True)