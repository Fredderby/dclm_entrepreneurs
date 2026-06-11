import sys
sys.path.append(".")

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, get_db
# ✅ CORRECT IMPORT: import the FUNCTION, not the module
from models import create_dynamic_model
import uuid
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

# ✅ FIX: Call the function correctly — NO MORE "Module is not callable" ERROR
SheetData = create_dynamic_model()

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DCLM Entrepreneurship Database API",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Save endpoint
@app.post("/add-to-sheet/")
def add_to_sheet(data: dict, db: Session = Depends(get_db)):
    try:
        row_id = str(uuid.uuid4())
        synced_at = datetime.utcnow().isoformat()

        entry_data = {
            "row_id": row_id,
            "synced_at": synced_at,
            "region_division_group_name": data.get("region_division_group_name"),
            "enterprise_coordinator_name": data.get("enterprise_coordinator_name"),
            "enterprise_coordinator_contact": data.get("enterprise_coordinator_contact")
        }

        # Unpack entrepreneur object
        entrepreneur = data.get("entrepreneur", {})
        entry_data.update({
            "entrepreneur_full_name": entrepreneur.get("full_name"),
            "entrepreneur_phone_whatsapp": entrepreneur.get("phone_whatsapp"),
            "entrepreneur_business_name_type": entrepreneur.get("business_name_type"),
            "entrepreneur_sector": entrepreneur.get("sector"),
            "entrepreneur_years_in_business": entrepreneur.get("years_in_business"),
            "entrepreneur_can_mentor": entrepreneur.get("can_mentor")
        })

        # Save
        new_entry = SheetData(**entry_data)
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)

        return {"status": "success", "id": new_entry.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))