echo Starting AI Copilot for Instructors...
python llm.py
echo Master instructions generated.
echo Starting agents
cd copilot
python main.py
python deep_main.py
cd ..
python course_material.py
python quizzes.py
python flash_cards.py