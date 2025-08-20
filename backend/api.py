# Import necessary FastAPI components, file handling utilities, and OS module
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import os
# Import the new update functions from llm.py for managing user and course configurations
from backend.llm import update_user_id_and_name, update_course_settings, _read_and_print_config_for_testing # Import update_course_settings and the testing function

# Initialize FastAPI application instance
app = FastAPI()

# Define the directory for file uploads, relative to the current file's parent directory
UPLOAD_DIRECTORY = Path(__file__).parent / "Inputs and Outputs"

# Event handler that runs when the FastAPI application starts up
@app.on_event("startup")
def startup_event():
    # Create the upload directory if it does not already exist
    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

# Endpoint for uploading curriculum PDF/DOCX files
@app.post("/upload-curriculum/")
async def upload_curriculum(file: UploadFile = File(...)):
    try:
        # Validate file type to ensure it's a PDF or DOCX; raise HTTP 400 if invalid
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            raise HTTPException(status_code=400, detail="Invalid file type. Only .pdf and .docx are allowed.")

        # Define the path where the file will be saved, renaming it to "curriculum.pdf"
        file_path = UPLOAD_DIRECTORY / "curriculum.pdf" # Renamed to curriculum.pdf
        # Read the contents of the uploaded file asynchronously
        contents = await file.read()
        # Write the file contents to the specified path in binary write mode
        with open(file_path, "wb") as f:
            f.write(contents)

        # Return a success JSON response upon successful upload
        return JSONResponse(status_code=200, content={"message": f"File '{file.filename}' uploaded successfully to {UPLOAD_DIRECTORY}"})
    # Catch any exceptions that occur during the upload process and return an HTTP 500 error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

# Endpoint for saving initial user configuration (user_id and a default user_name) from login
@app.post("/save-user-config")
async def save_user_config(user_data: dict):
    try:
        # Extract user_id from the request data
        user_id = user_data.get("user_id")
        # Extract user_name, providing a default "default_user" if not present
        user_name = user_data.get("user_name", "default_user") # Default user_name as per plan

        # Validate that user_id is provided; raise HTTP 400 if missing
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required.")

        # Call the llm.py function to update user ID and name in the configuration file
        update_user_id_and_name(user_id, user_name)
        
        # Return a success JSON response
        return JSONResponse(status_code=200, content={"message": "User ID and default user name saved successfully."})
    # Catch any exceptions during the save process and return an HTTP 500 error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save user configuration: {str(e)}")

# New endpoint for saving only the user's full name (from onboarding step 1)
@app.post("/save-user-name")
async def save_user_name(user_data: dict):
    try:
        # Extract user_id and user_name from the request data
        user_id = user_data.get("user_id")
        user_name = user_data.get("user_name")

        # Validate that both user_id and user_name are provided; raise HTTP 400 if missing
        if not user_id or not user_name:
            raise HTTPException(status_code=400, detail="user_id and user_name are required.")

        # Call the llm.py function to update user ID and name in the configuration file
        update_user_id_and_name(user_id, user_name)
        # Return a success JSON response
        return JSONResponse(status_code=200, content={"message": "User name saved successfully."})
    # Catch any exceptions during the save process and return an HTTP 500 error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save user name: {str(e)}")

# New endpoint for saving course-specific settings (from the create page)
@app.post("/save-course-settings")
async def save_course_settings(course_data: dict):
    try:
        # Extract all required course settings from the request data
        user_id = course_data.get("user_id")
        course_title = course_data.get("course_title")
        difficulty_level = course_data.get("difficulty_level")
        duration = course_data.get("duration")
        teaching_style = course_data.get("teaching_style")

        # Validate that all required course settings are provided; raise HTTP 400 if any are missing
        if not all([user_id, course_title, difficulty_level, duration, teaching_style]):
            raise HTTPException(status_code=400, detail="All course settings (user_id, course_title, difficulty_level, duration, teaching_style) are required.")

        # Call the llm.py function to update course settings in the configuration file
        update_course_settings(user_id, course_title, difficulty_level, duration, teaching_style)

        # TEST CODE: Immediately read and print the updated user_config.json for verification
        _read_and_print_config_for_testing()

        # Return a success JSON response
        return JSONResponse(status_code=200, content={"message": "Course settings saved successfully."})
    # Catch any exceptions during the save process and return an HTTP 500 error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save course settings: {str(e)}")
