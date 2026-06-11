from sqlalchemy import Column, Integer, String, Text
from database import Base

def create_dynamic_model(headers=None):
    attrs = {
        "__tablename__": "sheet_data",
        "id": Column(Integer, primary_key=True, index=True),
        "row_id": Column(String, unique=True, index=True),
        "synced_at": Column(String, nullable=True),
        "extra_data": Column(Text, nullable=True),

        # SECTION A
        "region_division_group_name": Column(String),
        "enterprise_coordinator_name": Column(String),
        "enterprise_coordinator_contact": Column(String),

        # SINGLE ENTREPRENEUR FIELDS
        "entrepreneur_full_name": Column(String),
        "entrepreneur_phone_whatsapp": Column(String),
        "entrepreneur_business_name_type": Column(String),
        "entrepreneur_sector": Column(String),
        "entrepreneur_years_in_business": Column(String),
        "entrepreneur_can_mentor": Column(String)
    }

    return type("SheetData", (Base,), attrs)