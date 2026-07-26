import os
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Progress, GameScore, Badge

app = Flask(__name__)

# Secret key for session encryption
app.secret_key = 'ninjatsu_secret_key_for_semester_3'

# PostgreSQL Connection String Setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres123@localhost:5432/ninjatsu_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initializing the database
db.init_app(app)

# Hook to automatically create tables (will create database tables on initial run)
with app.app_context():
    db.create_all()
    # Insert dummy badges if the database is empty
    if Badge.query.count() == 0:
        b1 = Badge(name="🍃 Beginner Ninja", required_xp=0, icon_path="badge1.png")
        b2 = Badge(name="🌟 Shadow Trainee", required_xp=50, icon_path="badge2.png")
        b3 = Badge(name="⚔️ Blade Master", required_xp=100, icon_path="badge3.png")
        db.session.add_all([b1, b2, b3])
        db.session.commit()

# --- ROUTES ---

@app.route('/')
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
        
        # Check if user already exists
        user_exists = User.query.filter((User.username == username) | (User.email == email)).first()
        if user_exists:
            flash('Username or Email already registered!', 'danger')
            return redirect(url_for('register'))
            
        # Hash password to make it secure
        hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')
        
        new_user = User(username=username, email=email, password_hash=hashed_pw, age=int(age))
        db.session.add(new_user)
        db.session.commit() # So that user id gets generated
        
        # Initializing Progress for new user
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
            flash('Welcome back to the Dojo!', 'success')
            return redirect(url_for('homepage'))
        else:
            flash('Invalid credentials, try again!', 'danger')
            return redirect(url_for('login'))
            
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
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
    return render_template('maze_adventure.html')


@app.route('/word-speed-run')
def word_speed_run():
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

# API Route: To securely update score and XP on backend when a game is completed
@app.route('/api/update-xp', methods=['POST'])
def update_xp():
    if 'user_id' not in session:
        return jsonify({'status': 'unauthorized'}), 401
        
    data = request.get_json()
    xp_earned = data.get('xp', 0)
    game_name = data.get('game_name', 'Word Ninja')

    user_progress = Progress.query.filter_by(user_id=session['user_id']).first()
    if user_progress:
        user_progress.total_xp += xp_earned
        
        # Adaptive Level Logic: Level up every 50 XP
        new_level = (user_progress.total_xp // 50) + 1
        if new_level > user_progress.current_level:
            user_progress.current_level = min(new_level, 5) # Max level 5
            
        # Log Game Score
        score_log = GameScore(user_id=session['user_id'], game_name=game_name, score=xp_earned)
        db.session.add(score_log)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'total_xp': user_progress.total_xp,
            'current_level': user_progress.current_level
        })
        
    return jsonify({'status': 'error'}), 400

if __name__ == '__main__':
    app.run(debug=True)