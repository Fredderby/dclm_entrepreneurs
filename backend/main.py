from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import hashlib
import json

from database import engine, get_db, Base
from models import Submission
from schemas import SubmissionCreate
from config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DCLM Database")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ HEALTH CHECK
@app.get("/")
def health_check():
    return {"status": "online", "database": "mysql", "timestamp": datetime.utcnow()}

# ✅ SUBMIT ENDPOINT — ONLY REDUCED FIELDS
@app.post("/api/add-to-db/")
def add_submission(data: SubmissionCreate, db: Session = Depends(get_db)):
    try:
        # Generate unique row_id
        raw = json.dumps(data.dict(), sort_keys=True)
        row_id = hashlib.md5(raw.encode()).hexdigest()

        # Check duplicate
        exists = db.query(Submission).filter(Submission.row_id == row_id).first()
        if exists:
            raise HTTPException(status_code=409, detail="This record already exists")

        # Prepare data
        db_data = Submission(
            row_id=row_id,
            synced_at=datetime.utcnow().isoformat(),
            region_division_group_name=data.region_division_group_name,
            enterprise_coordinator_name=data.enterprise_coordinator_name,
            enterprise_coordinator_contact=data.enterprise_coordinator_contact,
            entrepreneur_full_name=data.entrepreneur_full_name,
            entrepreneur_phone_whatsapp=data.entrepreneur_phone_whatsapp,
            entrepreneur_business_name_type=data.entrepreneur_business_name_type,
            entrepreneur_sector=data.entrepreneur_sector,
            entrepreneur_years_in_business=data.entrepreneur_years_in_business,
            entrepreneur_can_mentor=data.entrepreneur_can_mentor
        )

        # Save to MySQL
        db.add(db_data)
        db.commit()
        db.refresh(db_data)

        return {"status": "success", "message": "Saved to MySQL", "id": db_data.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")