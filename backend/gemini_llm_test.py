import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# The client will automatically use the GOOGLE_API_KEY from the environment
client = genai.Client()

# Configure Google Search as a tool
google_search_tool = genai.types.Tool(
    google_search=genai.types.GoogleSearch()
)

# Example query that would benefit from web search
user_query = "What is the latest closing price of Bajaj Auto Ltd NSE stock?"

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