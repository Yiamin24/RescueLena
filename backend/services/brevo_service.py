"""
Brevo (formerly Sendinblue) Email Notification Service
Sends email alerts for high-urgency incidents
"""

import httpx
from config import config
from typing import Dict, Any, List
import os

class BrevoService:
    def __init__(self):
        self.api_key = os.getenv("BREVO_API_KEY")
        self.sender_email = os.getenv("BREVO_SENDER_EMAIL", "noreply@rescuelena.com")
        self.sender_name = os.getenv("BREVO_SENDER_NAME", "RescueLena Alert System")
        self.base_url = "https://api.brevo.com/v3"
        
        if not self.api_key:
            print("Warning: Brevo API key not configured. Email notifications disabled.")
    
    async def send_incident_alert(
        self, 
        incident: Dict[str, Any], 
        recipients: List[str]
    ) -> bool:
        """
        Send email alert for a new incident.
        
        Args:
            incident: Incident data dictionary
            recipients: List of email addresses to notify
        
        Returns:
            bool: True if email sent successfully
        """
        if not self.api_key or not recipients:
            return False
        
        try:
            # Prepare email content
            subject = f"🚨 {incident['urgency'].upper()} Priority: {incident['type'].replace('_', ' ').title()}"
            
            html_content = self._generate_email_html(incident)
            text_content = self._generate_email_text(incident)
            
            # Prepare API request
            headers = {
                "api-key": self.api_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "sender": {
                    "name": self.sender_name,
                    "email": self.sender_email
                },
                "to": [{"email": email} for email in recipients],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": text_content
            }
            
            # Send email via Brevo API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/smtp/email",
                    headers=headers,
                    json=payload,
                    timeout=10.0
                )
                
                if response.status_code == 201:
                    print(f"✅ Email alert sent for incident {incident.get('id', 'unknown')}")
                    return True
                else:
                    print(f"❌ Failed to send email: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"Error sending email alert: {e}")
            return False
    
    def _generate_email_html(self, incident: Dict[str, Any]) -> str:
        """Generate HTML email content."""
        urgency_color = {
            "high": "#ef4444",
            "medium": "#f97316",
            "low": "#22c55e"
        }.get(incident.get('urgency', 'low'), "#6b7280")
        
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: {urgency_color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🚨 RescueLena Alert</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px;">New {incident.get('urgency', 'unknown').upper()} Priority Incident</p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">Incident Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 40%;">Type:</td>
                <td style="padding: 8px 0;">{incident.get('type', 'Unknown').replace('_', ' ').title()}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Urgency:</td>
                <td style="padding: 8px 0;">
                    <span style="background-color: {urgency_color}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
                        {incident.get('urgency', 'Unknown').upper()}
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Confidence:</td>
                <td style="padding: 8px 0;">{int(incident.get('confidence', 0) * 100)}%</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0;">{incident.get('location_text', 'Unknown')}</td>
            </tr>
            {f'''<tr>
                <td style="padding: 8px 0; font-weight: bold;">Coordinates:</td>
                <td style="padding: 8px 0;">{incident.get('lat', 'N/A')}, {incident.get('lng', 'N/A')}</td>
            </tr>''' if incident.get('lat') and incident.get('lng') else ''}
            {f'''<tr>
                <td style="padding: 8px 0; font-weight: bold;">People Affected:</td>
                <td style="padding: 8px 0;">{incident.get('people_affected', 0)}</td>
            </tr>''' if incident.get('people_affected', 0) > 0 else ''}
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0;">{incident.get('timestamp', 'Unknown')}</td>
            </tr>
        </table>
        
        {f'''<div style="margin-top: 20px;">
            <img src="{incident.get('image_url')}" alt="Incident Image" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; display: block;">
        </div>''' if incident.get('image_url') and not incident.get('image_url', '').startswith('local://') else ''}
        
        <div style="margin-top: 20px; padding: 15px; background-color: white; border-left: 4px solid {urgency_color}; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #1f2937;">Description:</p>
            <p style="margin: 10px 0 0 0; color: #4b5563;">{incident.get('description', 'No description available')}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: {urgency_color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View on Dashboard
            </a>
        </div>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; text-align: center; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;">This is an automated alert from RescueLena AI Disaster Response System</p>
        <p style="margin: 5px 0 0 0;">© 2024 RescueLena. All rights reserved.</p>
    </div>
</body>
</html>
"""
    
    def _generate_email_text(self, incident: Dict[str, Any]) -> str:
        """Generate plain text email content."""
        text = f"""
🚨 RESCUELENA ALERT - {incident.get('urgency', 'UNKNOWN').upper()} PRIORITY

Incident Details:
-----------------
Type: {incident.get('type', 'Unknown').replace('_', ' ').title()}
Urgency: {incident.get('urgency', 'Unknown').upper()}
Confidence: {int(incident.get('confidence', 0) * 100)}%
Location: {incident.get('location_text', 'Unknown')}
"""
        
        if incident.get('lat') and incident.get('lng'):
            text += f"Coordinates: {incident.get('lat')}, {incident.get('lng')}\n"
        
        if incident.get('people_affected', 0) > 0:
            text += f"People Affected: {incident.get('people_affected')}\n"
        
        text += f"Time: {incident.get('timestamp', 'Unknown')}\n"
        text += f"\nDescription:\n{incident.get('description', 'No description available')}\n"
        text += f"\nView on Dashboard: http://localhost:3000/dashboard\n"
        text += f"\n---\nThis is an automated alert from RescueLena AI Disaster Response System\n"
        
        return text

brevo_service = BrevoService()
