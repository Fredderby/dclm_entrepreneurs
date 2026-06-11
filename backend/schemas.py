from pydantic import BaseModel
from typing import Optional

class SheetDataBase(BaseModel):
    extra_data: Optional[str] = None
    synced_at: Optional[str] = None
    class Config:
        from_attributes = True

class SheetDataResponse(SheetDataBase):
    id: int
    row_id: Optional[str] = None
    region_division_group_name: Optional[str] = None
    enterprise_coordinator_name: Optional[str] = None
    enterprise_coordinator_contact: Optional[str] = None
    entrepreneur_full_name: Optional[str] = None
    entrepreneur_phone_whatsapp: Optional[str] = None
    entrepreneur_business_name_type: Optional[str] = None
    entrepreneur_sector: Optional[str] = None
    entrepreneur_years_in_business: Optional[str] = None
    entrepreneur_can_mentor: Optional[str] = None
