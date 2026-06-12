from sqlalchemy import Column, Integer, String, Text
from database import Base

class SheetData(Base):
    __tablename__ = "sheet_data"

    id = Column(Integer, primary_key=True, index=True)
    row_id = Column(String(255), unique=True, index=True)
    region_division_group_name = Column(String(255))
    enterprise_coordinator_name = Column(String(255))
    enterprise_coordinator_contact = Column(String(50))
    entrepreneur_full_name = Column(String(255))
    entrepreneur_phone_whatsapp = Column(String(50))
    entrepreneur_business_name_type = Column(String(255))
    entrepreneur_sector = Column(String(100))
    entrepreneur_years_in_business = Column(String(50))
    entrepreneur_can_mentor = Column(String(10))
    extra_data = Column(Text, nullable=True)
    synced_at = Column(String(50), nullable=True)
