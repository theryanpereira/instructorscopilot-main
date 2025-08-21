import asyncio, os, sys, uuid, inspect
from pathlib import Path
from datetime import datetime

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types  # Content / Part
from dotenv import load_dotenv

# Make project root importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from knowledge_1.agent import deep_content_loop as final_pipeline  # LoopAgent over DeepCourseContentCreator

APP_NAME = "AI Copilot for Instructors"
EXPORT_DIR = "Inputs and Outputs"

def _out_dir() -> Path:
    root = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    p = root / EXPORT_DIR
    p.mkdir(parents=True, exist_ok=True)
    return p

def _write_txt(basename: str, text: str) -> Path:
    path = _out_dir() / f"{basename}.txt"
    path.write_text(text or "", encoding="utf-8")
    print(f"[OK] Saved: {path}")
    return path

def _extract_text(event) -> str:
    # Prefer event.text, else fall back to structured content.parts[*].text
    t = getattr(event, "text", None)
    if isinstance(t, str) and t.strip():
        return t
    content = getattr(event, "content", None)
    if content and getattr(content, "parts", None):
        for p in content.parts:
            pt = getattr(p, "text", None)
            if isinstance(pt, str) and pt.strip():
                return pt
    return ""

async def run_knowledge_and_save(prompt: str):
    # Ensure GEMINI_API_KEY loaded from project root .env
    project_root = Path(__file__).resolve().parents[1]
    load_dotenv(dotenv_path=project_root / ".env", override=False)
    if not os.getenv("GEMINI_API_KEY"):
        # Try alternative environment variable names
        if os.getenv("GOOGLE_API_KEY"):
            os.environ["GEMINI_API_KEY"] = os.getenv("GOOGLE_API_KEY")
        else:
            print("WARNING: GEMINI_API_KEY not found. Agent may not function properly.")
            return
    
    # Check for no-server mode to prevent port conflicts
    if os.getenv("NO_SERVER") == "1" or os.getenv("DISABLE_SERVICES") == "1":
        print("Running in no-server mode - disabling any potential service bindings")

    # 1) DB-free session
    session_service = InMemorySessionService()
    user_id = "user-local"
    session_id = f"session-{uuid.uuid4()}"
    created = session_service.create_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    if inspect.isawaitable(created):
        await created  # some builds expose async create

    # 2) Prepare message (GenAI format)
    user_msg = types.Content(role="user", parts=[types.Part.from_text(text=prompt)])

    # 3) Runner (SequentialAgent executes sub-agents in order) 
    #    (Sequential/Loop agent semantics in ADK docs)
    runner = Runner(agent=final_pipeline, app_name=APP_NAME, session_service=session_service)

    print("\n=== Running Deep Content Loop (DeepCourseContentCreator) ===")
    # Prepare output file: truncate at start so this run has a clean log
    output_path = _out_dir() / "deep_agent_output.txt"
    output_path.write_text("", encoding="utf-8")
    # Stream buckets as a fallback if session.state isn't filled
    stream_bucket = {
        "DeepCourseContentCreator": [],
        "Other": []
    }
    # Chronological capture of ALL text events (to preserve order)
    stream_all: list[str] = []

    seen_done = False
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=user_msg):
        # Capture ANY event text to avoid missing intermediate chunks
        txt = _extract_text(event)
        if not txt:
            continue
        # Detect source agent if available, else try to infer, else mark unknown
        agent_name = getattr(event, "agent_name", None)
        if not agent_name and txt.startswith("=== [DeepCourseContentCreator] ==="):
            agent_name = "DeepCourseContentCreator"
        # Save into buckets
        if agent_name in stream_bucket:
            stream_bucket[agent_name].append(txt)
        else:
            stream_bucket["Other"].append(txt)
        # Append to chronological log with labels
        etype = getattr(event, "type", "")
        label = agent_name or "UnknownAgent"
        chunk = f"--- [{label} | {etype}] ---\n{txt}\n"
        stream_all.append(chunk)
        # Also append to the file immediately to persist progress
        with output_path.open("a", encoding="utf-8") as f:
            f.write(chunk)
        # Detect completion sentinel
        if "DONE and DUSTED" in txt:
            seen_done = True

    # 4) Prefer full chronological stream so every iteration/message is captured (with labels)
    stream_full = "\n\n".join(stream_all).strip()

    if stream_full:
        # If we already appended while streaming, ensure file has the final full content as well
        # Overwrite to keep a single cohesive log
        output_path.write_text(stream_full + "\n", encoding="utf-8")
        # If sentinel was found, we consider this a complete run
        if seen_done:
            return

    # 5) Fallback to final state output if stream didn't capture
    sess = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    if inspect.isawaitable(sess):
        sess = await sess
    state = getattr(sess, "state", {}) or {}
    deep_txt = state.get("deep_content", "").strip()  # from DeepCourseContentCreator (output_key)

    if deep_txt:
        _write_txt("deep_agent_output", deep_txt)
        return

    # 6) Last resort: dump anything else we caught
    combined = "\n\n".join(stream_bucket["Other"]).strip()
    if not combined:
        raise RuntimeError("No output captured from DeepCourseContentCreator. Ensure output_key is set and agent replies.")
    _write_txt("deep_agent_output", combined)
    return

async def main_async():
    # Provide the deep content creator a concise task prompt
    prompt = "Take the provided course_content and generate deeply elaborated week-by-week lessons."
    await run_knowledge_and_save(prompt)

if __name__ == "__main__":
    asyncio.run(main_async())
