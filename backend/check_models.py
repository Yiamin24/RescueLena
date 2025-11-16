import google.generativeai as genai
from config import config

genai.configure(api_key=config.GOOGLE_API_KEY)

print("Available Gemini models:")
print("-" * 50)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✓ {model.name}")
        print(f"  Display name: {model.display_name}")
        print(f"  Methods: {model.supported_generation_methods}")
        print()
