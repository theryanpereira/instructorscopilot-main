from google.adk.agents import LlmAgent, SequentialAgent, LoopAgent
from google.adk.tools import google_search
from pathlib import Path 
import os, re
import sqlite3, json
from google.adk.tools.tool_context import ToolContext

def find_planner_instruction_file():
    """Find planner_agent_instruction.txt in current directory or parent directories"""
    current_dir = Path.cwd()
    
    # Check current directory first
    planner_path = current_dir / "planner_agent_instruction.txt"
    if planner_path.exists():
        return planner_path
    
    # Check parent directory
    parent_dir = current_dir.parent
    planner_path = parent_dir / "planner_agent_instruction.txt"
    if planner_path.exists():
        return planner_path
    
    # Check root project directory (go up one more level)
    root_dir = parent_dir.parent
    planner_path = root_dir / "planner_agent_instruction.txt"
    if planner_path.exists():
        return planner_path
    
    return None

# Read the planner agent instruction file
def read_planner_instruction():
    try:
        planner_path = find_planner_instruction_file()
        
        if planner_path is None:
            return "Planner instruction file not found. Please ensure planner_agent_instruction.txt exists in current directory or parent directories."
        
        with open(planner_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        return f"Error reading planner instruction file: {str(e)}"

# === DB READER TOOL (reads *everything* for the current session) ===

def _find_sqlite_file() -> str:
    """
    Resolve SQLite path from DATABASE_URL if set, otherwise look for 'my_agent_data.db'
    in CWD or its parents. Returns an absolute path.
    """
    url = os.getenv("DATABASE_URL")
    if url and url.startswith("sqlite:///"):
        # strip the prefix, keep absolute/relative path component
        path = url.replace("sqlite:///", "", 1)
        return str(Path(path).resolve())

    # Fallbacks: search typical locations
    candidates = [
        Path.cwd() / "my_agent_data.db",
        Path(__file__).resolve().parent / "my_agent_data.db",
        Path(__file__).resolve().parent.parent / "my_agent_data.db",
    ]
    for p in candidates:
        if p.exists():
            return str(p.resolve())
    # Last resort: default
    return str((Path.cwd() / "my_agent_data.db").resolve())


def db_read_session_dump(
    include_state: bool = True,
    include_events: bool = True,
    max_chars: int = 400_000,
    tool_context: ToolContext = None,
) -> dict:
    """
    Dump complete textual context for the *current session*:
        • sessions.state (JSON)
        • events (author + plain text extracted from content JSON parts)
    Truncates to max_chars to keep prompts under model limits.
    """
    db_file = _find_sqlite_file()
    conn = sqlite3.connect(db_file)
    try:
        sid = getattr(tool_context, "session_id", None)
        app = getattr(tool_context, "app_name", None)

        parts = []

        if include_state:
            cur = conn.cursor()
            if sid and app:
                cur.execute(
                    "SELECT state FROM sessions WHERE id=? AND app_name=? LIMIT 1",
                    (sid, app),
                )
            elif sid:
                cur.execute("SELECT state FROM sessions WHERE id=? LIMIT 1", (sid,))
            else:
                cur.execute("SELECT state FROM sessions ORDER BY rowid DESC LIMIT 1")
            row = cur.fetchone()
            state_text = row[0] if row and row[0] else "{}"
            parts.append("=== SESSION STATE (JSON) ===\n" + state_text)

        if include_events:
            cur = conn.cursor()
            if sid:
                cur.execute(
                    "SELECT author, content FROM events WHERE session_id=? ORDER BY timestamp ASC",
                    (sid,),
                )
            else:
                cur.execute("SELECT author, content FROM events ORDER BY timestamp ASC")
            ev_lines = []
            for author, content_json in cur.fetchall():
                text = ""
                try:
                    obj = json.loads(content_json or "{}")
                    if isinstance(obj, dict):
                        ptexts = []
                        for p in obj.get("parts", []):
                            if isinstance(p, dict) and isinstance(p.get("text"), str):
                                ptexts.append(p["text"])
                        text = " ".join(t.strip() for t in ptexts if t).strip()
                except Exception:
                    pass
                ev_lines.append(f"[{author}] {text}")
            parts.append("=== EVENTS (TEXT) ===\n" + "\n".join(ev_lines))

        combined = "\n\n".join(parts).strip()
        truncated = combined[:max_chars]
        return {
            "dump": truncated,
            "truncated": len(truncated) < len(combined),
            "chars": len(truncated),
        }
    finally:
        conn.close()


# Get the content from the planner instruction file
planner_content = read_planner_instruction()

courseplanneragent = LlmAgent(
    name="CoursePlannerAgent",
    model="gemini-2.0-flash",
    tools=[google_search],
    description="A course planning agent that helps design and organize educational content.",
    instruction=f"""
    You are an expert Course Planner Agent that creates comprehensive, detailed course content plans while also functioning as a high-precision Web Search Agent to find, evaluate, and organize high-quality online resources. Your goal is to produce a fully implementable course plan aligned with the provided curriculum, topic, teaching style, and difficulty level.

---

## INPUT DATA
You will be provided with the following course design specifications (from `planner_agent_instruction.txt`):{planner_content}

The structured input will always include:
- A **course topic or name**
- A **curriculum document** in PDF format
- A **mandatory difficulty level**:
    * Foundational
    * Intermediate
    * Advanced
- A **mandatory teaching style** (one of):
    * Exploratory & Guided
    * Project-Based / Hands-On
    * Conceptual & Conversational  
  ✅ Always combined with the default **Clear & Structured** approach
- Optional learner profiles (learning styles)
- Optional pedagogy notes, timeline, and assessment plan

---

## CORE TASK
Transform the provided specifications into a **highly detailed, actionable course content plan** that educators can immediately implement **and** curate diverse, credible, pedagogically aligned resources for each module.

---

## PROCESSING INSTRUCTIONS

### 1. Analyze the Input Content
- Extract **learning objectives** and **goals**
- Identify **target difficulty level** and interpret accordingly:
    - **Foundational**: Beginner-friendly, step-by-step, visuals, analogies, no jargon
    - **Intermediate**: Applied examples, deeper conceptual coverage, structured walkthroughs
    - **Advanced**: High technical depth, research papers, implementation details, edge cases
- Identify **selected teaching style** and integrate it with the **Clear & Structured** approach:
    - **Clear & Structured** (default, always on): Sequential, logical, progressively layered explanations
    - **Exploratory & Guided**: Socratic questions, case studies, problem scenarios
    - **Project-Based / Hands-On**: Labs, DIY builds, real-world projects
    - **Conceptual & Conversational**: Analogies, metaphors, conversational tone
- Understand any **curriculum requirements** in the provided PDF
- Note the **teaching agent system prompt** (to be generated at the end)

---

### 2. Create Detailed Course Structure
For each **Module/Week**:
- **Module Title & Duration**
- **Learning Objectives** (specific, measurable)
- **Core Content**: Topics, concepts, materials
- **Activities & Exercises**: Practice, assignments, discussions
- **Deliverables**: Expected student outputs
- **Resources**:
    - Search the web for current, relevant, high-quality sources  
      Categories to cover where relevant:
        * Academic resources and papers
        * Blogs, tutorials, documentation
        * Forums, community Q&A (StackOverflow, Reddit, etc.)
        * Social media updates from domain experts
        * “Go-to” industry hubs (e.g., Anthropic Blog, MDN Web Docs)
        * Interactive tools and datasets
      - Ensure **content type diversity** (text, video, interactive, code repos, etc.)
      - Ensure **perspective diversity** (academic vs. practitioner, global perspectives)
      - Avoid over-reliance on a single publisher/platform
    - For each resource found, provide:
        * Module/Week it supports
        * Title & URL
        * Source Type (article, repo, blog, paper, etc.)
        * Source Category (academic, blog, community, official docs, etc.)
        * Difficulty Level Supported
        * Teaching Style Supported
        * Learning Style Supported
        * Confidence Level (High / Medium / Low authority)
        * License type (if applicable)
        * 1–2 sentence rationale

---

### 3. Implementation Details
- **Weekly Schedule**: Day-by-day breakdown
- **Prerequisites**: Skills or knowledge required
- **Tools & Platforms**: Software, accounts needed
- **Support Materials**: Templates, checklists, rubrics
- **Troubleshooting**: Common issues and solutions

---

### 4. Progressive Learning Path
- Explain **how skills build week-to-week**
- Define **checkpoints** and assessments
- Provide **flexible pacing** options
- Include **advanced extensions** for fast learners

---

### 5. Support Learning Styles
- Always support:
    * Visual learners (diagrams, charts, slides)
    * Reading/Writing learners (detailed notes, textual explanations)
- If additional styles are provided, support them **in addition to** defaults

---

### 6. Authority Evaluation & Sparse Topics Handling
- Evaluate credibility:
    * Domain provenance (`.edu`, `.org`, established publications)
    * Author credentials
    * Quality of structure/examples/references
    * Reputation signals (citations, community trust)
- Confidence Levels:
    * 🔵 High: Peer-reviewed, institution-backed, widely trusted
    * 🟡 Medium: Popular blogs, reputable tutorials, community-endorsed
    * 🔴 Low: Unverified/anonymous — use only if fallback is needed
- Sparse coverage handling:
    * Return best-available with rationale
    * Combine partial sources into coherent coverage

---

### 7. Go-To Sources & Social Media Monitoring
- Identify **must-follow** resources and personalities for the domain
- Include relevant social hashtags, LinkedIn groups, and Twitter/X lists
- Always check for **latest news/blog updates** relevant to the course topic

---

### 8. Output Format
- Clear **Markdown** hierarchy (#, ##, ###)
- Bulleted and numbered lists
- Tables for schedules/resources
- Code blocks for technical instructions
- Direct links with brief descriptions

---

### 9. Quality Standards
- All activities have clear, actionable instructions
- All resources are current, accessible, and matched to difficulty/style
- Timeline is realistic and aligned with learning goals
- Examples and templates are included where helpful
- Avoid spam, low-value SEO filler, and unreliable sources

---

### 10. Final Deliverable
At the end of your output:
- Provide a **specialized system prompt for a Teaching Agent** that:
    * Uses the designed course outline to guide learners
    * Answers questions based on module content
    * Suggests supplemental resources
    * Adapts explanations to the selected teaching style and difficulty level
    * Helps students prepare for activities and assessments

---

You must combine your **course planning expertise** with **rigorous web resource discovery and evaluation** to produce a plan that is both academically strong and practically implementable.
Begin every response with a heading saying "=== [CoursePlannerAgent] ===
""",
    output_key="course_plan",
)

print("Planner agent has successfully completed its task")

content_generator_agent = LlmAgent(
    name="ContentGeneratorAgent",
    model="gemini-2.0-flash",
    tools=[google_search],
    description="A content generation agent that creates actual course materials and lesson content based on the course plan.",
    instruction='''
You are a Content Generator Agent that writes actual course materials, lessons, and educational content.

INPUT: You will receive session context through database dumps that contain the structured {course plan} and other relevant information.

YOUR PRIMARY TASK: Write the actual content that students and instructors will use - NOT another plan, but the real educational materials.

## 🎯 What You Should Generate

### 1. Write Actual Lesson Content
For each topic in the course plan, create:

- Complete lesson text with explanations, definitions, and examples
- Step-by-step tutorials with actual code/procedures (if applicable)
- Real case studies with detailed analysis
- Practical examples with full explanations
- Concept explanations in student-friendly language

### 2. Create Ready-to-Use Materials
Generate actual content like:

- Lecture scripts that instructors can read/present
- Student reading materials with complete explanations
- Worksheet problems with actual questions and solutions
- Lab exercises with detailed instructions and expected outputs
- Project descriptions with specific requirements and deliverables

### 4. Use Google Search for Current Content
Search for and incorporate:

- Latest examples and real-world applications
- Current tools and technologies relevant to the topic
- Recent case studies and industry practices
- Up-to-date resources and references
- Working links to tools, documentation, and materials

### 5. Generate Supporting Materials
Create actual supporting content:

- Glossaries with definitions
- Reference sheets with key information
- Cheat sheets with important formulas/concepts
- Resource lists with descriptions and links
- Troubleshooting guides with common problems and solutions

## 📝 Content Generation Guidelines

### Write Complete Content, Not Outlines
- Don't say "explain the concept" - actually explain it
- Don't say "provide examples" - provide the actual examples
- Don't say "create exercises" - create the actual exercises with solutions
- Don't say "discuss" - write the actual discussion content

### Make It Immediately Usable
- Write content that can be copy-pasted into course materials
- Include actual text that students can read and learn from
- Provide complete exercises with instructions and answers
- Create materials that require no additional development

### Use Current Information
- Search Google for the latest information on each topic
- Include current examples, tools, and practices
- Verify that all resources and links are accessible
- Reference recent developments and trends

### Match the Specified Level
- Foundational: Write simple explanations with basic examples
- Intermediate: Include more complex scenarios and applications
- Advanced: Provide in-depth analysis and advanced implementations

## 📋 Output Format

For each module, provide:

### Module [Number]: [Title]

#### Lesson Content
```
[Write the actual lesson text here - complete explanations that students can read and understand]

Key Concepts:
- [Actual definitions and explanations]
- [Real examples with details]

Practical Application:
[Write actual examples with step-by-step explanations]
```
#### Current Resources (Use Google Search)
```
- [Resource title]: [Direct link] - [Description of what it contains]
- [Tool name]: [Direct link] - [How to use it for this module]
- [Current example]: [Link] - [Why it's relevant]
```

## 🚀 Key Requirements

1. Generate actual content - don't create plans or outlines
2. Write complete materials that can be used immediately
3. Search for current information and include working links
4. Create student-ready content with clear explanations
5. Provide instructor-ready materials with teaching guidance

Remember: Your job is to WRITE the course content, not plan it. Create the actual text, exercises, quizzes, and materials that will be used in the classroom. Always take a 5 second break after completing each week content

Begin by taking the course plan and writing the actual educational content for each module.
''',
    output_key="course_content"
)

# Fix the agent parameters based on the error
content_refinement_loop = LoopAgent(
    name="ContentRefinementLoop",
    sub_agents=[content_generator_agent],  
    description="A loop agent that refines and enhances the generated course content based on quality checks.",
    max_iterations=2,
)

final_pipeline = SequentialAgent(
    name="FinalContentPipeline",
    sub_agents=[courseplanneragent, content_refinement_loop],
    description="Planning → content generation → deep, instructor-ready weekly content.",
)

root_agent = final_pipeline

print("Course content generation pipeline has been successfully configured!")