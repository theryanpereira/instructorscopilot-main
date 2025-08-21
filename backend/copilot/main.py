import asyncio, os, sys, uuid, inspect
from pathlib import Path
from datetime import datetime

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types  # Content / Part
from dotenv import load_dotenv

# Make project root importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from knowledge.agent import courseplanneragent as final_pipeline  # your SequentialAgent (planner -> loop(content))

APP_NAME = "AI Copilot for Instructors"
EXPORT_DIR = "Inputs and Outputs"

def _nowstamp():
    return datetime.now().strftime("%Y%m%d-%H%M%S")

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

    print("\n=== Running Knowledge Pipeline (Planner -> Content) ===")
    # Stream buckets as a fallback if session.state isn't filled
    stream_bucket = {
        "CoursePlannerAgent": [],
        "Other": []
    }

    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=user_msg):
        if getattr(event, "type", "") == "agent_reply" or hasattr(event, "is_final_response"):
            txt = _extract_text(event)
            # Try to detect source agent
            agent_name = getattr(event, "agent_name", None)
            if not agent_name and txt.startswith("=== [CoursePlannerAgent] ==="):
                agent_name = "CoursePlannerAgent"
            if agent_name in stream_bucket:
                stream_bucket[agent_name].append(txt)
            else:
                stream_bucket["Other"].append(txt)

    sess = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    if inspect.isawaitable(sess):
        sess = await sess
    state = getattr(sess, "state", {}) or {}
    plan_txt = state.get("course_plan", "").strip()     # from CoursePlannerAgent

    if not plan_txt:
        # Fallback to the stream bucket
        plan_txt = "\n\n".join(stream_bucket["CoursePlannerAgent"]).strip()

    if not plan_txt:
        # As a last resort, dump anything we caught
        combined = "\n\n".join(stream_bucket["Other"]).strip()
        if not combined:
            raise RuntimeError("No output captured from planner agent. Ensure output_key is set and agent replies.")
        _write_txt("plan_agent_output", combined)
        return

    if plan_txt:
        _write_txt("plan_agent_output", plan_txt)

async def main_async():
    # You can tailor this to your exact expected input contract for the planner
    prompt = "Generate the course plan."
    await run_knowledge_and_save(prompt)

if __name__ == "__main__":
    asyncio.run(main_async())
