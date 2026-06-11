from sqlalchemy import Column, Integer, String, Text, DateTime
from .database import Base

def create_dynamic_model(headers):
    # SheetData model for MySQL
class SheetData(Base):
        __tablename__ = "sheet_data"

        id = Column(Integer, primary_key=True, index=True)
        
        # ✅ FIX: ALL STRINGS HAVE LENGTH = 255 (MySQL REQUIRES THIS)
        row_id = Column(String(255), unique=True, index=True, nullable=False)
        synced_at = Column(String(255), nullable=False)
        extra_data = Column(Text, nullable=True)

        # Dynamic columns — ✅ ADD LENGTH 255
        for header in headers:
            safe_name = header.strip().replace(" ", "_").lower()
            locals()[safe_name] = Column(String(255), nullable=True)

    return SheetData