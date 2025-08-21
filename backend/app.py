from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import json
import shutil
import subprocess
import asyncio
from pathlib import Path
from typing import Optional
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Instructors Copilot API", version="1.0.0")

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],  # Frontend URL
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
    Run the backend processing pipeline to generate course content
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
        
        logger.info("Starting backend processing pipeline...")
        
        # Run the backend processing pipeline
        # This follows the sequence from start.bat
        try:
            # Step 1: Generate master instructions
            logger.info("Step 1: Generating master instructions...")
            result = subprocess.run(["python", "llm.py"], 
                                  cwd=Path.cwd(), 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=300)  # 5 minute timeout
            
            if result.returncode != 0:
                logger.error(f"LLM step failed: {result.stderr}")
                return JSONResponse(status_code=500, content={"error": f"Master instruction generation failed: {result.stderr}"})
            
            # Step 2: Run copilot agents
            logger.info("Step 2: Running copilot agents...")
            copilot_dir = Path("copilot")
            
            # Run main.py
            result = subprocess.run(["python", "main.py"], 
                                  cwd=copilot_dir, 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=300)
            
            if result.returncode != 0:
                logger.warning(f"Main copilot step had issues: {result.stderr}")
            
            # Run deep_main.py
            result = subprocess.run(["python", "deep_main.py"], 
                                  cwd=copilot_dir, 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=300)
            
            if result.returncode != 0:
                logger.warning(f"Deep copilot step had issues: {result.stderr}")
            
            # Step 3: Generate course materials
            logger.info("Step 3: Generating course materials...")
            processes = [
                "course_material.py",
                "quizzes.py",
                "flash_cards.py",
                "ppt.py"
            ]
            
            for process in processes:
                logger.info(f"Running {process}...")
                result = subprocess.run(["python", process], 
                                      cwd=Path.cwd(), 
                                      capture_output=True, 
                                      text=True, 
                                      timeout=600)  # 10 minute timeout for each
                
                if result.returncode != 0:
                    logger.warning(f"{process} had issues: {result.stderr}")
            
            logger.info("Backend processing pipeline completed!")
            
            # Check for generated content
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
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Content generation completed successfully",
                    "generated_files": generated_files,
                    "total_files": len(generated_files)
                }
            )
            
        except subprocess.TimeoutExpired:
            logger.error("Backend processing timed out")
            raise HTTPException(status_code=500, detail="Content generation timed out")
        
        except Exception as e:
            logger.error(f"Backend processing error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")
        
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
    uvicorn.run(app, host="0.0.0.0", port=5000)
