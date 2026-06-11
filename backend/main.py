import sys
sys.path.append(".")

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import create_dynamic_model
import uuid
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

# Import Google Sheets save function
from google_sheets import save_to_google_sheet

# Create DB model
SheetData = create_dynamic_model()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DCLM API",
    version="1.0.0"
)

# ✅ CORS fixed — allows frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Health check endpoint
@app.get("/")
def root():
    return {"status": "API is running", "timestamp": datetime.utcnow().isoformat()}

# ✅ Main save endpoint — saves to DB + Google Sheets
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

        entrepreneur = data.get("entrepreneur", {})
        entry_data.update({
            "entrepreneur_full_name": entrepreneur.get("full_name"),
            "entrepreneur_phone_whatsapp": entrepreneur.get("phone_whatsapp"),
            "entrepreneur_business_name_type": entrepreneur.get("business_name_type"),
            "entrepreneur_sector": entrepreneur.get("sector"),
            "entrepreneur_years_in_business": entrepreneur.get("years_in_business"),
            "entrepreneur_can_mentor": entrepreneur.get("can_mentor")
        })

        # 1. Save to Database
        new_entry = SheetData(**entry_data)
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)

        # 2. Save to Google Sheets
        sheet_status = "success"
        try:
            save_to_google_sheet(entry_data)
        except Exception as e:
            sheet_status = f"warning: sheet failed - {str(e)}"

        return {
            "status": "success",
            "db_id": new_entry.id,
            "google_sheets": sheet_status
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))