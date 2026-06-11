from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import hashlib
from datetime import datetime
import os
from dotenv import load_dotenv

from database import engine, get_db, Base
from models import Entrepreneur, SheetData
from schemas import SheetDataResponse

# --------------------------
# INITIALIZE
# --------------------------
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DCLM-Ghana Entrepreneurship Database")

# --------------------------
# CORS
# --------------------------
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# ENDPOINTS
# --------------------------
@app.get("/")
def root():
    return {"status": "Backend Running", "time": datetime.utcnow().isoformat()}

@app.get("/data/", response_model=List[SheetDataResponse])
def get_all_data(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return db.query(SheetData).order_by(SheetData.id.desc()).offset(skip).limit(limit).all()

@app.post("/add-to-sheet/")
def add_to_sheet(data: dict, db: Session = Depends(get_db)):
    try:
        # Build flat dict from frontend form data
        ent = data.get("entrepreneur", {})
        row_id = hashlib.md5(json.dumps(data, sort_keys=True, default=str).encode()).hexdigest()

        # Check if already exists
        if db.query(SheetData).filter_by(row_id=row_id).first():
            return {"status": "success", "message": "Already submitted"}

        sheet_data = SheetData(
            row_id=row_id,
            region_division_group_name=data.get("region_division_group_name", ""),
            enterprise_coordinator_name=data.get("enterprise_coordinator_name", ""),
            enterprise_coordinator_contact=data.get("enterprise_coordinator_contact", ""),
            entrepreneur_full_name=ent.get("full_name", ""),
            entrepreneur_phone_whatsapp=ent.get("phone_whatsapp", ""),
            entrepreneur_business_name_type=ent.get("business_name_type", ""),
            entrepreneur_sector=ent.get("sector", ""),
            entrepreneur_years_in_business=ent.get("years_in_business", ""),
            entrepreneur_can_mentor=ent.get("can_mentor", ""),
            synced_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        )

        db.add(sheet_data)
        db.commit()

        return {"status": "success", "message": "Form submitted successfully"}
    except Exception as e:
        print(f"Error in /add-to-sheet/: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
