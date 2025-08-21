#!/usr/bin/env python3
"""
Python script that exactly mimics the start.sh shell script behavior
Runs the complete AI Copilot for Instructors pipeline
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None, description=""):
    """Run a command and handle errors"""
    print(f"Running: {command}")
    if description:
        print(f"Description: {description}")
    
    try:
        result = subprocess.run(
            command.split() if isinstance(command, str) else command,
            cwd=cwd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=600
        )
        
        if result.returncode == 0:
            print(f"✓ {command} completed successfully")
            if result.stdout:
                print(f"Output: {result.stdout[:200]}...")
        else:
            print(f"⚠ {command} completed with warnings")
            if result.stderr:
                print(f"Stderr: {result.stderr[:200]}...")
        
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print(f"✗ {command} timed out")
        return False
    except Exception as e:
        print(f"✗ {command} failed: {str(e)}")
        return False

def main():
    """
    Execute the exact sequence from start.sh:
    
    echo "Starting AI Copilot for Instructors..."
    python llm.py
    echo "Master instructions generated."
    echo "Starting agents"
    cd copilot
    python main.py
    python deep_main.py
    cd ..
    python course_material.py
    python quizzes.py
    python flash_cards.py
    python ppt.py
    cd ..
    """
    
    # Get the current working directory (should be the backend directory)
    backend_dir = Path.cwd()
    copilot_dir = backend_dir / "copilot"
    
    print("Starting AI Copilot for Instructors...")
    
    # Step 1: python llm.py
    success = run_command("python llm.py", cwd=backend_dir, 
                         description="Generating master instructions")
    if not success:
        print("Failed at llm.py step")
        return False
    
    print("Master instructions generated.")
    
    # Step 2: Starting agents
    print("Starting agents")
    
    # Step 3: cd copilot && python main.py
    success = run_command("python main.py", cwd=copilot_dir,
                         description="Running main copilot agent")
    if not success:
        print("Warning: main.py had issues, continuing...")
    
    # Step 4: python deep_main.py (still in copilot directory)
    success = run_command("python deep_main.py", cwd=copilot_dir,
                         description="Running deep copilot agent")
    if not success:
        print("Warning: deep_main.py had issues, continuing...")
    
    # Step 5: cd .. && python course_material.py
    success = run_command("python course_material.py", cwd=backend_dir,
                         description="Generating course materials")
    if not success:
        print("Warning: course_material.py had issues, continuing...")
    
    # Step 6: python quizzes.py
    success = run_command("python quizzes.py", cwd=backend_dir,
                         description="Generating quizzes")
    if not success:
        print("Warning: quizzes.py had issues, continuing...")
    
    # Step 7: python flash_cards.py
    success = run_command("python flash_cards.py", cwd=backend_dir,
                         description="Generating flash cards")
    if not success:
        print("Warning: flash_cards.py had issues, continuing...")
    
    # Step 8: python ppt.py
    success = run_command("python ppt.py", cwd=backend_dir,
                         description="Generating PowerPoint presentations")
    if not success:
        print("Warning: ppt.py had issues, continuing...")
    
    # Step 9: cd .. (final step - we're already in the right directory)
    print("\n🎉 AI Copilot for Instructors pipeline completed!")
    
    # List generated files
    output_dir = backend_dir / "Inputs and Outputs"
    if output_dir.exists():
        generated_files = list(output_dir.glob("*.*"))
        if generated_files:
            print(f"\n📁 Generated {len(generated_files)} files:")
            for file_path in generated_files:
                print(f"  - {file_path.name}")
        else:
            print("\n📁 No files found in output directory")
    else:
        print("\n📁 Output directory not found")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
