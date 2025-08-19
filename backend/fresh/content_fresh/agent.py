from google.adk.agents import LlmAgent
from google.adk.tools import google_search
from pathlib import Path
import PyPDF2
import os
import re
from datetime import datetime

def read_curriculum_pdf(file_path):
    """Read curriculum PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def read_text_file(file_path):
    """Read text file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

def extract_key_topics(content):
    """Extract key AI/tech topics from content by analyzing the actual text"""
    found_topics = []
    content_lower = content.lower()
    
    # Use regex to find technical terms, proper nouns, and important concepts
    # Look for capitalized terms that might be technologies or frameworks
    capitalized_terms = re.findall(r'\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b', content)
    
    # Look for common technical patterns
    tech_patterns = [
        r'\b\w+(?:ML|AI|NN|CNN|RNN|LSTM|GAN)\b',  # ML/AI acronyms
        r'\b\w*(?:algorithm|model|framework|library|tool|method|technique)\w*\b',  # Technical terms
        r'\b\w*(?:learn|network|data|intelligence|vision|language|processing)\w*\b',  # Core concepts
        r'\b[A-Z]{2,}\b',  # Acronyms (2+ capital letters)
        r'\b\w+(?:\.py|\.js|\.java|\.cpp)\b',  # Programming files
        r'\bpython\b|\bPython\b',  # Programming languages
    ]
    
    # Extract terms using patterns
    for pattern in tech_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        found_topics.extend([match.lower().strip() for match in matches if len(match) > 2])
    
    # Also look for common phrases and compound terms
    phrase_patterns = [
        r'\bmachine\s+learning\b',
        r'\bdeep\s+learning\b', 
        r'\bartificial\s+intelligence\b',
        r'\bnatural\s+language\s+processing\b',
        r'\bcomputer\s+vision\b',
        r'\bneural\s+network\b',
        r'\bdata\s+science\b',
        r'\bbig\s+data\b',
        r'\bcloud\s+computing\b',
        r'\bsearch\s+algorithm\b',
        r'\brecommendation\s+system\b',
    ]
    
    for pattern in phrase_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        found_topics.extend([match.lower().strip() for match in matches])
    
    # Filter out common words and very short terms
    common_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how'}
    
    filtered_topics = []
    for topic in found_topics:
        topic = topic.strip()
        if (len(topic) > 2 and 
            topic not in common_words and 
            not topic.isdigit() and
            topic.replace(' ', '').isalpha()):
            filtered_topics.append(topic)
    
    # Remove duplicates and return unique topics
    unique_topics = list(set(filtered_topics))
    
    # Sort by length (longer terms first as they're usually more specific)
    unique_topics.sort(key=len, reverse=True)
    
    return unique_topics[:50]  # Return top 50 most relevant topics

def read_course_files():
    """Read all course-related files"""
    base_path = Path("../../")  # Navigate back to main directory
    
    files_data = {}
    
    # Read curriculum.pdf from Inputs and Outputs
    curriculum_path = base_path / "Inputs and Outputs" / "curriculum.pdf"
    if curriculum_path.exists():
        files_data['curriculum'] = read_curriculum_pdf(curriculum_path)
        print(f"✅ Read curriculum PDF: {len(files_data['curriculum'])} characters")
    else:
        files_data['curriculum'] = "Curriculum PDF not found"
        print("❌ Curriculum PDF not found")
    
    # Read deep_course_content_output.txt from copilot/Inputs and Outputs
    deep_content_path = base_path / "copilot" / "Inputs and Outputs" / "deep_course_content_output.txt"
    if deep_content_path.exists():
        files_data['deep_content'] = read_text_file(deep_content_path)
        print(f"✅ Read deep course content: {len(files_data['deep_content'])} characters")
    else:
        files_data['deep_content'] = "Deep course content file not found"
        print("❌ Deep course content file not found")
    
    # Read planner_agent_instruction.txt from Inputs and Outputs
    planner_path = base_path / "Inputs and Outputs" / "planner_agent_instruction.txt"
    if planner_path.exists():
        files_data['planner_instructions'] = read_text_file(planner_path)
        print(f"✅ Read planner instructions: {len(files_data['planner_instructions'])} characters")
    else:
        files_data['planner_instructions'] = "Planner instructions file not found"
        print("❌ Planner instructions file not found")
    
    return files_data

def analyze_course_content():
    """Analyze course content and extract relevant topics for web search"""
    print("📚 Reading course files...")
    files_data = read_course_files()
    
    # Combine all content for analysis
    all_content = ""
    for key, content in files_data.items():
        if not content.startswith("Error") and "not found" not in content:
            all_content += f"\n\n=== {key.upper()} ===\n{content}"
    
    # Extract key topics
    print("🔍 Extracting key topics...")
    topics = extract_key_topics(all_content)
    print(f"📋 Found {len(topics)} relevant topics: {', '.join(topics[:10])}{'...' if len(topics) > 10 else ''}")
    
    return files_data, topics, all_content

files_data, topics, all_content = analyze_course_content()

contentfreshnessagent = LlmAgent(
    name="ContentFreshnessAgent",
    model="gemini-2.5-flash",
    description="This agent activates itself, searches the web and finds the most up-to-date information and adds it to the syllabus",
    tools=[google_search],
    instruction=f"""
You are an expert ContentFreshnessAgent with 20+ years specialized in keeping course content current with the latest developments in AI, technology, and related fields.

Here are the input files (auto-read from disk on startup):

=== COMBINED COURSE CONTENT START ===
{all_content}
=== COMBINED COURSE CONTENT END ===

Extracted key topics (seed list, expand as needed):
{', '.join(topics)}

## YOUR MISSION
1. **Read and Analyze Course Files**: 
   - Parse curriculum.pdf for course structure and topics
   - Review deep_course_content_output.txt for detailed weekly content
   - Examine planner_agent_instruction.txt for course objectives and planning

2. **Identify Key Technologies and Concepts**:
   - DYNAMICALLY extract topics from the actual course content (no predefined keywords)
   - Analyze technical terms, algorithms, frameworks, and methodologies mentioned in the files
   - Identify proper nouns, acronyms, and specialized terminology
   - Focus on context-specific technologies and concepts unique to this course
   - Extract compound terms and technical phrases from the curriculum

3. **Web Search Strategy**:
   - Search for latest news and innovations in identified topics (within last 6 months)
   - Look for recent breakthroughs, research papers, and industry developments
   - Find current progress updates from major tech companies (OpenAI, Google, Meta, Microsoft, etc.)
   - Identify emerging trends and technologies relevant to the course

4. **Content Integration**:
   - Suggest specific updates to make content more current
   - Recommend new examples, case studies, or applications
   - Propose additions of recent developments and innovations
   - Maintain relevance while preserving core learning objectives

## SEARCH FOCUS AREAS (prioritize 2024-2025 developments)
- Latest AI research and breakthroughs (GPT-4, Claude, Gemini updates)
- New machine learning techniques and algorithms
- Industry applications and use cases
- Tech company announcements and product launches
- Open source project updates (Hugging Face, GitHub, etc.)
- Academic research and publications
- Emerging technologies and trends (AI agents, multimodal AI, etc.)
- Current industry standards and best practices

## SEARCH QUERIES TO USE
Based on the ACTUAL course content analysis, dynamically generate search queries like:
- "latest [EXTRACTED_TOPIC] developments 2024 2025"
- "new [TECHNOLOGY_FROM_COURSE] breakthroughs"
- "recent [FRAMEWORK_MENTIONED] advances"
- "[SPECIFIC_ALGORITHM] latest research"
- "[COMPANY/TOOL_IN_CURRICULUM] recent updates"
- "emerging trends in [COURSE_DOMAIN]"

Where [EXTRACTED_TOPIC], [TECHNOLOGY_FROM_COURSE], etc. are dynamically extracted from the course files.

## DYNAMIC ANALYSIS APPROACH
1. Parse all course content for technical terminology
2. Extract acronyms, proper nouns, and specialized terms
3. Identify frameworks, tools, and methodologies specifically mentioned
4. Focus searches on the ACTUAL topics covered in the curriculum
5. Avoid generic searches - be specific to the course content

## OUTPUT FORMAT
Provide structured recommendations with:
- **Current Topic**: What's being updated
- **Latest Development**: Recent news/innovation found (include date)
- **Relevance**: How it relates to the course content
- **Integration Suggestion**: Specific way to incorporate into curriculum
- **Source**: Where the information was found
- **Impact Level**: High/Medium/Low relevance to course

## EXECUTION STEPS
1. First, analyze all course files to understand current content
2. Extract key topics and technologies covered
3. Perform targeted web searches for each major topic
4. Focus on developments from 2024-2025
5. Provide comprehensive update recommendations

Today's date is {datetime.now().strftime('%B %d, %Y')}. Prioritize very recent developments.
"""
)

root_agent = contentfreshnessagent
