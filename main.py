from flask import Flask, request, jsonify, send_from_directory
import google.generativeai as genai
import os
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create model
model = genai.GenerativeModel("gemini-1.5-pro-latest")

# System prompt for science experiment recommender
SYSTEM_PROMPT = (
    """You are a Crypto and Investing Assistant Chatbot.
    You provide accurate, structured, and easy-to-understand information about cryptocurrencies and investing based on user queries.
    You remember previous interactions and respond in a way that maintains a natural and helpful conversation flow.
    If a user asks about topics not related to crypto or investing, politely inform them that you specialize only in those areas.
    When needed, provide structured explanations with sections like Overview, How It Works, Pros and Cons, and Tips for Beginners."""
)

# Start a persistent Gemini chat session
chat = model.start_chat(history=[{"role": "user", "parts": [SYSTEM_PROMPT]}])

# Serve the frontend
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Chat endpoint
@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"response": "Please enter a valid question."})

    # Send user message to Gemini chat
    response = chat.send_message(user_message)
    bot_response = response.text.strip()

    return jsonify({"response": bot_response})

# Run server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
