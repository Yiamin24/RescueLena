from fastapi import APIRouter, UploadFile, File, HTTPException
from services.gemini_service import gemini_service
from services.qdrant_service import qdrant_service
from services.firestore_service import firestore_service
from services.storage_service import storage_service
from services.brevo_service import brevo_service
from utils.format_utils import determine_urgency, format_incident_response
import tempfile
import os
import PyPDF2
import docx

router = APIRouter()

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    try:
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error extracting TXT text: {e}")
        return ""

@router.post("/analyze/document")
async def analyze_document(file: UploadFile = File(...)):
    """Analyze disaster report document (PDF, DOCX, TXT)."""
    try:
        # Check file type
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in ['pdf', 'docx', 'doc', 'txt']:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF, DOCX, or TXT files.")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        # Extract text based on file type
        if file_extension == 'pdf':
            extracted_text = extract_text_from_pdf(tmp_path)
        elif file_extension in ['docx', 'doc']:
            extracted_text = extract_text_from_docx(tmp_path)
        else:  # txt
            extracted_text = extract_text_from_txt(tmp_path)
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Could not extract meaningful text from document.")
        
        # Analyze text with Gemini
        analysis = await gemini_service.analyze_text(extracted_text)
        
        # Upload document to storage (optional - for record keeping)
        try:
            doc_url = await storage_service.upload_image(tmp_path)  # Reuse image upload for documents
        except:
            doc_url = None
        
        # Generate embedding
        embedding_text = f"{analysis['type']} {analysis['description']}"
        embedding = await gemini_service.generate_embedding(embedding_text)
        
        # Determine urgency
        urgency = determine_urgency(
            analysis['confidence'],
            analysis['type'],
            analysis.get('people_affected', 0)
        )
        
        # Use default Dubai coordinates if no location found
        import random
        lat = 25.2048 + random.uniform(-0.1, 0.1)
        lng = 55.2708 + random.uniform(-0.1, 0.1)
        location_name = analysis.get('location_text') or f"Document Report ({lat:.4f}, {lng:.4f})"
        
        # Prepare incident data
        incident_data = {
            "type": analysis['type'],
            "lat": lat,
            "lng": lng,
            "latitude": lat,
            "longitude": lng,
            "confidence": analysis['confidence'],
            "urgency": urgency,
            "description": analysis['description'],
            "people_affected": analysis.get('people_affected', 0),
            "location": location_name,
            "location_text": location_name,
            "image_url": doc_url,  # Store document URL
            "source": "document",
            "document_name": file.filename
        }
        
        # Store in Firestore
        incident_id = await firestore_service.store_incident(incident_data)
        
        # Store embedding in Qdrant
        await qdrant_service.store_embedding(incident_id, embedding, incident_data)
        
        # Cleanup
        os.unlink(tmp_path)
        
        # Return formatted response
        incident_data['id'] = incident_id
        response = format_incident_response(incident_data)
        
        # Send email alert for high-urgency incidents
        if urgency == "high":
            alert_emails = os.getenv("ALERT_EMAILS", "").split(",")
            alert_emails = [email.strip() for email in alert_emails if email.strip()]
            if alert_emails:
                await brevo_service.send_incident_alert(response, alert_emails)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in document analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
