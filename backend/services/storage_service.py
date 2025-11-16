from supabase import create_client, Client
from config import config
import uuid
import os

class StorageService:
    def __init__(self):
        if config.SUPABASE_URL and config.SUPABASE_KEY:
            self.client: Client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
            self.bucket_name = config.SUPABASE_BUCKET
        else:
            print("Warning: Supabase credentials not configured")
            self.client = None
    
    async def upload_image(self, file_path: str, content_type: str = "image/jpeg") -> str:
        """Upload image to Supabase Storage and return public URL."""
        try:
            if not self.client:
                return f"local://{file_path}"
            
            # Generate unique filename
            filename = f"incidents/{uuid.uuid4()}.jpg"
            
            # Read file content
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            # Upload to Supabase Storage with upsert to bypass RLS
            response = self.client.storage.from_(self.bucket_name).upload(
                path=filename,
                file=file_content,
                file_options={
                    "content-type": content_type,
                    "upsert": "true"
                }
            )
            
            # Get public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(filename)
            
            return public_url
        except Exception as e:
            print(f"Error uploading image to Supabase: {e}")
            raise Exception(f"Image upload failed: {e}")

storage_service = StorageService()
