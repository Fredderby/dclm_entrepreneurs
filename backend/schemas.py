from pydantic import BaseModel
from typing import Optional, Dict

class SheetDataBase(BaseModel):
    extra_data: Optional[Dict] = None
    synced_at: Optional[str] = None
    class Config:
        from_attributes = True
        extra = "allow"

class SheetDataResponse(SheetDataBase):
    id: int
    row_id: Optional[str] = None