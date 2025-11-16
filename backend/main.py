from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import image_routes, text_routes, dashboard_routes, query_routes, chat_routes, document_routes, status_routes, batch_routes, verification_routes, social_routes, satellite_routes
import socketio
from websocket_manager import sio
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RescueLena API",
    description="AI-powered disaster response assistant",
    version="1.0.0"
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# Include routers
app.include_router(status_routes.router, tags=["Status Management"])
app.include_router(batch_routes.router, tags=["Batch Processing"])
app.include_router(verification_routes.router, tags=["Verification"])
app.include_router(social_routes.router, tags=["Social Media"])
app.include_router(satellite_routes.router, tags=["Satellite Imagery"])
app.include_router(image_routes.router, tags=["Image Analysis"])
app.include_router(text_routes.router, tags=["Text Analysis"])
app.include_router(document_routes.router, tags=["Document Analysis"])
app.include_router(dashboard_routes.router, tags=["Dashboard"])
app.include_router(query_routes.router, tags=["Query"])
app.include_router(chat_routes.router, tags=["Chat"])

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RescueLena API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    # Run with Socket.IO support
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
