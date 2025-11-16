import google.generativeai as genai
from config import config
from typing import Dict, Any, List
import json

genai.configure(api_key=config.GOOGLE_API_KEY)

class GeminiService:
    def __init__(self):
        # Use Gemini 2.5 Flash - supports both text and vision
        self.vision_model = genai.GenerativeModel('models/gemini-2.5-flash')
        self.text_model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    async def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Analyze disaster image using Gemini Vision."""
        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            prompt = """Analyze this image for disaster/emergency situations.

INCIDENT TYPES (choose the most specific one):
- collapsed_building: Buildings that have fallen, structural damage, rubble
- fire: Active flames, burning structures
- flood: Water covering areas, submerged buildings/vehicles
- smoke: Heavy smoke without visible fire
- people_in_danger: People trapped, injured, or in immediate danger
- medical_emergency: Medical situations, ambulances, casualties
- other: Only if none of the above apply

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "type": "collapsed_building",
  "confidence": 0.95,
  "description": "Brief description of what you see",
  "people_affected": 0
}"""
            
            response = self.vision_model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_data}])
            
            # Parse JSON from response
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            
            result = json.loads(text.strip())
            return result
        except Exception as e:
            print(f"Gemini vision error: {e}")
            return {
                "type": "unknown",
                "confidence": 0.5,
                "description": "Error analyzing image",
                "people_affected": 0
            }
    
    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Extract incident information from text using Gemini NLP."""
        try:
            prompt = f"""Extract disaster/emergency information from this text:
"{text}"

Extract:
- Incident type (flood, fire, collapsed_building, medical_emergency, other)
- Location description
- Urgency level (low, medium, high)
- Number of people affected
- Brief description

Return ONLY valid JSON:
{{
  "type": "incident_type",
  "location_text": "location description",
  "urgency": "urgency_level",
  "people_affected": 0,
  "description": "brief description",
  "confidence": 0.85
}}"""
            
            response = self.text_model.generate_content(prompt)
            text_result = response.text.strip()
            
            if text_result.startswith("```json"):
                text_result = text_result[7:]
            if text_result.endswith("```"):
                text_result = text_result[:-3]
            
            result = json.loads(text_result.strip())
            return result
        except Exception as e:
            print(f"Gemini text error: {e}")
            return {
                "type": "unknown",
                "location_text": "Unknown",
                "urgency": "low",
                "people_affected": 0,
                "description": text[:100],
                "confidence": 0.5
            }
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text."""
        try:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"Embedding error: {e}")
            # Return zero vector as fallback
            return [0.0] * 768
    
    async def chat_response(self, message: str, context: str) -> str:
        """Generate chat response with context."""
        try:
            prompt = f"""You are RescueLena, an AI disaster response assistant.

Context (current incidents):
{context}

User question: {message}

Provide a helpful, concise response about the disaster situation."""
            
            response = self.text_model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Chat error: {e}")
            return "I'm having trouble processing your request. Please try again."

gemini_service = GeminiService()
