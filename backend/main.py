from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import json
import hashlib
from datetime import datetime
import os
from dotenv import load_dotenv

from database import engine, get_db, Base
from models import SheetData

load_dotenv()
# Drop and recreate all tables (will use new model structure)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DCLM-Ghana Entrepreneurship Database")

# CORS — allows frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your domain in production
    allow_methods=["*"],
    allow_headers=["*"]
)

# ---------- API ROUTES (must be before static mount) ----------

@app.post("/api/add-to-sheet/")
def add_to_sheet(data: dict, db: Session = Depends(get_db)):
    try:
        # Create unique ID from all submitted data
        row_id = hashlib.md5(json.dumps(data, sort_keys=True, default=str).encode()).hexdigest()

        # Check for duplicate submission
        if db.query(SheetData).filter_by(row_id=row_id).first():
            return {"status": "success", "message": "Already submitted"}

        # ✅ UPDATED: matches new field names exactly
        sheet_data = SheetData(
            row_id=row_id,
            zone=data.get("zone", ""),
            region=data.get("region", ""),
            division=data.get("division", ""),

            # ✅ Renamed from enterprise_coordinator_* → pastor_*
            pastor_name=data.get("pastor_name", ""),
            pastor_contact=data.get("pastor_contact", ""),

            entrepreneur_full_name=data.get("entrepreneur_full_name", ""),
            entrepreneur_phone_whatsapp=data.get("entrepreneur_phone_whatsapp", ""),
            entrepreneur_business_name_type=data.get("entrepreneur_business_name_type", ""),
            # ✅ Added new field
            entrepreneur_business_location=data.get("entrepreneur_business_location", ""),
            entrepreneur_sector=data.get("entrepreneur_sector", ""),
            entrepreneur_years_in_business=data.get("entrepreneur_years_in_business", ""),
            entrepreneur_can_mentor=data.get("entrepreneur_can_mentor", ""),

            synced_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        )

        db.add(sheet_data)
        db.commit()
        return {"status": "success", "message": "Form submitted successfully"}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ---------- Static files (catch-all for frontend) ----------
app.mount("/", StaticFiles(directory="static", html=True), name="static")