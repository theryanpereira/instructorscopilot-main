#!/bin/bash

echo "Starting AI Copilot for Instructors..."

echo "Running: python llm.py"
python llm.py
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

echo "Running: python main.py"
python main.py
if [ $? -ne 0 ]; then
    echo "WARNING: main.py completed with error code $? - continuing..."
fi

echo "Running: python deep_main.py"
python deep_main.py
if [ $? -ne 0 ]; then
    echo "WARNING: deep_main.py completed with error code $? - continuing..."
fi

echo "Returning to parent directory..."
cd ..
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to return to parent directory"
    exit $?
fi

echo "Running: python course_material.py"
python course_material.py
if [ $? -ne 0 ]; then
    echo "WARNING: course_material.py completed with error code $? - continuing..."
fi

echo "Running: python quizzes.py"
python quizzes.py
if [ $? -ne 0 ]; then
    echo "WARNING: quizzes.py completed with error code $? - continuing..."
fi

echo "Running: python flash_cards.py"
python flash_cards.py
if [ $? -ne 0 ]; then
    echo "WARNING: flash_cards.py completed with error code $? - continuing..."
fi

echo "Running: python ppt.py"
python ppt.py
if [ $? -ne 0 ]; then
    echo "WARNING: ppt.py completed with error code $? - continuing..."
fi

echo "AI Copilot for Instructors processing completed!"
echo "All commands have been executed sequentially."