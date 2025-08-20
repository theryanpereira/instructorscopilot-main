# Import necessary libraries for Google Gemini API, environment variables, and file operations
import google.generativeai as genai
from dotenv import load_dotenv
import os
import pathlib
import json

# Load environment variables from .env file
load_dotenv()

# Function to load user configuration from a JSON file
def _load_user_config():
    """Load user inputs from file if exists, return empty dict if not found or corrupted"""
    config_file = "user_config.json"
    # Check if the configuration file exists
    if os.path.exists(config_file):
        try:
            # Open and load the JSON data from the file
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        # Handle specific error for corrupted JSON
        except json.JSONDecodeError:
            print(f"Warning: user_config.json is corrupted. Starting with an empty configuration.")
            return {}
        # Handle any other exceptions during file loading
        except Exception as e:
            print(f"Error loading user_config.json: {e}. Starting with an empty configuration.")
            return {}
    # Return an empty dictionary if the file does not exist
    return {}

# Function to save user configuration to a JSON file
def _save_user_config(config_data):
    """Save user inputs to file"""
    config_file = "user_config.json"
    try:
        # Open and dump the dictionary data to the JSON file
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2)
    # Handle any exceptions during file saving
    except Exception as e:
        print(f"Error saving user_config.json: {e}")

# Function to update user ID and user name in the configuration
def update_user_id_and_name(user_id, user_name):
    # TEST CODE: Log data received by update_user_id_and_name
    print(f"TEST CODE: update_user_id_and_name called with user_id='{user_id}', user_name='{user_name}'")
    # Load the current configuration
    config = _load_user_config()
    # Update the user_id and user_name fields
    config["user_id"] = user_id
    config["user_name"] = user_name
    # Save the updated configuration
    _save_user_config(config)

# Function to update course-specific settings in the configuration
def update_course_settings(user_id, course_title, difficulty_level, duration, teaching_style):
    # TEST CODE: Log data received by update_course_settings
    print(f"TEST CODE: update_course_settings called with user_id='{user_id}', course_title='{course_title}', difficulty_level='{difficulty_level}', duration='{duration}', teaching_style='{teaching_style}'")
    # In a multi-user scenario, user_id would be used to find the specific user's config.
    # For now, assuming user_config.json stores the current active user's config.
    # Load the current configuration
    config = _load_user_config()
    # Update the course-related fields
    config["course_title"] = course_title
    config["difficulty_level"] = difficulty_level
    config["duration"] = duration
    config["teaching_style"] = teaching_style
    # Save the updated configuration
    _save_user_config(config)

# System prompt for the LLM, defining its role and responsibilities
system_prompt = """You are a course design assistant.

You will be provided with the following **mandatory inputs**:
1. A **curriculum document** in PDF format containing existing course content (e.g., syllabi, outlines, topics, activities, or readings)
2. A **course topic or name** describing what the learner or instructor wants the course to focus on
3. A selected **difficulty level** (see below)
4. A selected **teaching style** (see below)
5. A selected **duration** (see below)

---

## 🔹 Your responsibilities:

### 1. Analyze the provided course topic:
- Identify the key subject area, sub-domains, and intended focus
- Determine any implied target audience or specialization
- Use the title or topic to scope the content direction

### 2. Extract and analyze the curriculum PDF:
- Understand the course structure, core topics, objectives, and flow
- Identify key concepts, modules, teaching methods, assessments, and learning outcomes
- Extract reusable content relevant to the course topic
- Adapt teaching methodologies where possible to align with the selected teaching style

### 3. Integrate teaching style and difficulty level into all outputs:

#### ✅ Teaching Style (one selected, plus one default):

The user will select **one of the following** teaching styles:
- **Exploratory & Guided**: Encourage curiosity, pose questions, and guide learners to discover insights through problems or case studies.
- **Project-Based / Hands-On**: Focus on real-world tasks, projects, or examples. Ideal for teaching by doing and skill development.
- **Conceptual & Conversational**: Break down complex ideas using analogies and clear, friendly language. Great for simplifying tough concepts.

In **all cases**, you must also apply:
- **Clear & Structured** (default): Explain topics step-by-step in a logical, structured way. Use progressive layering of complexity to clarify concepts.

> 🔸 Each module should reflect **both** the Clear & Structured approach **and** the selected secondary style.

#### ✅ Difficulty Level (one required input):
- **Foundational**: No prior knowledge needed. Teaches core concepts, terms, and workflows with relatable examples and visuals. Ideal for early learners.
- **Intermediate**: Assumes basic familiarity. Builds understanding through structured applications, real-world cases, and layered explanations.
- **Advanced**: For experienced learners. Explores research insights, edge cases, system-level thinking, and implementation depth.

> 🔸 The difficulty level affects **content depth, tone, resource complexity, and expectations for outcomes**.

---

### 4. Design a modular course outline that:

- Matches the course topic and reflects extracted curriculum structure
- Contains 6–10 weekly or unit-based modules
- Clearly defines goals, key concepts, and expected outcomes for each module
- Integrates content from the curriculum wherever relevant
- Adapts structure and language to the selected teaching style and difficulty level

---

### 5. For each module, include:

- **Title and learning objectives**
- **Key concepts and skills to be covered**
- **Instructional activities or methods**, reflecting the selected teaching style and Clear & Structured flow
- **Integration of curriculum-based materials**, adapted for the course context
- **Real-time online resources**, found using live Google Search (include URLs + brief descriptions)
- **Suggestions for assessments, exercises, or projects** aligned with level and style

---

### 6. Format your output in clean, readable **Markdown**, using:

- Section headers
- Bullet points
- Clear structure per module
- Summary or final assessment if applicable

---

### 7. At the end of your output, generate a **system prompt for a Teaching Agent**, based on the designed course. This prompt should instruct the agent to:

- Use the course outline to support learners
- Answer questions based on specific module content
- Suggest supplemental readings and resources
- Adapt its communication to the teaching style and difficulty level
- Help students prepare for module activities and assessments

---

## 🧠 Your goal:
Create a **cohesive, learner-aligned course plan** that:
- Bridges user goals and curriculum source material
- Incorporates modern pedagogy through style and difficulty adaptation
- Delivers a strong modular structure and curated web content
- Enables AI teaching support via a follow-up agent prompt

Respond only after carefully analyzing all inputs and formatting the final course plan in structured Markdown."""

# Function to generate course content using the LLM
def generate_course_content(client, teaching_style, duration, difficulty_level, google_search_tool, system_prompt, filepath=None, course_content=None, task=None):
    """
    Generate course content using the LLM
    
    Args:
        client: The Gemini client instance
        teaching_style: Teaching style preference
        duration: Course duration
        difficulty_level: Difficulty level
        google_search_tool: Google search tool for the LLM
        system_prompt: System instruction for the LLM
        filepath: Optional path to PDF file to include
        course_content: Optional text content to include (for quiz generation, etc.)
        task: Optional specific task description
        
    Returns:
        Generated response from the LLM
    """
    # Build contents list - start with basic inputs
    contents = [teaching_style, duration, difficulty_level]
    
    # Add course content if provided (for quiz generation, analysis, etc.)
    if course_content:
        contents.append(f"COURSE CONTENT:\n{course_content}")
    
    # Add task description if provided
    if task:
        contents.append(f"TASK: {task}")
    
    # Add PDF content only if filepath is provided and file exists
    if filepath and filepath.exists():
        contents.append(genai.types.Part.from_bytes(
            data=filepath.read_bytes(),
            mime_type='application/pdf',
        ))
    
    # Generate content using the Gemini model
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=contents,
        config=genai.types.GenerateContentConfig(
            tools=[google_search_tool],
            system_instruction=system_prompt,
        ),
    )
    return response


# Main execution block when the script is run directly
if __name__ == "__main__":
    # Try to load existing user inputs
    saved_inputs = _load_user_config()

    # If saved inputs exist, use them
    if saved_inputs:
        print("Using saved user configuration:")
        # Print all loaded configuration details
        print(f"User Name: {saved_inputs['user_name']}")
        print(f"User ID: {saved_inputs['user_id']}")
        print(f"Difficulty Level: {saved_inputs['difficulty_level']}")
        print(f"Duration: {saved_inputs['duration']}")
        print(f"Teaching Style: {saved_inputs['teaching_style']}")
        print(f"Course Title: {saved_inputs['course_title']}")

        # Assign loaded values to variables
        user_name = saved_inputs['user_name']
        user_id = saved_inputs['user_id']
        difficulty_level = saved_inputs['difficulty_level']
        duration = saved_inputs['duration']
        teaching_style = saved_inputs['teaching_style']
        course_title = saved_inputs['course_title']
        print("Using existing configuration.")
    # If no saved inputs, prompt the user for details
    else:
        print("First time setup - please provide your details:")

        # Loop to get valid user ID
        while True:
            user_id = input("Give a user ID (Example: user_id_5678): ")
            if user_id.strip() == "":
                print("User ID cannot be empty. Please enter a valid ID.")
            else:
                break
        
        # Loop to get valid user name
        while True:
            user_name = input("Give a user name: ")
            if user_name.strip() == "":
                print("User name cannot be empty. Please enter a valid name.")
            else:
                break

        # Loop to get valid course title
        while True:
            course_title = input("Enter the course topic or title: ")
            if course_title.lower() == "none" or course_title.strip() == "":
                print("Course Title cannot be empty. Please enter a valid title.")
            else:
                break

        # Loop to get valid difficulty level
        while True:
            difficulty_level = input("Enter the difficulty level (Foundational, Intermediate, Advanced): ")
            if difficulty_level.lower() in ['none',''] or difficulty_level.lower() not in ['foundational', 'intermediate', 'advanced']:
                print("Difficulty Level cannot be empty. Please enter a valid difficulty level.")
            else:
                break

        # Loop to get valid duration
        while True:
            duration = input("Enter the desired duration for the course (e.g., 4 weeks, 8 weeks): ")
            if duration == "" or duration.lower() == "none":
                print("Duration cannot be empty. Please enter a valid duration.")
            else:
                break

        # Loop to get valid teaching style
        while True:
            teaching_style = input("Enter preferred teaching style (e.g., Exploratory & Guided, Project-Based / Hands-On, Conceptual & Conversational): ")
            if teaching_style.lower() == "none" or teaching_style.strip() == "":
                print("Teaching Style cannot be empty. Please enter a valid teaching style.")
            else:
                break


        # Save newly collected inputs using the update functions
        update_user_id_and_name(user_id, user_name)
        update_course_settings(user_id, course_title, difficulty_level, duration, teaching_style)
        print("Configuration saved for future runs.")

    # Initialize client and tools only when running as main script
    client = genai.Client() # Removed explicit api_key as it's picked from environment

    # Configure Google Search as a tool for grounding
    google_search_tool = genai.types.Tool(
        google_search=genai.types.GoogleSearch()
    )

    print("Thank you for providing the inputs. Processing your request...")

    try:
        # Define the path to the curriculum PDF
        filepath = pathlib.Path("Inputs and Outputs/curriculum.pdf")
        # Generate course content using the LLM with collected inputs
        response = generate_course_content(client, teaching_style, duration, difficulty_level, google_search_tool, system_prompt, filepath)

        # Print the LLM's response
        print(response.text)

        # Save the response to a text file for the planner agent
        output_file_path = "Inputs and Outputs/planner_agent_instruction.txt"
        try:
            with open(output_file_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"\nResponse saved to: {output_file_path}")
        # Handle errors during file saving
        except Exception as e:
            print(f"Error saving response to file: {e}")

        # Optional: Print grounding metadata if available from the LLM response
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
    # Handle general exceptions during LLM interaction
    except Exception as e:
        print(f"An error occurred during LLM interaction: {e}")

# TEST CODE: Function to verify inputs by reading user_config.json
def _read_and_print_config_for_testing():
    print("\n--- TEST CODE: Verifying user_config.json contents ---")
    config = _load_user_config()
    if config:
        print("Loaded user_config.json:")
        for key, value in config.items():
            print(f"  {key}: {value}")
    else:
        print("user_config.json not found or is empty/corrupted.")
    print("--- END TEST CODE ---\n")

# Main execution block when the script is run directly
if __name__ == "__main__":
    # Try to load existing user inputs
    saved_inputs = _load_user_config()

    # If saved inputs exist, use them
    if saved_inputs:
        print("Using saved user configuration:")
        # Print all loaded configuration details
        print(f"User Name: {saved_inputs['user_name']}")
        print(f"User ID: {saved_inputs['user_id']}")
        print(f"Difficulty Level: {saved_inputs['difficulty_level']}")
        print(f"Duration: {saved_inputs['duration']}")
        print(f"Teaching Style: {saved_inputs['teaching_style']}")
        print(f"Course Title: {saved_inputs['course_title']}")

        # Assign loaded values to variables
        user_name = saved_inputs['user_name']
        user_id = saved_inputs['user_id']
        difficulty_level = saved_inputs['difficulty_level']
        duration = saved_inputs['duration']
        teaching_style = saved_inputs['teaching_style']
        course_title = saved_inputs['course_title']
        print("Using existing configuration.")
    # If no saved inputs, prompt the user for details
    else:
        print("First time setup - please provide your details:")

        # Loop to get valid user ID
        while True:
            user_id = input("Give a user ID (Example: user_id_5678): ")
            if user_id.strip() == "":
                print("User ID cannot be empty. Please enter a valid ID.")
            else:
                break
        
        # Loop to get valid user name
        while True:
            user_name = input("Give a user name: ")
            if user_name.strip() == "":
                print("User name cannot be empty. Please enter a valid name.")
            else:
                break

        # Loop to get valid course title
        while True:
            course_title = input("Enter the course topic or title: ")
            if course_title.lower() == "none" or course_title.strip() == "":
                print("Course Title cannot be empty. Please enter a valid title.")
            else:
                break

        # Loop to get valid difficulty level
        while True:
            difficulty_level = input("Enter the difficulty level (Foundational, Intermediate, Advanced): ")
            if difficulty_level.lower() in ['none',''] or difficulty_level.lower() not in ['foundational', 'intermediate', 'advanced']:
                print("Difficulty Level cannot be empty. Please enter a valid difficulty level.")
            else:
                break

        # Loop to get valid duration
        while True:
            duration = input("Enter the desired duration for the course (e.g., 4 weeks, 8 weeks): ")
            if duration == "" or duration.lower() == "none":
                print("Duration cannot be empty. Please enter a valid duration.")
            else:
                break

        # Loop to get valid teaching style
        while True:
            teaching_style = input("Enter preferred teaching style (e.g., Exploratory & Guided, Project-Based / Hands-On, Conceptual & Conversational): ")
            if teaching_style.lower() == "none" or teaching_style.strip() == "":
                print("Teaching Style cannot be empty. Please enter a valid teaching style.")
            else:
                break


        # Save newly collected inputs using the update functions
        update_user_id_and_name(user_id, user_name)
        update_course_settings(user_id, course_title, difficulty_level, duration, teaching_style)
        print("Configuration saved for future runs.")

    # Initialize client and tools only when running as main script
    client = genai.Client() # Removed explicit api_key as it's picked from environment

    # Configure Google Search as a tool for grounding
    google_search_tool = genai.types.Tool(
        google_search=genai.types.GoogleSearch()
    )

    print("Thank you for providing the inputs. Processing your request...")

    try:
        # Define the path to the curriculum PDF
        filepath = pathlib.Path("Inputs and Outputs/curriculum.pdf")
        # Generate course content using the LLM with collected inputs
        response = generate_course_content(client, teaching_style, duration, difficulty_level, google_search_tool, system_prompt, filepath)

        # Print the LLM's response
        print(response.text)

        # Save the response to a text file for the planner agent
        output_file_path = "Inputs and Outputs/planner_agent_instruction.txt"
        try:
            with open(output_file_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"\nResponse saved to: {output_file_path}")
        # Handle errors during file saving
        except Exception as e:
            print(f"Error saving response to file: {e}")

        # Optional: Print grounding metadata if available from the LLM response
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
    # Handle general exceptions during LLM interaction
    except Exception as e:
        print(f"An error occurred during LLM interaction: {e}")

    # TEST CODE: Read and print the final user_config.json contents
    _read_and_print_config_for_testing()