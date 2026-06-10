from sqlalchemy import Column, Integer, String, Text
from database import Base

def create_dynamic_model(headers):
    attrs = {
        "__tablename__": "sheet_data",
        "id": Column(Integer, primary_key=True, index=True),
        "row_id": Column(String, unique=True, index=True),
        "synced_at": Column(String, nullable=True),
        "extra_data": Column(Text, nullable=True),

        # Settings
        "num_entrepreneurs": Column(String),
        "num_professionals": Column(String),

        # SECTION A
        "region_division_group_name": Column(String),
        "enterprise_coordinator_name": Column(String),
        "enterprise_coordinator_contact": Column(String),

        # SECTION D
        "investment_opportunities": Column(Text),

        # SECTION E
        "diaspora_name": Column(String),
        "diaspora_country": Column(String),
        "diaspora_skill_interest": Column(String)
    }

    # Support up to 10 dynamic entries
    for i in range(1, 11):
        attrs[f"entrepreneur_{i}_full_name"] = Column(String)
        attrs[f"entrepreneur_{i}_phone_whatsapp"] = Column(String)
        attrs[f"entrepreneur_{i}_business_name_type"] = Column(String)
        attrs[f"entrepreneur_{i}_sector"] = Column(String)
        attrs[f"entrepreneur_{i}_years_in_business"] = Column(String)
        attrs[f"entrepreneur_{i}_can_mentor"] = Column(String)

        attrs[f"professional_{i}_full_name"] = Column(String)
        attrs[f"professional_{i}_skill_profession"] = Column(String)
        attrs[f"professional_{i}_willing_to_train"] = Column(String)

    return type("SheetData", (Base,), attrs)