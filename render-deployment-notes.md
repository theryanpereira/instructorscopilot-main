# Render deployment configuration
# This file should be placed in your repository root

# Build Command: pip install -r backend/requirements.txt
# Start Command: cd backend && python app.py
# Environment: Python 3.11

# Make sure these environment variables are set in Render:
# - PORT (auto-set by Render)
# - Any Google API keys required by google-adk and google-genai

# File structure for Render:
# /
# ├── backend/
# │   ├── app.py (main FastAPI app)
# │   ├── requirements.txt
# │   ├── start.sh (executable)
# │   └── ... (other Python files)
# └── render.yaml (this file)
