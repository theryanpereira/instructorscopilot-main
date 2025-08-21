from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import json
import shutil
import subprocess
import asyncio
import platform
from pathlib import Path
from typing import Optional
import logging
from datetime import datetime

# Set environment variables for proper encoding
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Instructors Copilot API", version="1.0.0")

# CORS middleware to allow frontend to connect
cors_env = os.environ.get("BACKEND_CORS_ORIGINS", "")
extra_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
default_origins = [
        "http://localhost:8080",
        "http://localhost:5173",
        "https://instructorscopilot-main-lovat.vercel.app",
        "https://*.vercel.app",
]
allow_origins = list({*default_origins, *extra_origins})

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
UPLOAD_DIR = Path("Inputs and Outputs")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Instructors Copilot API is running"}

@app.post("/upload-curriculum/")
async def upload_curriculum(
    file: UploadFile = File(...),
    user_name: str = Form(...),
    user_id: str = Form(...),
    course_topic: str = Form(...),
    no_of_weeks: int = Form(...),
    difficulty_level: str = Form(...),
    teaching_style: str = Form(...)
):
    """
    Upload curriculum PDF and create user configuration
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save the uploaded PDF file
        pdf_file_path = UPLOAD_DIR / "curriculum.pdf"
        
        # Remove existing curriculum file if it exists
        if pdf_file_path.exists():
            pdf_file_path.unlink()
        
        # Save the new file
        with open(pdf_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"PDF file saved: {pdf_file_path}")
        
        # Create user configuration JSON
        user_config = {
            "user_name": user_name,
            "user_id": user_id,
            "course_topic": course_topic,
            "difficulty_level": difficulty_level,
            "duration": no_of_weeks,  # Backend expects 'duration' field
            "teaching_style": teaching_style,
            "created_at": datetime.now().isoformat(),
            "curriculum_file": str(pdf_file_path)
        }
        
        # Save user config
        config_file_path = Path("user_config.json")
        with open(config_file_path, 'w', encoding='utf-8') as f:
            json.dump(user_config, f, indent=2)
        
        logger.info(f"User config saved: {config_file_path}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "File uploaded and configuration saved successfully",
                "file_name": file.filename,
                "config": user_config
            }
        )
        
    except Exception as e:
        logger.error(f"Error in upload_curriculum: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/generate-content/")
async def generate_content():
    """
    Run the shell script directly to generate course content
    """
    try:
        # Check if user config exists
        config_file_path = Path("user_config.json")
        if not config_file_path.exists():
            raise HTTPException(status_code=400, detail="No user configuration found. Please upload curriculum first.")
        
        # Check if curriculum PDF exists
        pdf_file_path = UPLOAD_DIR / "curriculum.pdf"
        if not pdf_file_path.exists():
            raise HTTPException(status_code=400, detail="No curriculum PDF found. Please upload curriculum first.")
        
        # Resolve backend directory and select script per platform
        backend_dir = Path(__file__).resolve().parent
        if platform.system() == "Windows":
            script_to_run = backend_dir / "start.bat"
            script_type = "batch"
        else:  # Linux/Unix (Render)
            script_to_run = backend_dir / "start.sh"
            script_type = "shell"
        
        if not script_to_run.exists():
            raise HTTPException(
                status_code=400, 
                detail=f"{script_to_run.name} script not found in backend directory. Platform: {platform.system()}"
            )
        
        logger.info(f"Starting AI Copilot for Instructors using {script_to_run} script...")
        
        # Set environment variables to prevent port conflicts
        env = os.environ.copy()
        env.update({
            'NO_SERVER': '1',
            'DISABLE_SERVICES': '1',
            'PYTHONUNBUFFERED': '1'
        })
        
        # Check for required environment variables
        if not env.get('GEMINI_API_KEY') and not env.get('GOOGLE_API_KEY'):
            logger.warning("GEMINI_API_KEY not found in environment variables")
        
        # Execute the script directly
        try:
            logger.info(f"Executing {script_type} script: {script_to_run}")
            
            if script_type == "batch":
                # On Windows, run the batch file directly with proper sequential execution
                result = subprocess.run(
                    [str(script_to_run)],
                    cwd=backend_dir,
                    text=True,
                    encoding='utf-8',
                    errors='replace',
                    shell=True,  # Use shell for batch files
                    env=env,
                    timeout=3600  # 1 hour timeout
                )
            else:
                # For shell scripts on Linux/Render - use bash directly
                result = subprocess.run(
                    ["bash", str(script_to_run)],
                    cwd=backend_dir,
                    capture_output=True,
                    text=True,
                    encoding='utf-8',
                    errors='replace',
                    timeout=3600,  # 1 hour timeout for Render
                    env=env
                )
            
            logger.info(f"Script execution completed with return code: {result.returncode}")
            
            # Log script output for debugging
            if result.stdout:
                logger.info(f"Script stdout: {result.stdout}")
            if result.stderr:
                logger.error(f"Script stderr: {result.stderr}")
            
            # Check for generated content (regardless of return code, some scripts may have warnings but still generate files)
            generated_files = []
            output_dir = UPLOAD_DIR
            
            if output_dir.exists():
                for file_path in output_dir.glob("*"):
                    if file_path.is_file() and file_path.suffix in ['.txt', '.docx', '.pdf', '.pptx']:
                        generated_files.append({
                            "name": file_path.name,
                            "path": str(file_path),
                            "size": file_path.stat().st_size
                        })
            
            # Consider success if return code is 0 OR files were generated
            success = result.returncode == 0 or len(generated_files) > 0
            
            if success:
                return JSONResponse(
                    status_code=200,
                    content={
                        "message": "Script execution completed successfully!",
                        "generated_files": generated_files,
                        "total_files": len(generated_files),
                        "process_completed": True,
                        "return_code": result.returncode
                    }
                )
            else:
                return JSONResponse(
                    status_code=500,
                    content={
                        "message": f"Script execution failed (return code: {result.returncode})",
                        "generated_files": generated_files,
                        "total_files": len(generated_files),
                        "process_completed": False,
                        "return_code": result.returncode
                    }
                )
            
        except Exception as e:
            logger.error(f"Script execution error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Script execution failed: {str(e)}")
        
    except Exception as e:
        logger.error(f"Error in generate_content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/")
async def get_status():
    """
    Get the current status of the system
    """
    try:
        config_exists = Path("user_config.json").exists()
        pdf_exists = (UPLOAD_DIR / "curriculum.pdf").exists()
        
        status = {
            "config_uploaded": config_exists,
            "curriculum_uploaded": pdf_exists,
            "ready_for_generation": config_exists and pdf_exists
        }
        
        if config_exists:
            with open("user_config.json", 'r', encoding='utf-8') as f:
                status["user_config"] = json.load(f)
        
        return status
        
    except Exception as e:
        logger.error(f"Error in get_status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generated-files/")
async def get_generated_files():
    """
    Get list of generated files
    """
    try:
        generated_files = []
        output_dir = UPLOAD_DIR
        
        if output_dir.exists():
            for file_path in output_dir.glob("*"):
                if file_path.is_file() and file_path.suffix in ['.txt', '.docx', '.pdf', '.pptx']:
                    generated_files.append({
                        "name": file_path.name,
                        "path": str(file_path),
                        "size": file_path.stat().st_size,
                        "modified": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
                    })
        
        return {
            "files": generated_files,
            "total": len(generated_files)
        }
        
    except Exception as e:
        logger.error(f"Error in get_generated_files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable for Render, fallback to 5000
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
