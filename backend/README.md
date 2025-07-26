# Backend

This is the backend service for the project, built with FastAPI.

## Setup

1. Create a virtual environment (optional but recommended):
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```sh
   uvicorn main:app --reload
   ```

The backend will be available at http://localhost:8000/ 