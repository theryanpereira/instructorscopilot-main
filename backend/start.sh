#!/bin/bash

# Set environment variables to prevent port binding and services
export NO_SERVER=1
export DISABLE_SERVICES=1
export PYTHONUNBUFFERED=1
# Ensure no child process tries to bind to Render's web service PORT
unset PORT 2>/dev/null || true
export PORT_DISABLED=1

echo "Starting AI Copilot for Instructors..."

echo "Running: python llm.py"
timeout 3000 python llm.py
if [ $? -ne 0 ]; then
    echo "ERROR: llm.py failed with error code $?"
    exit $?
fi
echo "Master instructions generated."

echo "Starting agents"
echo "Changing to copilot directory..."
cd copilot
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to change to copilot directory"
    exit $?
fi

echo "Running: python main.py (Course Planner Agent)"
timeout 6000 python main.py
if [ $? -eq 124 ]; then
    echo "WARNING: main.py timed out after 10 minutes - continuing..."
elif [ $? -ne 0 ]; then
    echo "WARNING: main.py completed with error code $? - continuing..."
fi

echo "Running: python deep_main.py (Deep Content Agent)"
timeout 6000 python deep_main.py
if [ $? -eq 124 ]; then
    echo "WARNING: deep_main.py timed out after 10 minutes - continuing..."
elif [ $? -ne 0 ]; then
    echo "WARNING: deep_main.py completed with error code $? - continuing..."
fi

echo "Returning to parent directory..."
cd ..
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to return to parent directory"
    exit $?
fi

echo "Running: python course_material.py"
timeout 6000 python course_material.py
if [ $? -eq 124 ]; then
    echo "WARNING: course_material.py timed out - continuing..."
elif [ $? -ne 0 ]; then
    echo "WARNING: course_material.py completed with error code $? - continuing..."
fi

echo "Running: python quizzes.py"
timeout 6000 python quizzes.py
if [ $? -eq 124 ]; then
    echo "WARNING: quizzes.py timed out - continuing..."
elif [ $? -ne 0 ]; then
    echo "WARNING: quizzes.py completed with error code $? - continuing..."
fi

echo "Running: python flash_cards.py"
timeout 6000 python flash_cards.py
if [ $? -eq 124 ]; then
    echo "WARNING: flash_cards.py timed out - continuing..."
elif [ $? -ne 0 ]; then
    echo "WARNING: flash_cards.py completed with error code $? - continuing..."
fi

echo "Running: python ppt.py"
timeout 6000 python ppt.py
if [ $? -eq 124 ]; then
    echo "WARNING: ppt.py timed out - continuing..."
elif [ $? -ne 0 ]; then
    echo "WARNING: ppt.py completed with error code $? - continuing..."
fi

echo "AI Copilot for Instructors processing completed!"
echo "All commands have been executed sequentially."