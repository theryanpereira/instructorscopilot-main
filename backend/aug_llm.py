import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

# The client will automatically use the GOOGLE_API_KEY from the environment
client = genai.Client()

# Configure Google Search as a tool for grounding
google_search_tool = genai.types.Tool(
    google_search=genai.types.GoogleSearch()
)

# Path to the input JSON file
input_json_path = "X:/Code/0 . Capstone Project Final/instructorscopilot-main/backend/ReferenceFiles/Sample Inputs/IntermediateMinimumInput.json"

def load_json_input(file_path):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"Error: The file at {file_path} was not found.")
        return None
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {file_path}. Please check the file format.")
        return None

# Load the hardcoded input from the JSON file
llm_input_data = load_json_input(input_json_path)

if llm_input_data:
    # Construct the full prompt using the loaded JSON data and the provided prompt
    user_query = f"""You are a course design assistant.

You will be given a JSON input object containing the following fields:
- `topic` (required): The name of the course or subject area.
- `difficulty` (required): An object with `level` and `description` fields describing the intended learner experience.
- `curriculum` (required): A structured text block representing the existing course plan or outline.
- `teaching_style` (optional): A description of the preferred instructional tone, structure, or modalities.
- `student_profiles` (optional): A list of learners with their learning styles and topic interests.

Your task is to:
1. Read and interpret the JSON data carefully.
2. Create a modular course outline with weekly or unit-based structure.
3. For each module:
   - Define goals and key concepts
   - Suggest activities or instructional methods
   - Recommend high-quality, up-to-date online resources using real-time Google search (include web links and short descriptions)
4. Format your output in readable **Markdown**, using headers and bullets.
5. If `teaching_style` or `student_profiles` are provided, incorporate them into the structure and tone. If not, use inclusive and clear best practices for undergraduate learners.
6. **At the end of your output, generate a new `system prompt` designed for an AI agent.**
   - This prompt should instruct the agent on how to deliver or expand the generated course.
   - The agent may use this course to guide learners, generate study materials, or answer topic questions interactively.

Ensure all reasoning and generation is based only on the provided JSON data, while supplementing with real-world resources via search.

Respond only after analyzing all provided inputs.

---
Input Data:
{json.dumps(llm_input_data, indent=2)}
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents=user_query,
            config=genai.types.GenerateContentConfig(
                tools=[google_search_tool],
            ),
        )

        print('Gemini LLM reply:', response.text)

        # Optional: Print grounding metadata if available
        if response.candidates:
            for candidate in response.candidates:
                if candidate.grounding_metadata and candidate.grounding_metadata.web_search_queries:
                    print("\n--- Grounding Metadata ---")
                    print("Web Search Queries:", candidate.grounding_metadata.web_search_queries)
                    if candidate.grounding_metadata.grounding_chunks:
                        print("Grounding Chunks (Web):")
                        for chunk in candidate.grounding_metadata.grounding_chunks:
                            if chunk.web:
                                print(f"  - Title: {chunk.web.title}, URL: {chunk.web.uri}")
    except Exception as e:
        print(f"An error occurred during LLM interaction: {e}")
else:
    print("Could not load input data for the LLM.") 