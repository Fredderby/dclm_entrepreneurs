import sys
sys.path.append(".")

from fastapi import FastAPI, HTTPException
import uuid
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from google_sheets import sheets_service

app = FastAPI(
    title="DCLM API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "API is running", "timestamp": datetime.utcnow().isoformat()}

@app.post("/add-to-sheet/")
def add_to_sheet(data: dict):
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

        sheets_service.add_row(entry_data)

        return {
            "status": "success",
            "row_id": row_id,
            "google_sheets": "saved successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))