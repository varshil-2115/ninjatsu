from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False) 
    age = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    progress = db.relationship('Progress', backref='player', uselist=False, cascade="all, delete-orphan")
    scores = db.relationship('GameScore', backref='player', cascade="all, delete-orphan")
    quests = db.relationship('DailyQuest', backref='player', cascade="all, delete-orphan")

class Progress(db.Model):
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    current_level = db.Column(db.Integer, default=1)
    total_xp = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GameScore(db.Model):
    __tablename__ = 'game_scores'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    game_name = db.Column(db.String(50), nullable=False)  # e.g., 'Word Ninja', 'Math Slash'
    score = db.Column(db.Integer, default=0)
    played_at = db.Column(db.DateTime, default=datetime.utcnow)

class Badge(db.Model):
    __tablename__ = 'badges'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    required_xp = db.Column(db.Integer, nullable=False)
    icon_path = db.Column(db.String(255), nullable=False)

class DailyQuest(db.Model):
    __tablename__ = 'daily_quests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    quest_name = db.Column(db.String(100), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    date_assigned = db.Column(db.String(20), nullable=False)