# app.py
from flask import Flask, render_template, request, jsonify, session
import os
import json
import uuid
from datetime import datetime
import random

app = Flask(__name__)
app.secret_key = 'sahara-mental-health-2024'

class SaharaChatbot:
    def __init__(self):
        self.responses = {
            'stress': [
                "I understand you're feeling stressed. This is completely normal. What's the main thing worrying you right now?",
                "Stress can feel overwhelming, but you're stronger than you think. Let's work through this together.",
                "I hear you. Stress is your mind's way of saying it cares about something important. Can you tell me more?"
            ],
            'exam': [
                "Exam anxiety is so common - almost every student goes through this. You've prepared well, and that counts for a lot.",
                "I get it, exams can feel huge. But remember, they're just one measure of your abilities, not your worth as a person.",
                "Exam stress is normal, and it shows you care about doing well. Would you like to try a quick relaxation technique?"
            ],
            'lonely': [
                "Feeling lonely can be really painful. Thank you for sharing this with me - that takes courage.",
                "You're not as alone as you feel right now. Sometimes loneliness is our heart's way of telling us we need connection.",
                "Loneliness is tough, but you're not alone. I'm here for you, and there are people who care about you."
            ],
            'family': [
                "Family problems can feel overwhelming sometimes. Your feelings are completely valid.",
                "Family relationships can be complex. Sometimes families have different ways of showing love or different expectations.",
                "I understand family situations can be difficult. Remember, this too shall pass. I'm here to listen."
            ],
            'depression': [
                "I hear the pain in your words, and I want you to know that what you're feeling is real and valid.",
                "Depression can make everything feel gray, but that's the depression talking, not the truth about your life.",
                "You're brave for reaching out. These feelings might benefit from talking to a counselor too."
            ],
            'crisis': [
                """I'm really concerned about you right now. Your life has value and meaning. Please reach out for immediate help:

🆘 Vandrevala Foundation: +91 99967 80804 (24/7)
🆘 SUMITRA: 011-23389090
🆘 Sneha India: +91 44 2464 0050

You don't have to face this alone. Professional help is available."""
            ],
            'default': [
                "I'm here to listen. Can you tell me more about how you're feeling?",
                "Thank you for sharing that with me. Your feelings are valid.",
                "I understand you're going through something. I'm here to support you.",
                "It takes courage to reach out. What's been on your mind lately?"
            ]
        }

    def get_response(self, message):
        message_lower = message.lower()
        
        # Crisis detection (highest priority)
        crisis_keywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'die', 'ending it', 'not worth living']
        if any(keyword in message_lower for keyword in crisis_keywords):
            return {
                'message': random.choice(self.responses['crisis']),
                'intent': 'crisis',
                'mood_impact': -2
            }
        
        # Stress detection
        stress_keywords = ['stress', 'stressed', 'pressure', 'overwhelming', 'anxious', 'anxiety', 'worried']
        if any(keyword in message_lower for keyword in stress_keywords):
            return {
                'message': random.choice(self.responses['stress']),
                'intent': 'stress',
                'mood_impact': 0
            }
        
        # Exam anxiety
        exam_keywords = ['exam', 'test', 'marks', 'grades', 'fail', 'results', 'performance', 'study']
        if any(keyword in message_lower for keyword in exam_keywords):
            return {
                'message': random.choice(self.responses['exam']),
                'intent': 'exam',
                'mood_impact': 0
            }
        
        # Loneliness
        lonely_keywords = ['lonely', 'alone', 'isolated', 'no friends', 'nobody understands', 'no one cares']
        if any(keyword in message_lower for keyword in lonely_keywords):
            return {
                'message': random.choice(self.responses['lonely']),
                'intent': 'lonely',
                'mood_impact': 1
            }
        
        # Family issues
        family_keywords = ['family', 'parents', 'home', 'fight', 'understand', 'mom', 'dad', 'siblings']
        if any(keyword in message_lower for keyword in family_keywords):
            return {
                'message': random.choice(self.responses['family']),
                'intent': 'family',
                'mood_impact': 0
            }
        
        # Depression indicators
        depression_keywords = ['sad', 'depressed', 'hopeless', 'worthless', 'nothing matters', 'pointless', 'empty']
        if any(keyword in message_lower for keyword in depression_keywords):
            return {
                'message': random.choice(self.responses['depression']),
                'intent': 'depression',
                'mood_impact': 1
            }
        
        # Default response
        return {
            'message': random.choice(self.responses['default']),
            'intent': 'default',
            'mood_impact': 1
        }

# Initialize chatbot
chatbot = SaharaChatbot()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
    return render_template('dashboard.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Empty message'}), 400
        
        # Get AI response
        response = chatbot.get_response(user_message)
        
        return jsonify({
            'response': response['message'],
            'intent': response['intent'],
            'timestamp': datetime.now().strftime('%I:%M %p'),
            'mood_impact': response.get('mood_impact', 0)
        })
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            'response': "I'm here for you. Please try sending your message again.",
            'timestamp': datetime.now().strftime('%I:%M %p')
        }), 500

@app.route('/api/mood', methods=['POST'])
def update_mood():
    try:
        data = request.get_json()
        mood = data.get('mood', 3)
        user_id = session.get('user_id', str(uuid.uuid4()))
        
        session['current_mood'] = mood
        session['user_id'] = user_id
        
        return jsonify({'status': 'success', 'mood': mood})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats')
def get_stats():
    # Mock data for dashboard
    return jsonify({
        'total_conversations': random.randint(50, 200),
        'mood_average': round(random.uniform(2.5, 4.0), 1),
        'active_users': random.randint(20, 80),
        'resources_accessed': random.randint(100, 500)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
