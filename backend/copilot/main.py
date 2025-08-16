import asyncio
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.genai import types
from datetime import datetime

# if you're running from the parent folder and importing config:
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import user_name, user_id

from knowledge.agent import final_pipeline              # first two agents (Sequential)
from knowledge_1.agent import deep_content_loop         # deep content agent (Loop)

load_dotenv()

db_url = "sqlite:///./my_agent_data.db"
session_service = DatabaseSessionService(db_url=db_url)

initial_state = {
    "user_name": user_name,
    "user_id": user_id,
}

APP_NAME = "AI Copilot for Instructors"

async def run_first_two_agents(session_id: str):
    """Run CoursePlanner + ContentGenerator pipeline and wait for completion."""
    runner = Runner(agent=final_pipeline, app_name=APP_NAME, session_service=session_service)
    content = types.Content(role="user", parts=[types.Part(text="Please generate the full course now.")])

    async for event in runner.run_async(
        user_id=user_id, session_id=session_id, new_message=content
    ):
        if event.is_final_response():
            print("[Stage 1] Generation finished.")
            break

async def run_deep_agent(session_id: str) -> None:
    """Run Deep Content agent, then print its output to the console."""
    deep_runner = Runner(agent=deep_content_loop, app_name=APP_NAME, session_service=session_service)

    # Trigger deep generation (agent will read entire DB via its tool)
    msg = types.Content(
        role="user",
        parts=[types.Part(text="Read the entire DB (state + events) and generate the next full week of deep content.")]
    )

    async for event in deep_runner.run_async(
        user_id=user_id, session_id=session_id, new_message=msg
    ):
        if event.is_final_response():
            print("[Stage 2] Deep content generation finished.")
            break

    # Print deep output (from session.state)
    sess = await session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    deep = sess.state.get("deep_course_content")
    if deep:
        print("\n=== Deep Content (preview) ===\n")
        # print a larger chunk for easy copying; adjust as you prefer
        print(deep if len(deep) < 12000 else deep[:12000] + "\n... [truncated]\n")

        # Save full deep content to a file under "Inputs and Outputs" directory at project root
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        io_dir = os.path.join(project_root, "Inputs and Outputs")
        os.makedirs(io_dir, exist_ok=True)

        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        filename = f"deep_content_{session_id}_{ts}.txt"
        out_path = os.path.join(io_dir, filename)
        try:
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(deep)
            print(f"\n[Stage 2] Deep content saved to: {out_path}")
        except Exception as e:
            print(f"\n[Stage 2] Failed to save deep content to file: {e}")
    else:
        print("[Stage 2] No deep content found in state. Check agent/tools and logs.")

async def main_async():
    # Ensure or reuse a session shared by both stages
    existing = await session_service.list_sessions(app_name=APP_NAME, user_id=user_id)
    if existing and len(existing.sessions) > 0:
        SESSION_ID = existing.sessions[0].id
        print(f"Continuing existing session: {SESSION_ID}")
    else:
        new_sess = await session_service.create_session(
            app_name=APP_NAME, user_id=user_id, state=initial_state
        )
        SESSION_ID = new_sess.id
        print(f"Created new session: {SESSION_ID}")

    # 1) Run first two agents (writes plan + content to DB)
    print("\n=== Running Planner + Content Generator ===")
    await run_first_two_agents(SESSION_ID)

    # Optional: observe keys saved by stage-1
    sess = await session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=SESSION_ID)
    print("Saved keys after Stage 1:", list(sess.state.keys()))

    # 2) Run deep agent (reads DB, then prints deep content to console)
    print("\n=== Running Deep Content Generator ===")
    await run_deep_agent(SESSION_ID)

if __name__ == "__main__":
    asyncio.run(main_async())
