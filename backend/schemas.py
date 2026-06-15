from pydantic import BaseModel
from typing import Optional

# ✅ UPDATED: matches new field names from App.js + models.py
class SubmissionCreate(BaseModel):
    row_id: Optional[str] = None
    synced_at: Optional[str] = None
    zone: Optional[str] = None           # added — matches form state
    region: Optional[str] = None         # added — matches form state
    division: Optional[str] = None       # added — matches form state

    # ✅ Renamed from enterprise_coordinator_* → pastor_*
    pastor_name: Optional[str] = None
    pastor_contact: Optional[str] = None

    entrepreneur_full_name: Optional[str] = None
    entrepreneur_phone_whatsapp: Optional[str] = None
    entrepreneur_business_name_type: Optional[str] = None
    # ✅ Added new field
    entrepreneur_business_location: Optional[str] = None
    entrepreneur_sector: Optional[str] = None
    entrepreneur_years_in_business: Optional[str] = None
    entrepreneur_can_mentor: Optional[str] = None

    class Config:
        orm_mode = True