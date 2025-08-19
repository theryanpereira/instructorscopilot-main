import json
import os

def load_user_inputs():
    """Load user inputs from file if exists"""
    config_file = "user_config.json"
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return None
    return None

def save_user_inputs(user_name, user_id, difficulty_level, duration, teaching_style):
    """Save user inputs to file"""
    config_file = "user_config.json"
    config_data = {
        "user_name": user_name,
        "user_id": user_id,
        "difficulty_level": difficulty_level,
        "duration": duration,
        "teaching_style": teaching_style
    }
    try:
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2)
        return True
    except:
        return False

def get_user_config():
    """Get user configuration without prompting"""
    saved_inputs = load_user_inputs()
    if saved_inputs:
        return saved_inputs
    else:
        # Return default values if no config exists
        return {
            "user_name": "default_user",
            "user_id": "user_id_default",
            "difficulty_level": "beginner",
            "duration": "8 weeks",
            "teaching_style": "theoretical"
        }

# Load configuration when imported
config = get_user_config()
user_name = config['user_name']
user_id = config['user_id']
difficulty_level = config['difficulty_level']
duration = config['duration']
teaching_style = config['teaching_style']
