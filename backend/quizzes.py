import os
import pathlib
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv
from llm import generate_course_content, load_user_inputs
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

load_dotenv()

def generate_single_quiz(client, google_search_tool, system_prompt, combined_content, quiz_number, quiz_theme, user_config):
    # Create specific task for this quiz
    task = f"""
GENERATE ONLY ONE QUIZ PAPER:

Quiz Theme: {quiz_theme}
Quiz Number: {quiz_number}

Requirements:
- Create exactly 10-15 short questions focused specifically on {quiz_theme.lower()}
- Each question is worth 1 mark only
- Total time limit: 10-15 minutes
- Questions should be answerable in 1-2 sentences
- Focus on key facts, definitions, and quick applications
- This should be a complete, standalone quiz paper with only these questions
- DO NOT generate multiple quiz papers
- DO NOT include other quiz themes
- Focus exclusively on the theme: {quiz_theme}

Format the output as a single, complete quiz paper ready for students to take in 10-15 minutes.
"""
    
    print(f"🔄 Generating Quiz Paper {quiz_number}: {quiz_theme}...")
    
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
            print(f"❌ No response for Quiz {quiz_number}")
            return None
        
        # Extract only the relevant quiz content (filter out any extra content)
        quiz_content = response.text
        
        # If the response contains multiple quizzes, try to extract just this one
        if f"Quiz Paper {quiz_number + 1}" in quiz_content or "Quiz Paper 2" in quiz_content:
            print(f"⚠️ Response contains multiple quizzes, extracting Quiz {quiz_number} only...")
            # Try to extract just this quiz
            lines = quiz_content.split('\n')
            quiz_lines = []
            found_start = False
            
            for line in lines:
                # Start collecting when we find our quiz
                if f"Quiz Paper {quiz_number}" in line or (quiz_number == 1 and "Quiz Paper:" in line and not "Quiz Paper 2" in line):
                    found_start = True
                    quiz_lines.append(line)
                elif found_start and (f"Quiz Paper {quiz_number + 1}" in line or "Quiz Paper 2" in line or "Quiz Paper 3" in line):
                    # Stop when we hit the next quiz
                    break
                elif found_start:
                    quiz_lines.append(line)
            
            if quiz_lines:
                quiz_content = '\n'.join(quiz_lines).strip()
                print(f"✅ Extracted individual quiz content ({len(quiz_content)} characters)")
            
        return quiz_content
        
    except Exception as e:
        print(f"❌ Error generating Quiz {quiz_number}: {e}")
        return None

def save_quiz_as_txt_and_pdf(quiz_content, quiz_number, quiz_theme, output_dir):
    # Create clean filename
    clean_theme = quiz_theme.replace(' ', '_').replace('&', 'and').replace(':', '')
    base_filename = f"Quiz_Paper_{quiz_number}_{clean_theme}"
    
    txt_filename = f"{base_filename}.txt"
    pdf_filename = f"{base_filename}.pdf"
    
    txt_path = os.path.join(output_dir, txt_filename)
    pdf_path = os.path.join(output_dir, pdf_filename)
    
    # Save as TXT file first
    try:
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(quiz_content)
        print(f"✅ TXT saved: {txt_filename}")
    except Exception as e:
        print(f"❌ Error saving TXT {txt_filename}: {e}")
        return None, None
    
    # Convert TXT to PDF
    try:
        # Create PDF document
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            rightMargin=1*inch,
            leftMargin=1*inch,
            topMargin=1*inch,
            bottomMargin=1*inch
        )
        
        # Format content for PDF
        elements = format_quiz_content_for_pdf(quiz_content)
        
        # Build PDF
        doc.build(elements)
        print(f"✅ PDF saved: {pdf_filename}")
        return txt_path, pdf_path
        
    except Exception as e:
        print(f"❌ Error creating PDF {pdf_filename}: {e}")
        return txt_path, None

def parse_quiz_content(quiz_text):
    quizzes = []
    
    # Try multiple patterns to find quiz papers
    patterns = [
        r'# Quiz Paper (\d+):([^\#]*?)(?=# Quiz Paper \d+:|$)',
        r'## Quiz Paper (\d+):([^\#]*?)(?=## Quiz Paper \d+:|$)',
        r'Quiz Paper (\d+):([^\n]*\n(?:(?!Quiz Paper \d+:).*\n?)*)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, quiz_text, re.DOTALL | re.IGNORECASE)
        if matches:
            for match in matches:
                quiz_num = int(match[0])
                title_and_content = match[1].strip()
                
                # Extract title (first line) and content (rest)
                lines = title_and_content.split('\n', 1)
                title = lines[0].strip() if lines else f"Quiz {quiz_num}"
                content = lines[1] if len(lines) > 1 else title_and_content
                
                quizzes.append({
                    'number': quiz_num,
                    'title': title,
                    'content': content.strip(),
                    'full_content': f"# Quiz Paper {quiz_num}: {title}\n{content.strip()}"
                })
            break  # Use the first pattern that works
    
    # If no pattern matched, try to split by common separators
    if not quizzes:
        print("⚠️ Standard quiz format not found. Attempting alternative parsing...")
        
        # Split by common separators
        sections = re.split(r'(?:={3,}|#{2,})', quiz_text)
        quiz_count = 1
        
        for section in sections:
            section = section.strip()
            if len(section) > 100:  # Assume substantial content is a quiz
                quizzes.append({
                    'number': quiz_count,
                    'title': f"Quiz Paper {quiz_count}",
                    'content': section,
                    'full_content': f"# Quiz Paper {quiz_count}\n{section}"
                })
                quiz_count += 1
                
                if quiz_count > 3:  # Limit to 3 quizzes
                    break
    
    # Sort by quiz number
    quizzes.sort(key=lambda x: x['number'])
    
    return quizzes

def create_pdf_styles():
    styles = getSampleStyleSheet()
    
    # Custom styles
    custom_styles = {
        'title': ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor='blue'
        ),
        'heading': ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=15,
            spaceBefore=20,
            textColor='darkblue'
        ),
        'question': ParagraphStyle(
            'QuestionStyle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=10,
            spaceBefore=15,
            leftIndent=20
        ),
        'normal': ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            alignment=TA_JUSTIFY
        ),
        'instructions': ParagraphStyle(
            'InstructionsStyle',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            spaceBefore=10,
            leftIndent=20,
            textColor='darkgreen'
        )
    }
    
    return custom_styles

def format_quiz_content_for_pdf(quiz_content):
    styles = create_pdf_styles()
    elements = []
    
    lines = quiz_content.split('\n')
    current_section = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Quiz title
        if line.startswith('# Quiz Paper'):
            if current_section:
                elements.extend(current_section)
                current_section = []
            elements.append(Paragraph(line.replace('# ', ''), styles['title']))
            elements.append(Spacer(1, 20))
            
        # Main headings
        elif line.startswith('## '):
            if current_section:
                elements.extend(current_section)
                current_section = []
            elements.append(Paragraph(line.replace('## ', ''), styles['heading']))
            
        # Sub-headings
        elif line.startswith('### '):
            if current_section:
                elements.extend(current_section)
                current_section = []
            elements.append(Paragraph(line.replace('### ', ''), styles['question']))
            
        # Instructions or special content
        elif 'Instructions' in line:
            elements.append(Paragraph(line, styles['instructions']))
        
        # Skip evaluation criteria and grading content (not for students)
        elif 'Evaluation Criteria' in line or 'Answer Guidelines' in line or line.startswith('**Evaluation'):
            continue
            
        # Regular content
        else:
            # Handle markdown formatting properly
            # First handle bold formatting (**text**)
            line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
            # Then handle italic formatting (*text*)
            line = re.sub(r'\*(.*?)\*', r'<i>\1</i>', line)
            
            try:
                elements.append(Paragraph(line, styles['normal']))
            except Exception as e:
                # If there's still a formatting issue, use plain text
                print(f"⚠️ PDF formatting error for line: {line[:50]}...")
                clean_line = re.sub(r'<[^>]+>', '', line)  # Remove all HTML tags
                elements.append(Paragraph(clean_line, styles['normal']))
    
    return elements

def save_quiz_as_pdf(quiz_data, output_dir):
    # Create filename
    filename = f"Quiz_Paper_{quiz_data['number']}_{quiz_data['title'].replace(' ', '_').replace(':', '').replace('&', 'and')}.pdf"
    filepath = os.path.join(output_dir, filename)
    
    # Create PDF document
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=1*inch,
        leftMargin=1*inch,
        topMargin=1*inch,
        bottomMargin=1*inch
    )
    
    # Format content for PDF
    elements = format_quiz_content_for_pdf(quiz_data['full_content'])
    
    # Build PDF
    try:
        doc.build(elements)
        print(f"✅ PDF saved: {filename}")
        return filepath
    except Exception as e:
        print(f"❌ Error creating PDF {filename}: {e}")
        return None

def save_all_quizzes_as_pdfs(quiz_text, output_dir):
    print("\n📄 Converting quizzes to PDF format...")
    
    # Parse quiz content into individual quizzes
    quizzes = parse_quiz_content(quiz_text)
    
    if not quizzes:
        print("❌ No quiz papers found in the generated content")
        return []
    
    print(f"📋 Found {len(quizzes)} quiz papers to convert")
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    pdf_files = []
    
    # Generate PDF for each quiz
    for quiz in quizzes:
        print(f"🔄 Generating PDF for Quiz Paper {quiz['number']}: {quiz['title']}")
        pdf_path = save_quiz_as_pdf(quiz, output_dir)
        if pdf_path:
            pdf_files.append(pdf_path)
    
    return pdf_files

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

def create_quiz_system_prompt(difficulty_level):
    # Define difficulty-specific standards
    difficulty_standards = {
        "foundational": '''
- **Foundational Level Standards:**
  - Questions should build logical thinking from basic principles
  - Include guided reasoning with clear step-by-step thinking required
  - Use relatable scenarios and everyday examples
  - Focus on "why" and "how" rather than "what"
  - Encourage connecting concepts to personal experience
  - Gradual complexity building within each question
    ''',
    
    "intermediate": '''
- **Intermediate Level Standards:**
  - Assume basic familiarity with domain concepts
  - Require integration of multiple concepts to solve problems
  - Include industry-relevant scenarios and applications
  - Expect analytical reasoning and justified conclusions
  - Challenge students to evaluate different approaches
  - Moderate complexity with real-world problem-solving focus
    ''',
    
    "advanced": '''
- **Advanced Level Standards:**
  - Expect deep conceptual understanding and expert-level reasoning
  - Require synthesis across multiple advanced topics
  - Include cutting-edge scenarios and emerging challenges
  - Demand critical evaluation of research, methodologies, or implementations
  - Expect strategic thinking and system-level analysis
  - High complexity with innovation and optimization focus
    '''
    }
    
    # Get the appropriate difficulty standard
    current_standard = difficulty_standards.get(difficulty_level.lower(), difficulty_standards["intermediate"])
    
    system_prompt = f"""You are an Expert Quiz Designer specializing in creating concise, focused assessments for quick knowledge evaluation and practice.

## 🎯 CRITICAL INSTRUCTION
Generate EXACTLY ONE quiz paper only. Do not generate multiple quizzes. Focus solely on the specific theme provided in the task.

## 📋 YOUR MISSION
Create 1 focused quiz paper (10-15 questions, 1 mark each) based on the provided course content designed for 10-15 minute completion time.

## ⏱️ TIME CONSTRAINT REQUIREMENTS
- **Total Duration**: 10-15 minutes maximum
- **Question Count**: 10-15 questions (1 mark each)
- **Time per Question**: ~1 minute per question
- **Question Types**: Quick recall, short application, brief analysis
- **Answer Length**: 1-2 sentences maximum per question

## 🎯 INPUT ANALYSIS REQUIREMENTS
You will receive two types of course content:
1. **Course Plan Content**: High-level course structure, objectives, and module outlines
2. **Deep Course Content**: Detailed week-by-week lessons with explanations, examples, and case studies

**ANALYSIS MANDATE:**
- Thoroughly analyze BOTH content sources
- Identify key concepts, principles, and learning objectives across all modules/weeks
- Extract the most important facts, definitions, and core concepts
- Focus on essential knowledge that can be tested quickly
- Note any key algorithms, methods, or frameworks mentioned

## 🧠 QUIZ DESIGN PHILOSOPHY

### ✅ FOCUS ON These Question Types (1 mark each):
- **Quick Definitions**: "Define [concept] in one sentence."
- **Key Facts**: "What is the main purpose of [algorithm/method]?"
- **Simple Applications**: "In which scenario would you use [concept]?"
- **Brief Comparisons**: "What is the key difference between X and Y?"
- **Essential Steps**: "List the main steps in [process] (3-4 steps max)."
- **Quick Recognition**: "Which algorithm is best for [specific problem type]?"
- **Core Properties**: "What are 2 key characteristics of [concept]?"

### ❌ AVOID These Question Types:
- Long essay questions
- Complex multi-step problems
- Detailed explanations requiring paragraphs
- Questions requiring extensive calculations
- Multiple concept integration questions
- Open-ended discussion questions
- Multiple choice with obvious answers
- Memorization-based questions

### ✅ FOCUS ON These Question Types:
- **Analytical Questions**: Require breaking down complex scenarios
- **Synthesis Questions**: Combine multiple concepts to solve problems
- **Evaluation Questions**: Assess pros/cons, compare approaches, justify decisions
- **Application Questions**: Apply concepts to new, unseen situations
- **Problem-Solving Questions**: Multi-step reasoning with real-world context
- **Critical Thinking Questions**: Challenge assumptions, explore implications
- **Scenario-Based Questions**: Complex situations requiring conceptual understanding

## 📊 DIFFICULTY CALIBRATION

### For {difficulty_level.title()} Level:
{current_standard}

## 🎪 QUIZ STRUCTURE REQUIREMENTS

### Quiz Paper Format (GENERATE ONLY ONE):
```
# Quiz Paper: [Focused Topic/Theme]

## Instructions for Students:
- Time Limit: 10-15 minutes
- Total Marks: 10-15 marks (1 mark per question)
- This quiz focuses on [specific aspect of the course]
- Answer each question concisely (1-2 sentences maximum)
- Quick recall and understanding are tested

## Questions:

### Question 1 (1 mark): [Question Type] - [Topic Focus]
[Brief, focused question for quick answer]

---

### Question 2 (1 mark): [Question Type] - [Topic Focus]
[Another concise question]

---

[Continue for all 10-15 questions]
```

## 🌟 QUESTION DESIGN TEMPLATES

### 1. Scenario Analysis Questions:
"Given this complex situation [describe realistic scenario], analyze the underlying issues, identify the most appropriate approach from the course concepts, and justify your reasoning considering potential trade-offs."

### 2. Comparative Evaluation Questions:
"Compare and contrast [concept A] vs [concept B] in the context of [specific scenario]. Which would you recommend and why? Consider both advantages and limitations."

### 3. Problem-Solving Synthesis Questions:
"You are faced with [complex problem]. Using the principles learned in this course, design a comprehensive solution. Explain your reasoning process and how different course concepts inform your approach."

### 4. Critical Analysis Questions:
"Analyze this statement: '[controversial or complex statement related to course content]'. Do you agree or disagree? Support your position with evidence from course concepts and logical reasoning."

### 5. Application Transfer Questions:
"How would you adapt [concept from course] to address [different domain/context]? What modifications would be necessary and why?"

## 📝 QUIZ PAPER THEMES

### Quiz Paper 1: Foundation & Analysis
Focus on core concepts, fundamental principles, and analytical thinking

### Quiz Paper 2: Application & Synthesis  
Focus on practical applications, combining multiple concepts, real-world problem-solving

### Quiz Paper 3: Evaluation & Innovation
Focus on critical evaluation, advanced applications, and creative solutions

## 🎯 OUTPUT REQUIREMENTS

For each quiz paper, provide:

1. **Clear Theme and Focus**: What aspect of the course this quiz emphasizes
2. **Detailed Instructions**: Time limits, expectations for students
3. **10 Comprehensive Questions**: Each with:
   - Clear question statement
   - Clean formatting without evaluation criteria (for student version)
   - Progressive difficulty within the paper
4. **Student-Friendly Format**: Questions should be clear and well-structured for students
5. **Difficulty Progression**: Questions should build in complexity within each paper

**IMPORTANT**: Do NOT include evaluation criteria, answer guidelines, or grading rubrics in the quiz papers. These are for students to take, so keep them clean and focused on the questions only.

## 🚀 QUALITY STANDARDS

Each question must:
- **Require genuine thinking**: No googling for quick answers
- **Connect to course content**: Clearly tied to learned concepts
- **Promote understanding**: Help students see relationships and applications
- **Encourage reasoning**: Ask for justification and logical thinking
- **Be realistic**: Grounded in plausible scenarios
- **Match difficulty level**: Appropriate challenge for {difficulty_level} learners

## 💡 FINAL INSTRUCTION

Analyze the provided course content thoroughly, identify the most important concepts and learning objectives, then create three distinct quiz papers that will genuinely test and develop students' critical thinking, logical reasoning, and conceptual understanding.

Begin your response with: "=== QUIZ GENERATION ANALYSIS ==="

Then provide your comprehensive analysis of the course content followed by the three complete quiz papers."""

    return system_prompt

def generate_quizzes():
    print("🎯 Starting Quiz Generation Process...")
    print("="*60)
    
    # Load user configuration
    user_config = load_user_inputs()
    if not user_config:
        print("❌ No user configuration found. Please run the main application first.")
        return
    
    difficulty_level = user_config.get('difficulty_level', 'intermediate')
    print(f"📊 Using difficulty level: {difficulty_level}")
    
    # Read course content from both directories
    print("\n📚 Reading course content files...")
    planner_content, deep_content = read_course_content_files()
    
    if not planner_content and not deep_content:
        print("❌ No course content found in either directory. Please ensure content files exist.")
        return
    
    # Create combined content input
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
    system_prompt = create_quiz_system_prompt(difficulty_level)
    
    # Define quiz themes
    quiz_themes = [
        "Foundation and Analysis",
        "Application and Synthesis", 
        "Evaluation and Innovation"
    ]
    
    print("\n🧠 Generating individual quiz papers...")
    
    # Ensure output directory exists under Inputs and Outputs
    output_dir = os.path.join("Inputs and Outputs", "quizzes")
    os.makedirs(output_dir, exist_ok=True)
    print(f"📁 Created quizzes output directory: {output_dir}")
    
    generated_files = []
    
    # Generate each quiz individually
    for i, theme in enumerate(quiz_themes, 1):
        print(f"\n{'='*40}")
        print(f"🎯 GENERATING QUIZ {i} OF 3")
        print(f"📋 Theme: {theme}")
        print(f"{'='*40}")
        
        # Generate single quiz
        quiz_content = generate_single_quiz(
            client=client,
            google_search_tool=google_search_tool,
            system_prompt=system_prompt,
            combined_content=combined_content,
            quiz_number=i,
            quiz_theme=theme,
            user_config=user_config
        )
        
        if quiz_content:
            # Save as TXT and convert to PDF
            txt_path, pdf_path = save_quiz_as_txt_and_pdf(
                quiz_content=quiz_content,
                quiz_number=i,
                quiz_theme=theme,
                output_dir=output_dir
            )
            
            if txt_path and pdf_path:
                generated_files.append({
                    'number': i,
                    'theme': theme,
                    'txt_path': txt_path,
                    'pdf_path': pdf_path
                })
                print(f"✅ Quiz {i} completed successfully!")
            else:
                print(f"❌ Failed to save Quiz {i}")
        else:
            print(f"❌ Failed to generate Quiz {i}")
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 QUIZ GENERATION SUMMARY")
    print(f"{'='*60}")
    
    if generated_files:
        print(f"🎉 Successfully generated {len(generated_files)} quiz papers!")
        print("\n📁 Generated Files:")
        for file_info in generated_files:
            print(f"   📄 Quiz {file_info['number']}: {file_info['theme']}")
            print(f"      📝 TXT: {os.path.basename(file_info['txt_path'])}")
            print(f"      📄 PDF: {os.path.basename(file_info['pdf_path'])}")
            print()
        
        print(f"📁 All files saved in: {output_dir}")
        return generated_files
    else:
        print("❌ No quiz papers were generated successfully.")
        return None

def main():
    generated_quizzes = generate_quizzes()
    
    if generated_quizzes:
        print("\n🎉 Quiz generation process completed successfully!")
        print("📋 3 quiz papers with 10 questions each have been created.")
        print("💡 Each quiz focuses on conceptual understanding and critical thinking.")
        print("📄 Individual TXT and PDF files have been saved separately.")
        print(f"\n📁 Files saved in 'Inputs and Outputs' directory:")
        for quiz_info in generated_quizzes:
            print(f"   📝 {os.path.basename(quiz_info['txt_path'])}")
            print(f"   📄 {os.path.basename(quiz_info['pdf_path'])}")
    else:
        print("\n❌ Quiz generation failed. Please check the error messages above.")

if __name__ == "__main__":
    main()