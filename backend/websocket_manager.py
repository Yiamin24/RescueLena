import socketio
from typing import Dict, Set
import logging

logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# Track connected clients
connected_clients: Set[str] = set()

@sio.event
async def connect(sid, environ):
    """Handle client connection."""
    logger.info(f"Client connected: {sid}")
    connected_clients.add(sid)
    await sio.emit('connection_established', {'sid': sid}, room=sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    logger.info(f"Client disconnected: {sid}")
    connected_clients.discard(sid)

@sio.event
async def join_room(sid, data):
    """Allow client to join specific rooms."""
    room = data.get('room')
    if room:
        sio.enter_room(sid, room)
        logger.info(f"Client {sid} joined room: {room}")

@sio.event
async def leave_room(sid, data):
    """Allow client to leave specific rooms."""
    room = data.get('room')
    if room:
        sio.leave_room(sid, room)
        logger.info(f"Client {sid} left room: {room}")

async def broadcast_new_incident(incident_data: Dict):
    """Broadcast new incident to all connected clients."""
    try:
        await sio.emit('new_incident', incident_data)
        logger.info(f"Broadcasted new incident: {incident_data.get('id')}")
    except Exception as e:
        logger.error(f"Error broadcasting incident: {e}")

async def broadcast_incident_update(incident_id: str, update_data: Dict):
    """Broadcast incident update to all connected clients."""
    try:
        await sio.emit('incident_updated', {
            'incident_id': incident_id,
            'update': update_data
        })
        logger.info(f"Broadcasted incident update: {incident_id}")
    except Exception as e:
        logger.error(f"Error broadcasting update: {e}")

async def broadcast_incident_deleted(incident_id: str):
    """Broadcast incident deletion to all connected clients."""
    try:
        await sio.emit('incident_deleted', {'incident_id': incident_id})
        logger.info(f"Broadcasted incident deletion: {incident_id}")
    except Exception as e:
        logger.error(f"Error broadcasting deletion: {e}")

def get_connected_clients_count() -> int:
    """Get number of connected clients."""
    return len(connected_clients)
