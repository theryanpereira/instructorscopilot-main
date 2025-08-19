import os
import pathlib
import re
from PIL import Image, ImageDraw, ImageFont
from google import genai
from google.genai import types
from dotenv import load_dotenv
from llm import generate_course_content, load_user_inputs
import json
import textwrap

load_dotenv()

def read_course_content_files():
    planner_content = ""
    deep_content = ""
    
    # Read from home directory "Inputs and Outputs"
    home_dir_path = pathlib.Path("Inputs and Outputs")
    
    # Try to read planner agent instruction (directly in Inputs and Outputs)
    planner_file = home_dir_path / "planner_agent_instruction.txt"
    if planner_file.exists():
        try:
            with open(planner_file, 'r', encoding='utf-8') as f:
                planner_content = f.read()
            print(f"✅ Read planner content from: {planner_file}")
        except Exception as e:
            print(f"❌ Error reading {planner_file}: {e}")
    else:
        print(f"⚠️ Planner file not found: {planner_file}")
    
    # Read from copilot folder "Inputs and Outputs"
    copilot_dir_path = pathlib.Path("copilot/Inputs and Outputs")
    
    # Try to read deep course content output
    deep_file = copilot_dir_path / "deep_course_content_output.txt"
    if not deep_file.exists():
        # Try alternative filename
        deep_file = copilot_dir_path / "deep_agent_output.txt"
    
    if deep_file.exists():
        try:
            with open(deep_file, 'r', encoding='utf-8') as f:
                deep_content = f.read()
            print(f"✅ Read deep content from: {deep_file}")
        except Exception as e:
            print(f"❌ Error reading {deep_file}: {e}")
    else:
        print(f"⚠️ Deep content file not found in: {copilot_dir_path}")
    
    return planner_content, deep_content

def create_flashcard_system_prompt(difficulty_level):
    """Create system prompt for flashcard generation"""
    
    difficulty_standards = {
        "foundational": '''
- **Foundational Level Standards:**
  - Focus on basic concepts and definitions
  - Use simple, clear language
  - Include visual metaphors and analogies
  - Build from familiar concepts
  - Avoid technical jargon
    ''',
    
    "intermediate": '''
- **Intermediate Level Standards:**
  - Include practical applications and examples
  - Connect concepts across different topics
  - Use moderate technical terminology with explanations
  - Focus on understanding relationships between concepts
  - Include problem-solving scenarios
    ''',
    
    "advanced": '''
- **Advanced Level Standards:**
  - Include complex scenarios and edge cases
  - Use technical terminology appropriately
  - Focus on deep understanding and critical thinking
  - Include research-level concepts and applications
  - Challenge with sophisticated problems
    '''
    }
    
    current_standard = difficulty_standards.get(difficulty_level.lower(), difficulty_standards["intermediate"])
    
    system_prompt = f"""You are an Expert Flashcard Content Creator specializing in creating effective, memorable learning cards for AI and Computer Science concepts.

## 🎯 YOUR MISSION
Generate exactly 15-20 flashcards based on the provided course content that promote active recall and spaced repetition learning.

## 📋 INPUT ANALYSIS REQUIREMENTS
You will receive comprehensive course content including:
1. **Course Plan Content**: High-level course structure and objectives
2. **Deep Course Content**: Detailed week-by-week lessons with explanations

**ANALYSIS MANDATE:**
- Extract key concepts, algorithms, and principles from ALL weeks
- Identify the most important terms, definitions, and relationships
- Focus on concepts that require memorization and understanding
- Balance coverage across all weeks/modules

## 🧠 FLASHCARD DESIGN PRINCIPLES

### ✅ EXCELLENT Flashcard Types:
- **Definition Cards**: "What is [concept]?" → Clear, concise definition
- **Example Cards**: "Give an example of [concept]" → Real-world application
- **Comparison Cards**: "What's the difference between X and Y?" → Key distinctions
- **Process Cards**: "What are the steps in [algorithm/process]?" → Sequential steps
- **Application Cards**: "When would you use [concept]?" → Practical scenarios
- **Advantage/Disadvantage Cards**: "What are pros/cons of [approach]?" → Trade-offs

### ❌ AVOID These Types:
- Overly complex questions requiring essays
- Questions with obvious yes/no answers
- Multiple concepts crammed into one card
- Ambiguous or poorly worded questions

## 📊 DIFFICULTY CALIBRATION

### For {difficulty_level.title()} Level:
{current_standard}

## 🎨 FLASHCARD FORMAT REQUIREMENTS

Each flashcard must follow this EXACT JSON format:
```json
{{
  "id": 1,
  "week": "Week 1",
  "topic": "Intelligent Agents",
  "question": "What is an intelligent agent in AI?",
  "answer": "An entity that can perceive its environment through sensors and act upon that environment through actuators to achieve specific goals.",
  "difficulty": "medium",
  "tags": ["agents", "AI basics", "definitions"]
}}
```

### Required Fields:
- **id**: Sequential number (1-20)
- **week**: Which week this concept is from
- **topic**: Main topic/concept area
- **question**: Clear, specific question (max 100 characters)
- **answer**: Concise but complete answer (max 200 characters)
- **difficulty**: "easy", "medium", or "hard"
- **tags**: 2-4 relevant tags for categorization

## 📚 CONTENT DISTRIBUTION
Ensure coverage across all weeks:
- Week 1: 3-4 cards (AI basics, agents)
- Week 2: 3-4 cards (search algorithms)
- Week 3: 3-4 cards (adversarial search, games)
- Additional weeks: 2-3 cards each
- Balance: 40% definitions, 30% examples/applications, 30% comparisons/processes

## 🎯 QUALITY STANDARDS

Each flashcard must:
- **Be testable**: Can be answered from memory
- **Be specific**: One clear concept per card
- **Be concise**: Question and answer both brief but complete
- **Be accurate**: Factually correct information
- **Be relevant**: Important for understanding the subject
- **Be level-appropriate**: Match the specified difficulty level

## 💡 EXAMPLES OF GOOD FLASHCARDS

**Definition Card:**
- Q: "What is the PEAS framework in AI?"
- A: "Performance measure, Environment, Actuators, Sensors - framework for describing agent tasks."

**Process Card:**
- Q: "What are the steps in the A* search algorithm?"
- A: "1) Add start node to open list 2) Loop: pick lowest f(n) 3) Move to closed list 4) Add neighbors 5) Repeat until goal"

**Comparison Card:**
- Q: "What's the key difference between BFS and DFS?"
- A: "BFS explores breadth-first (shortest path), DFS explores depth-first (less memory, not optimal)."

## 🚀 OUTPUT FORMAT

Provide your response as a valid JSON array containing exactly 15-20 flashcard objects:

```json
[
  {{
    "id": 1,
    "week": "Week 1",
    "topic": "AI Basics",
    "question": "What does AI stand for?",
    "answer": "Artificial Intelligence - systems that perform tasks requiring human intelligence.",
    "difficulty": "easy",
    "tags": ["AI", "definition", "basics"]
  }},
  // ... continue for all flashcards
]
```

Begin your analysis with: "=== FLASHCARD CONTENT ANALYSIS ==="
Then provide your comprehensive analysis followed by the complete JSON array of flashcards."""

    return system_prompt

def generate_flashcard_content(client, google_search_tool, system_prompt, combined_content, user_config):
    """Generate flashcard content using LLM"""
    
    task = """
GENERATE FLASHCARD CONTENT:

Create 15-20 high-quality flashcards covering all weeks of the course content.
Focus on the most important concepts, definitions, algorithms, and applications.
Ensure proper distribution across all weeks and topics.

Output the result as a valid JSON array of flashcard objects.
"""
    
    print("🔄 Generating flashcard content...")
    
    try:
        response = generate_course_content(
            client=client,
            teaching_style=user_config.get('teaching_style', 'Project-Based / Hands-On'),
            duration=user_config.get('duration', '6 weeks'),
            difficulty_level=user_config.get('difficulty_level', 'intermediate'),
            google_search_tool=google_search_tool,
            system_prompt=system_prompt,
            course_content=combined_content,
            task=task
        )
        
        if not response or not hasattr(response, 'text') or not response.text:
            print("❌ No response received from LLM")
            return None
        
        # Extract JSON from the response
        response_text = response.text
        print(f"✅ Received response ({len(response_text)} characters)")
        
        # Try to find JSON array in the response
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            try:
                flashcards = json.loads(json_str)
                print(f"✅ Successfully parsed {len(flashcards)} flashcards")
                return flashcards
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing error: {e}")
                # Try to clean up the JSON
                json_str = json_str.replace('// ... continue for all flashcards', '')
                json_str = re.sub(r'//.*?\n', '', json_str)  # Remove comments
                try:
                    flashcards = json.loads(json_str)
                    print(f"✅ Successfully parsed {len(flashcards)} flashcards after cleanup")
                    return flashcards
                except json.JSONDecodeError:
                    print("❌ Could not parse JSON even after cleanup")
                    return None
        else:
            print("❌ No JSON array found in response")
            return None
        
    except Exception as e:
        print(f"❌ Error generating flashcards: {e}")
        return None

def get_font_path():
    """Get font path for different operating systems"""
    font_paths = [
        # Windows fonts
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
        # Default fallback
        None
    ]
    
    for font_path in font_paths:
        if font_path and os.path.exists(font_path):
            return font_path
    
    return None  # Use default font

def create_flashcard_image(flashcard_data, output_dir, card_number):
    """Create a visual flashcard image"""
    
    # Card dimensions
    width, height = 800, 600
    background_color = "#f8f9fa"
    text_color = "#2c3e50"
    accent_color = "#3498db"
    
    # Create front side (question)
    front_img = Image.new('RGB', (width, height), background_color)
    front_draw = ImageDraw.Draw(front_img)
    
    # Create back side (answer)
    back_img = Image.new('RGB', (width, height), background_color)
    back_draw = ImageDraw.Draw(back_img)
    
    # Try to load fonts
    font_path = get_font_path()
    try:
        title_font = ImageFont.truetype(font_path, 32) if font_path else ImageFont.load_default()
        subtitle_font = ImageFont.truetype(font_path, 24) if font_path else ImageFont.load_default()
        main_font = ImageFont.truetype(font_path, 28) if font_path else ImageFont.load_default()
        meta_font = ImageFont.truetype(font_path, 20) if font_path else ImageFont.load_default()
    except:
        # Fallback to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        main_font = ImageFont.load_default()
        meta_font = ImageFont.load_default()
    
    # FRONT SIDE - Question
    # Header
    front_draw.rectangle([0, 0, width, 80], fill=accent_color)
    front_draw.text((width//2, 40), "FLASHCARD", font=title_font, fill="white", anchor="mm")
    
    # Card number and week
    front_draw.text((40, 120), f"Card #{card_number}", font=meta_font, fill=text_color)
    front_draw.text((width-40, 120), flashcard_data.get('week', 'Week ?'), font=meta_font, fill=text_color, anchor="rm")
    
    # Topic
    topic_text = flashcard_data.get('topic', 'Topic')
    front_draw.text((width//2, 160), topic_text, font=subtitle_font, fill=accent_color, anchor="mm")
    
    # Question (wrapped)
    question = flashcard_data.get('question', 'Question?')
    wrapped_question = textwrap.fill(question, width=35)
    
    # Calculate position for centered text
    question_lines = wrapped_question.split('\n')
    total_height = len(question_lines) * 40
    start_y = (height - total_height) // 2 + 50
    
    for i, line in enumerate(question_lines):
        y_pos = start_y + i * 40
        front_draw.text((width//2, y_pos), line, font=main_font, fill=text_color, anchor="mm")
    
    # Difficulty indicator
    difficulty = flashcard_data.get('difficulty', 'medium')
    difficulty_colors = {'easy': '#27ae60', 'medium': '#f39c12', 'hard': '#e74c3c'}
    difficulty_color = difficulty_colors.get(difficulty, '#f39c12')
    
    front_draw.rectangle([width-120, height-60, width-20, height-20], fill=difficulty_color)
    front_draw.text((width-70, height-40), difficulty.upper(), font=meta_font, fill="white", anchor="mm")
    
    # Question indicator
    front_draw.text((width//2, height-40), "❓ QUESTION", font=meta_font, fill=text_color, anchor="mm")
    
    # BACK SIDE - Answer
    # Header
    back_draw.rectangle([0, 0, width, 80], fill="#27ae60")
    back_draw.text((width//2, 40), "FLASHCARD", font=title_font, fill="white", anchor="mm")
    
    # Card number and week
    back_draw.text((40, 120), f"Card #{card_number}", font=meta_font, fill=text_color)
    back_draw.text((width-40, 120), flashcard_data.get('week', 'Week ?'), font=meta_font, fill=text_color, anchor="rm")
    
    # Topic
    back_draw.text((width//2, 160), topic_text, font=subtitle_font, fill="#27ae60", anchor="mm")
    
    # Answer (wrapped)
    answer = flashcard_data.get('answer', 'Answer')
    wrapped_answer = textwrap.fill(answer, width=40)
    
    # Calculate position for centered text
    answer_lines = wrapped_answer.split('\n')
    total_height = len(answer_lines) * 35
    start_y = (height - total_height) // 2 + 50
    
    for i, line in enumerate(answer_lines):
        y_pos = start_y + i * 35
        back_draw.text((width//2, y_pos), line, font=main_font, fill=text_color, anchor="mm")
    
    # Tags
    tags = flashcard_data.get('tags', [])
    if tags:
        tags_text = " • ".join(tags[:3])  # Show max 3 tags
        back_draw.text((40, height-80), f"Tags: {tags_text}", font=meta_font, fill="#7f8c8d")
    
    # Answer indicator
    back_draw.text((width//2, height-40), "✅ ANSWER", font=meta_font, fill=text_color, anchor="mm")
    
    # Save images
    try:
        front_path = os.path.join(output_dir, f"flashcard_{card_number:02d}_question.png")
        back_path = os.path.join(output_dir, f"flashcard_{card_number:02d}_answer.png")
        
        front_img.save(front_path, "PNG")
        back_img.save(back_path, "PNG")
        
        print(f"✅ Created flashcard {card_number}: {flashcard_data.get('topic', 'Unknown Topic')}")
        return front_path, back_path
    except Exception as e:
        print(f"❌ Error saving flashcard {card_number}: {e}")
        return None, None

def create_flashcard_summary(flashcards, output_dir):
    """Create a summary document of all flashcards"""
    
    summary_path = os.path.join(output_dir, "flashcards_summary.txt")
    
    try:
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("📚 FLASHCARDS SUMMARY\n")
            f.write("=" * 60 + "\n\n")
            
            # Group by week
            weeks = {}
            for card in flashcards:
                week = card.get('week', 'Unknown Week')
                if week not in weeks:
                    weeks[week] = []
                weeks[week].append(card)
            
            for week in sorted(weeks.keys()):
                f.write(f"\n🗓️ {week.upper()}\n")
                f.write("-" * 40 + "\n")
                
                for card in weeks[week]:
                    f.write(f"\n📋 Card #{card.get('id', '?')}: {card.get('topic', 'Unknown Topic')}\n")
                    f.write(f"❓ Q: {card.get('question', 'No question')}\n")
                    f.write(f"✅ A: {card.get('answer', 'No answer')}\n")
                    f.write(f"🎯 Difficulty: {card.get('difficulty', 'unknown').title()}\n")
                    if card.get('tags'):
                        f.write(f"🏷️ Tags: {', '.join(card.get('tags', []))}\n")
                    f.write("\n")
            
            # Statistics
            f.write(f"\n📊 STATISTICS\n")
            f.write("=" * 30 + "\n")
            f.write(f"Total Cards: {len(flashcards)}\n")
            f.write(f"Weeks Covered: {len(weeks)}\n")
            
            # Difficulty distribution
            difficulties = {}
            for card in flashcards:
                diff = card.get('difficulty', 'unknown')
                difficulties[diff] = difficulties.get(diff, 0) + 1
            
            f.write("\nDifficulty Distribution:\n")
            for diff, count in difficulties.items():
                f.write(f"  {diff.title()}: {count}\n")
        
        print(f"✅ Created summary: flashcards_summary.txt")
        return summary_path
    except Exception as e:
        print(f"❌ Error creating summary: {e}")
        return None

def generate_flashcards():
    """Main function to generate flashcards"""
    
    print("📚 Starting Flashcard Generation Process...")
    print("=" * 60)
    
    # Load user configuration
    user_config = load_user_inputs()
    if not user_config:
        print("❌ No user configuration found. Please run the main application first.")
        return
    
    difficulty_level = user_config.get('difficulty_level', 'intermediate')
    print(f"📊 Using difficulty level: {difficulty_level}")
    
    # Read course content
    print("\n📖 Reading course content files...")
    planner_content, deep_content = read_course_content_files()
    
    if not planner_content and not deep_content:
        print("❌ No course content found. Please ensure content files exist.")
        return
    
    # Create combined content
    combined_content = f"""
=== COURSE PLAN CONTENT ===
{planner_content}

=== DETAILED COURSE CONTENT ===
{deep_content}
"""
    
    print(f"✅ Combined content length: {len(combined_content)} characters")
    
    # Initialize LLM client
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Configure Google Search tool
    google_search_tool = genai.types.Tool(
        google_search=genai.types.GoogleSearch()
    )
    
    # Create system prompt
    system_prompt = create_flashcard_system_prompt(difficulty_level)
    
    # Generate flashcard content
    print("\n🧠 Generating flashcard content with AI...")
    flashcards = generate_flashcard_content(
        client=client,
        google_search_tool=google_search_tool,
        system_prompt=system_prompt,
        combined_content=combined_content,
        user_config=user_config
    )
    
    if not flashcards:
        print("❌ Failed to generate flashcard content")
        return
    
    # Ensure we have the right number of flashcards
    if len(flashcards) < 10:
        print(f"⚠️ Only {len(flashcards)} flashcards generated, minimum is 10")
    elif len(flashcards) > 20:
        print(f"⚠️ {len(flashcards)} flashcards generated, using first 20")
        flashcards = flashcards[:20]
    
    print(f"✅ Processing {len(flashcards)} flashcards")
    
    # Create output directory
    output_dir = "Flash-Cards"
    os.makedirs(output_dir, exist_ok=True)
    print(f"📁 Created output directory: {output_dir}")
    
    # Generate flashcard images
    print(f"\n🎨 Creating flashcard images...")
    created_files = []
    
    for i, flashcard in enumerate(flashcards, 1):
        front_path, back_path = create_flashcard_image(flashcard, output_dir, i)
        if front_path and back_path:
            created_files.extend([front_path, back_path])
    
    # Create summary
    summary_path = create_flashcard_summary(flashcards, output_dir)
    if summary_path:
        created_files.append(summary_path)
    
    # Final summary
    print(f"\n{'=' * 60}")
    print("📊 FLASHCARD GENERATION SUMMARY")
    print(f"{'=' * 60}")
    
    if created_files:
        print(f"🎉 Successfully created {len(flashcards)} flashcards!")
        print(f"📁 Total files generated: {len(created_files)}")
        print(f"   📸 Image files: {len(created_files) - 1}")
        print(f"   📄 Summary file: 1")
        print(f"\n📁 All files saved in: {output_dir}")
        
        # Show breakdown by week
        weeks = {}
        for card in flashcards:
            week = card.get('week', 'Unknown Week')
            weeks[week] = weeks.get(week, 0) + 1
        
        print(f"\n📅 Coverage by week:")
        for week, count in sorted(weeks.items()):
            print(f"   {week}: {count} cards")
        
        return created_files
    else:
        print("❌ No flashcards were created successfully.")
        return None

def main():
    """Run the flashcard generation process"""
    try:
        # Check if required packages are installed
        try:
            from PIL import Image, ImageDraw, ImageFont
        except ImportError:
            print("❌ Pillow package not found!")
            print("📦 Installing Pillow...")
            os.system("pip install Pillow")
            from PIL import Image, ImageDraw, ImageFont
            
        generated_flashcards = generate_flashcards()
        
        if generated_flashcards:
            print("\n🎉 Flashcard generation completed successfully!")
            print("📚 High-quality flashcards covering all course weeks have been created.")
            print("🎨 Each flashcard has both question and answer sides as separate images.")
            print("📄 A summary document lists all flashcards for easy reference.")
            print(f"\n📁 Check the 'Flash-Cards' folder for all generated files!")
        else:
            print("\n❌ Flashcard generation failed.")
            
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        print("💡 Make sure you have the required packages installed:")
        print("   pip install Pillow")

if __name__ == "__main__":
    main()
