"""
Social Media Monitoring Service
Monitors Twitter/X for disaster-related posts
"""
import asyncio
import re
from typing import List, Dict, Any
from datetime import datetime
import os

# Note: For production, install: pip install tweepy
# For demo, we'll use a mock implementation

class SocialMediaService:
    def __init__(self):
        self.keywords = [
            'fire', 'flood', 'earthquake', 'emergency', 'help', 'disaster',
            'rescue', 'trapped', 'building collapse', 'evacuation', 'urgent',
            '🔥', '🌊', '🆘', '⚠️', 'SOS'
        ]
        self.is_monitoring = False
        
    async def start_monitoring(self, callback):
        """Start monitoring social media for disaster posts."""
        self.is_monitoring = True
        
        # Production implementation required
        await self._production_monitor(callback)
    
    async def _production_monitor(self, callback):
        """Production implementation required - Twitter API credentials needed."""
        while self.is_monitoring:
            await asyncio.sleep(30)
            print(f"[Social Media Monitor] Twitter API credentials required for monitoring")
    
    async def analyze_post(self, post_text: str) -> Dict[str, Any]:
        """Analyze social media post for disaster information."""
        # Check if post contains disaster keywords
        text_lower = post_text.lower()
        
        detected_type = "other"
        for keyword, incident_type in [
            ('fire', 'fire'),
            ('flood', 'flood'),
            ('earthquake', 'earthquake'),
            ('collapse', 'building_collapse'),
            ('trapped', 'people_trapped'),
            ('medical', 'medical')
        ]:
            if keyword in text_lower:
                detected_type = incident_type
                break
        
        # Extract urgency indicators
        urgency = "medium"
        if any(word in text_lower for word in ['urgent', 'emergency', 'help', 'sos', '🆘']):
            urgency = "high"
        elif any(word in text_lower for word in ['warning', 'alert']):
            urgency = "medium"
        else:
            urgency = "low"
        
        # Extract location mentions (simple regex)
        location_match = re.search(r'(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', post_text)
        location = location_match.group(1) if location_match else "Unknown location"
        
        return {
            "type": detected_type,
            "urgency": urgency,
            "description": post_text[:200],
            "location_text": location,
            "confidence": 0.7,  # Social media posts have lower confidence
            "source": "social_media",
            "people_affected": 0
        }
    
    def stop_monitoring(self):
        """Stop monitoring social media."""
        self.is_monitoring = False

# Production implementation with real Twitter API
class TwitterService:
    """
    Production Twitter/X monitoring service.
    
    Setup:
    1. Install: pip install tweepy
    2. Get API keys from: https://developer.twitter.com/
    3. Add to .env:
       TWITTER_API_KEY=your_key
       TWITTER_API_SECRET=your_secret
       TWITTER_ACCESS_TOKEN=your_token
       TWITTER_ACCESS_SECRET=your_secret
    """
    
    def __init__(self):
        self.api_key = os.getenv('TWITTER_API_KEY')
        self.api_secret = os.getenv('TWITTER_API_SECRET')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.access_secret = os.getenv('TWITTER_ACCESS_SECRET')
        
        # Uncomment when credentials are available:
        # import tweepy
        # auth = tweepy.OAuthHandler(self.api_key, self.api_secret)
        # auth.set_access_token(self.access_token, self.access_secret)
        # self.api = tweepy.API(auth)
    
    async def stream_tweets(self, keywords: List[str], callback):
        """Stream tweets matching keywords in real-time."""
        # Uncomment for production:
        # import tweepy
        # 
        # class DisasterStreamListener(tweepy.StreamListener):
        #     async def on_status(self, status):
        #         tweet_data = {
        #             "text": status.text,
        #             "user": status.user.screen_name,
        #             "location": status.user.location,
        #             "timestamp": status.created_at.isoformat(),
        #             "coordinates": status.coordinates
        #         }
        #         await callback(tweet_data)
        # 
        # listener = DisasterStreamListener()
        # stream = tweepy.Stream(auth=self.api.auth, listener=listener)
        # stream.filter(track=keywords, is_async=True)
        pass

social_media_service = SocialMediaService()
