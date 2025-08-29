# Sahara + Dialogflow Integration Guide

## 🚀 Quick Setup Steps

### 1. Google Cloud Console Setup (5 minutes)

```bash
# Step 1: Go to Google Cloud Console
https://console.cloud.google.com/

# Step 2: Create new project
Project Name: sahara-mental-wellness
Project ID: sahara-wellness-[random-id]

# Step 3: Enable APIs
- Dialogflow API
- Cloud Functions API (for webhook)
```

### 2. Dialogflow Console Setup

```bash
# Go to Dialogflow Console
https://dialogflow.cloud.google.com/

# Create new agent
Agent Name: Sahara-AI
Language: English (primary) + Hindi (secondary)
Time Zone: Asia/Kolkata
```

## 🎯 Intent Configuration

### Core Intents for Mental Health

```json
// 1. Stress Intent
{
  "displayName": "stress.help",
  "trainingPhrases": [
    "I am very stressed",
    "feeling stressed out",
    "so much pressure",
    "exam stress",
    "academic pressure",
    "anxiety attack",
    "can't handle stress"
  ],
  "responses": {
    "text": [
      "I understand you're feeling stressed. This is completely normal, especially for students. Can you tell me what's bothering you the most?",
      "Stress is normal. You're not alone in this. Would you like me to share some breathing exercises that might help?"
    ]
  }
}

// 2. Exam Anxiety Intent
{
  "displayName": "exam.anxiety",
  "trainingPhrases": [
    "scared of exams",
    "exam fear",
    "test anxiety",
    "worried about results",
    "afraid of failing",
    "exam panic",
    "performance anxiety"
  ],
  "responses": {
    "text": [
      "Exam anxiety is something every student experiences. It's completely normal. You're not alone. Would you like me to share some study tips and relaxation techniques?",
      "Exam anxiety is common. You've worked so hard, you can do this! Let's try some calming techniques together."
    ]
  }
}

// 3. Loneliness Intent
{
  "displayName": "loneliness.support",
  "trainingPhrases": [
    "I feel so lonely",
    "feeling isolated",
    "no one understands me",
    "don't have friends",
    "feeling alone",
    "nobody cares about me",
    "socially isolated"
  ],
  "responses": {
    "text": [
      "Feeling lonely can be really painful. But remember, you're not truly alone. I'm here, and there are people who care about you.",
      "Loneliness is tough, but you're not alone. Would you like to talk to me about it? I'm here for you."
    ]
  }
}

// 4. Family Issues Intent
{
  "displayName": "family.problems",
  "trainingPhrases": [
    "problems at home",
    "family issues",
    "parents don't understand",
    "fighting with family",
    "family pressure",
    "home problems",
    "family stress"
  ],
  "responses": {
    "text": [
      "Family problems can feel overwhelming sometimes. Your feelings are valid. Would you like to talk more about this with me?",
      "I understand family situations can be difficult. Remember, this too shall pass. I'm here to listen."
    ]
  }
}

// 5. Depression Symptoms Intent
{
  "displayName": "depression.support",
  "trainingPhrases": [
    "feeling very sad",
    "depressed",
    "nothing makes me happy",
    "lost interest in everything",
    "feeling hopeless",
    "everything is pointless",
    "don't want to do anything"
  ],
  "responses": {
    "text": [
      "I hear you, and I want you to know that what you're feeling is real and valid. You're brave for sharing this. While I'm here to support you, these feelings might benefit from talking to a counselor too.",
      "Thank you for trusting me with your feelings. You don't have to go through this alone. Would you like me to share some resources that might help?"
    ]
  }
}

// 6. Crisis Intent (Important!)
{
  "displayName": "crisis.help",
  "trainingPhrases": [
    "want to hurt myself",
    "suicidal thoughts",
    "don't want to live",
    "thinking of ending it",
    "life is not worth living",
    "want to die"
  ],
  "responses": {
    "text": [
      "I'm really concerned about you right now. Your life has value and meaning. Please reach out to a crisis helpline immediately: \n\nVandrevala Foundation: +91 99967 80804\nSUMITRA: 011-23389090\n\nYou don't have to face this alone. Professional help is available."
    ]
  }
}
```



## 🌐 Webhook Setup (Cloud Functions)

### Simple Cloud Function for Dialogflow

```javascript
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({request, response});

  // Handle stress intent
  function handleStress(agent) {
    const responses = [
      "I understand you're feeling stressed. This is completely normal. What's the main thing that's worrying you right now?",
      "Stress can feel overwhelming, but you're stronger than you think. Let's work through this together. What's causing you the most stress?",
      "I hear you. Stress is your mind's way of saying it cares about something important. Can you tell me more about what's on your mind?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    agent.add(randomResponse);
  }

  // Handle exam anxiety
  function handleExamAnxiety(agent) {
    const responses = [
      "Exam anxiety is so common - almost every student goes through this. You've prepared well, and that counts for a lot. What specific part of the exam worries you most?",
      "I get it, exams can feel huge. But remember, they're just one measure of your abilities, not your worth as a person. How are you feeling about your preparation?",
      "Exam stress is normal, and it shows you care about doing well. That's actually a good sign! Would you like to try a quick relaxation technique?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    agent.add(randomResponse);
  }

  // Handle loneliness
  function handleLoneliness(agent) {
    const responses = [
      "Loneliness can feel so heavy. Thank you for sharing this with me - that takes courage. You're not as alone as you feel right now.",
      "I hear you, and I want you to know that feeling lonely doesn't mean you're not lovable or worthy of connection. Sometimes it just means you're human.",
      "Loneliness is painful, but it's also temporary. You've reached out to me today, which shows your strength. What's been making you feel most isolated?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    agent.add(randomResponse);
  }

  // Crisis intervention
  function handleCrisis(agent) {
    agent.add(`I'm really worried about you right now. Your life has value and meaning, even if it doesn't feel that way right now.

Please reach out for immediate help:
🆘 Vandrevala Foundation: +91 99967 80804 (24/7)
🆘 SUMITRA: 011-23389090
🆘 Sneha India: +91 44 2464 0050

You don't have to face this alone. There are people trained to help you through this moment.`);
  }

  // Map intents to functions
  let intentMap = new Map();
  intentMap.set('stress.help', handleStress);
  intentMap.set('exam.anxiety', handleExamAnxiety);
  intentMap.set('loneliness.support', handleLoneliness);
  intentMap.set('crisis.help', handleCrisis);

  agent.handleRequest(intentMap);
});
```


## 🔒 Privacy & Security Features

### Built-in Privacy Protection
- No user data stored by default
- Anonymous session IDs
- Automatic session timeout
- GDPR compliant
- No personal information required

### Crisis Intervention Protocol
- Automatic detection of crisis keywords
- Immediate helpline information
- Escalation procedures
- Local Indian mental health resources

## 🎯 Advanced Features to Add Later

1. **Sentiment Analysis** - Track user mood over time
2. **Multi-language Support** - Add Hindi, regional languages  
3. **Voice Integration** - Speech-to-text capabilities
4. **Resource Library** - Guided meditations, articles
5. **Professional Referrals** - Connect with real counselors
