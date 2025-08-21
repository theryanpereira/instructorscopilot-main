@echo off
echo Starting AI Copilot for Instructors...

echo Running: python llm.py
python llm.py
if %errorlevel% neq 0 (
    echo ERROR: llm.py failed with error code %errorlevel%
    pause
    exit /b %errorlevel%
)
echo Master instructions generated.

echo Starting agents
echo Changing to copilot directory...
cd copilot
if %errorlevel% neq 0 (
    echo ERROR: Failed to change to copilot directory
    pause
    exit /b %errorlevel%
)

echo Running: python main.py
python main.py
if %errorlevel% neq 0 (
    echo WARNING: main.py completed with error code %errorlevel% - continuing...
)

echo Running: python deep_main.py
python deep_main.py
if %errorlevel% neq 0 (
    echo WARNING: deep_main.py completed with error code %errorlevel% - continuing...
)

echo Returning to parent directory...
cd ..
if %errorlevel% neq 0 (
    echo ERROR: Failed to return to parent directory
    pause
    exit /b %errorlevel%
)

echo Running: python course_material.py
python course_material.py
if %errorlevel% neq 0 (
    echo WARNING: course_material.py completed with error code %errorlevel% - continuing...
)

echo Running: python quizzes.py
python quizzes.py
if %errorlevel% neq 0 (
    echo WARNING: quizzes.py completed with error code %errorlevel% - continuing...
)

echo Running: python flash_cards.py
python flash_cards.py
if %errorlevel% neq 0 (
    echo WARNING: flash_cards.py completed with error code %errorlevel% - continuing...
)

echo Running: python ppt.py
python ppt.py
if %errorlevel% neq 0 (
    echo WARNING: ppt.py completed with error code %errorlevel% - continuing...
)

echo AI Copilot for Instructors processing completed!
echo All commands have been executed sequentially.
pause