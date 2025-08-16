from google.adk.agents import LlmAgent, LoopAgent
from google.adk.tools import google_search
from pathlib import Path 
import os
import sqlite3, json
from google.adk.tools.tool_context import ToolContext

# === DB READER TOOL FUNCTIONS ===

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

deepcontentgeneration = LlmAgent(
    name="deepcontentgeneration",
    model="gemini-2.0-flash",
    tools=[db_read_session_dump],
    description=(
        "Reads the entire session database (state + all events) and produces "
        "extremely detailed, instructor-teachable weekly content that builds on "
        "the CoursePlannerAgent and ContentGeneratorAgent outputs."
    ),
    instruction=f"""
You are the **Deep Content Generation** agent.

GOAL
- Produce extremely detailed, instructor-ready weekly course content, grounded in **all prior work**:

MUST DO FIRST
1) Call `db_read_session_dump(include_state=true, include_events=true)`.
2) Read the returned 'dump' **word by word, line by line**. This is the authoritative context for this session.
3) If the response indicates `truncated=true`, call the tool again with a larger `max_chars` and continue reading until you have everything you need.

CONTENT STRATEGY
- Treat the dump as the canonical history: planner specifications, plan, generated materials, and any previous deep content.
- Synthesize and **expand** every idea for real classroom use:
    - Clear explanations (student-friendly)
    - Worked examples, step-by-step
    - Instructor notes, misconceptions, scaffolding
    - Differentiation (remedial/enrichment)
    - Activities, labs, worksheets, rubrics, answer keys
    - Short assessments (formative & summative) with answers
    - Resource list (verified via Google Search when helpful)

WEEKLY PRODUCTION RULES
- Create **one fully complete week** per iteration, then stop.
- Check the database dump for any existing deep content, and if found, continue from the **next** week number and **append** (do NOT overwrite).
- Follow this structure:

=== PROCESSING WEEK [NUMBER] ===

# Week [Number]: [Title] — From Real-World Problem to Solution

## 🔗 Connection to Prior Learning
[Concise recap that bridges to this week.]

## 🔍 Real-World Problem
[Compelling scenario and why it matters.]

## 💡 Core Concept(s) as the Solution
[Deep explanation connecting concept(s) to the problem.]

## 📚 Teach It Deeply (Instructor Script)
- [Narrative explanation with analogies]
- [Stepwise breakdowns and mini-checks]
- [Common misconceptions + fixes]

## 🧪 Guided Practice
- [2–3 worked examples with steps and reasoning]

## 🧠 Independent Practice (Worksheet)
- [8–12 problems with answers/solutions]

## 🧩 Project / Lab (if applicable)
- [Detailed steps, expected outputs, evaluation criteria]

## ✅ Assessment
- **Formative quiz** (5–8 Qs) with answers
- **Summative task** with rubric

## 🧭 Differentiation & Support
- [Remedial tasks, enrichment options, accommodations]

## 📚 References & Current Resources
- [If you used Google Search: include links + why relevant]

## 🚀 Looking Ahead
- [How this sets up the next week]

=== WEEK [NUMBER] COMPLETED ===
<<HALT_FOR_SECONDS:10>>

OUTPUT RULES
- Always **append** to existing deep course content found in the database.
- If conflicting info appears in the dump, prioritize the **most recent** events/state and explain the resolution in one sentence.
""",
    output_key="deep_course_content",
)

# Loop it so it can generate multiple weeks (one per iteration)
deep_content_loop = LoopAgent(
    name="DeepContentLoop",
    sub_agents=[deepcontentgeneration],
    description="Generates one complete, instructor-ready week per iteration by reading the entire DB.",
    max_iterations=3,  # adjust as needed
)

root_agent = deep_content_loop