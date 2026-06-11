from sqlalchemy import Column, Integer, String, Text
from database import Base

# ✅ ONLY REDUCED FIELDS — NO EXTRA COLUMNS
class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    row_id = Column(String(255), unique=True, index=True, nullable=False)
    synced_at = Column(String(255), nullable=False)
    region_division_group_name = Column(String(255))
    enterprise_coordinator_name = Column(String(255))
    enterprise_coordinator_contact = Column(String(255))
    entrepreneur_full_name = Column(String(255))
    entrepreneur_phone_whatsapp = Column(String(255))
    entrepreneur_business_name_type = Column(String(255))
    entrepreneur_sector = Column(String(255))
    entrepreneur_years_in_business = Column(String(255))
    entrepreneur_can_mentor = Column(String(255))
    extra_data = Column(Text)  # optional, if you want to store anything extra