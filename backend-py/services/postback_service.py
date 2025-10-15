import logging
from typing import Dict, Any, Optional
from datetime import datetime
from utils.mongo_client import get_collection, MongoUnavailable
from models.postback import PostBackRecord, PostBackCreate

logger = logging.getLogger(__name__)


class PostBackService:
    """Service for managing postback records in MongoDB"""
    
    def __init__(self):
        self.collection_name = "postback"
    
    def _get_collection(self):
        """Get the postback collection from MongoDB"""
        try:
            return get_collection(self.collection_name)
        except MongoUnavailable as e:
            logger.error(f"MongoDB not available: {e}")
            raise
    
    def save_postback(self, postback_data: PostBackCreate) -> Dict[str, Any]:
        """
        Save a postback record to MongoDB
        
        Args:
            postback_data: PostBackCreate schema with generation data
            
        Returns:
            Dict with success status, message, and mongo_id
        """
        try:
            collection = self._get_collection()
            
            # Create the record model
            record = PostBackRecord(
                campaign_id=postback_data.campaign_id,
                render_id=postback_data.render_id,
                cloudinary_url=postback_data.cloudinary_url,
                background_url=postback_data.background_url,
                composite_url=postback_data.composite_url,
                size=postback_data.size,
                prompt=postback_data.prompt,
                model=postback_data.model,
                seed=postback_data.seed,
                event_name=postback_data.event_name,
                event_date=postback_data.event_date,
                mood=postback_data.mood,
                palette=postback_data.palette,
                artists=postback_data.artists,
                metadata=postback_data.metadata or {},
                created_at=datetime.utcnow()
            )
            
            # Convert to dict for MongoDB
            record_dict = record.model_dump()
            
            # Insert into MongoDB
            result = collection.insert_one(record_dict)
            
            logger.info(f"Saved postback record: {result.inserted_id} for campaign {postback_data.campaign_id}")
            
            return {
                "success": True,
                "message": "Postback record saved successfully",
                "mongo_id": str(result.inserted_id),
                "postback": record
            }
            
        except MongoUnavailable as e:
            logger.error(f"MongoDB unavailable: {e}")
            return {
                "success": False,
                "message": f"MongoDB unavailable: {str(e)}",
                "mongo_id": None,
                "postback": None
            }
        except Exception as e:
            logger.error(f"Error saving postback: {e}", exc_info=True)
            return {
                "success": False,
                "message": f"Error saving postback: {str(e)}",
                "mongo_id": None,
                "postback": None
            }
    
    def get_postbacks_by_campaign(self, campaign_id: str) -> list:
        """Get all postback records for a campaign"""
        try:
            collection = self._get_collection()
            records = list(collection.find({"campaign_id": campaign_id}))
            
            # Convert ObjectId to string
            for record in records:
                record["_id"] = str(record["_id"])
            
            return records
        except Exception as e:
            logger.error(f"Error retrieving postbacks: {e}")
            return []
    
    def get_postback_by_render_id(self, render_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific postback record by render_id"""
        try:
            collection = self._get_collection()
            record = collection.find_one({"render_id": render_id})
            
            if record:
                record["_id"] = str(record["_id"])
            
            return record
        except Exception as e:
            logger.error(f"Error retrieving postback: {e}")
            return None


# Global instance
postback_service = PostBackService()
