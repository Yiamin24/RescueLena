"""
Clear all incidents from Firestore and Qdrant databases
Run this to remove all existing data

Usage:
    python clear_database.py
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from services.firestore_service import firestore_service
from services.qdrant_service import qdrant_service

async def clear_all_data():
    """Clear all incidents from both databases."""
    print("🗑️  Clearing all data from RescueLena databases...")
    print("=" * 60)
    
    try:
        # Get all incidents from Firestore
        print("\n📊 Fetching all incidents from Firestore...")
        incidents = await firestore_service.get_all_incidents(limit=1000)
        total_count = len(incidents)
        print(f"   Found {total_count} incidents")
        
        if total_count == 0:
            print("\n✅ Database is already empty!")
            # Still clear Qdrant just in case
            print("\n🔍 Clearing Qdrant vector database...")
            await qdrant_service.clear_collection()
            print(f"   ✅ Qdrant collection cleared")
            return
        
        # Confirm deletion
        print(f"\n⚠️  WARNING: This will delete all {total_count} incidents!")
        response = input("Are you sure you want to continue? (yes/no): ")
        
        if response.lower() != 'yes':
            print("\n❌ Operation cancelled")
            return
        
        # Delete from Firestore (active incidents)
        print(f"\n🔥 Deleting incidents from Firestore...")
        deleted_count = await firestore_service.clear_all_incidents()
        print(f"   ✅ Deleted {deleted_count} active incidents from Firestore")
        
        # Delete archived incidents
        print(f"\n🗄️  Deleting archived incidents...")
        try:
            archived_collection = firestore_service.db.collection('archived_incidents')
            archived_docs = archived_collection.stream()
            archived_count = 0
            for doc in archived_docs:
                doc.reference.delete()
                archived_count += 1
            print(f"   ✅ Deleted {archived_count} archived incidents")
        except Exception as e:
            print(f"   ⚠️  Error clearing archived incidents: {e}")
        
        # Clear Qdrant collection
        print(f"\n🔍 Clearing Qdrant vector database...")
        success = await qdrant_service.clear_collection()
        if success:
            print(f"   ✅ Qdrant collection cleared")
        else:
            print(f"   ⚠️  Qdrant collection may not be fully cleared")
        
        print("\n" + "=" * 60)
        print(f"✅ Successfully deleted {deleted_count} incidents!")
        print("🎉 Database is now completely clean!")
        print("\n📝 Note: All mock/demo data has been removed.")
        print("   Upload real disaster images to populate the system.")
        
    except Exception as e:
        print(f"\n❌ Error clearing database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(clear_all_data())
