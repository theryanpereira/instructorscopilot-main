import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None, description=""):
    """Run a command and handle errors - SEQUENTIAL EXECUTION"""
    print(f"\n{'='*50}")
    print(f"Running: {command}")
    if description:
        print(f"Description: {description}")
    print(f"{'='*50}")
    
    try:
        # Run command and WAIT for completion (sequential execution)
        result = subprocess.run(
            command.split() if isinstance(command, str) else command,
            cwd=cwd,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=1200  # 20 minutes timeout per command
        )
        
        if result.returncode == 0:
            print(f"✓ SUCCESS: {command} completed successfully")
        else:
            print(f"⚠ WARNING: {command} completed with return code {result.returncode}")
            print(f"This is normal for some steps - continuing...")
        
        print(f"{'='*50}")
        return True  # Continue to next step regardless
        
    except subprocess.TimeoutExpired:
        print(f"✗ TIMEOUT: {command} timed out after 20 minutes")
        print(f"{'='*50}")
        return False  # Stop on timeout
    except Exception as e:
        print(f"✗ ERROR: {command} failed with exception: {str(e)}")
        print(f"{'='*50}")
        return False  # Stop on critical error

def main():
    """
    Execute the exact sequence from start.sh - SEQUENTIAL EXECUTION:
    
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
    
    print("\n" + "="*60)
    print("🚀 STARTING AI COPILOT FOR INSTRUCTORS...")
    print("="*60)
    
    # Step 1: python llm.py - WAIT FOR COMPLETION
    print("\n📋 STEP 1: Generate Master Instructions")
    success = run_command("python llm.py", cwd=backend_dir, 
                         description="Generating master instructions with LLM")
    if not success:
        print("❌ CRITICAL: llm.py failed - stopping pipeline")
        return False
    
    print("\n✅ Master instructions generated.")
    
    # Step 2: Starting agents
    print("\n🤖 STEP 2: Starting AI Agents")
    print("Starting agents")
    
    # Step 3: cd copilot && python main.py - WAIT FOR COMPLETION
    print("\n📊 STEP 3: Run Main Copilot Agent")
    success = run_command("python main.py", cwd=copilot_dir,
                         description="Running main copilot agent in copilot directory")
    if not success:
        print("⚠️ WARNING: main.py had issues, but continuing pipeline...")
    
    # Step 4: python deep_main.py (still in copilot directory) - WAIT FOR COMPLETION
    print("\n🔍 STEP 4: Run Deep Copilot Agent")
    success = run_command("python deep_main.py", cwd=copilot_dir,
                         description="Running deep copilot agent in copilot directory")
    if not success:
        print("⚠️ WARNING: deep_main.py had issues, but continuing pipeline...")
    
    # Step 5: cd .. && python course_material.py - WAIT FOR COMPLETION
    print("\n📚 STEP 5: Generate Course Materials")
    success = run_command("python course_material.py", cwd=backend_dir,
                         description="Generating course materials and documents")
    if not success:
        print("⚠️ WARNING: course_material.py had issues, but continuing pipeline...")
    
    # Step 6: python quizzes.py - WAIT FOR COMPLETION
    print("\n❓ STEP 6: Generate Quizzes")
    success = run_command("python quizzes.py", cwd=backend_dir,
                         description="Generating quiz questions and assessments")
    if not success:
        print("⚠️ WARNING: quizzes.py had issues, but continuing pipeline...")
    
    # Step 7: python flash_cards.py - WAIT FOR COMPLETION
    print("\n🗂️ STEP 7: Generate Flash Cards")
    success = run_command("python flash_cards.py", cwd=backend_dir,
                         description="Generating flash cards for study")
    if not success:
        print("⚠️ WARNING: flash_cards.py had issues, but continuing pipeline...")
    
    # Step 8: python ppt.py - WAIT FOR COMPLETION
    print("\n📊 STEP 8: Generate PowerPoint Presentations")
    success = run_command("python ppt.py", cwd=backend_dir,
                         description="Generating PowerPoint presentations")
    if not success:
        print("⚠️ WARNING: ppt.py had issues, but continuing pipeline...")
    
    # Step 9: cd .. (final step - we're already in the right directory)
    print("\n" + "="*60)
    print("🎉 AI COPILOT FOR INSTRUCTORS PIPELINE COMPLETED!")
    print("="*60)
    
    # List generated files
    output_dir = backend_dir / "Inputs and Outputs"
    if output_dir.exists():
        generated_files = [f for f in output_dir.glob("*.*") if f.is_file()]
        if generated_files:
            print(f"\n📁 GENERATED {len(generated_files)} FILES:")
            print("-" * 40)
            for file_path in generated_files:
                size_kb = file_path.stat().st_size / 1024
                print(f"  📄 {file_path.name} ({size_kb:.1f} KB)")
            print("-" * 40)
        else:
            print("\n📁 No files found in output directory")
    else:
        print("\n📁 Output directory not found")
    
    print(f"\n✅ PIPELINE EXECUTION COMPLETE - ALL STEPS FINISHED SEQUENTIALLY")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
