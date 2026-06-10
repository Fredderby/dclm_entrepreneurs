from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import hashlib
from datetime import datetime
import os
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

from database import engine, get_db, Base
from google_sheets import get_sheet_data
from models import create_dynamic_model
from schemas import SheetDataResponse

# --------------------------
# INITIALIZE
# --------------------------
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

# Defer Google Sheets connection - will be set by /sync-sheets/ or first request
SheetData = None

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
    if not SheetData:
        raise HTTPException(status_code=503, detail="Database model not initialized (Google Sheets connection failed)")
    return db.query(SheetData).order_by(SheetData.id.desc()).offset(skip).limit(limit).all()

@app.post("/sync-sheets/")
def sync_sheets_to_db(db: Session = Depends(get_db)):
    if not SheetData:
        raise HTTPException(status_code=503, detail="Database model not initialized")
    try:
        sheet_data, headers = get_sheet_data()
        added = 0
        for row in sheet_data:
            row_str = json.dumps(row, sort_keys=True, default=str)
            row_id = hashlib.md5(row_str.encode()).hexdigest()
            if db.query(SheetData).filter_by(row_id=row_id).first():
                continue
            db_fields: dict[str, str] = {"row_id": row_id}
            extra_fields: dict[str, str] = {}
            for key, value in row.items():
                safe_key = key.strip().replace(" ", "_").lower()
                safe_value = str(value) if value is not None else ""
                if hasattr(SheetData, safe_key):
                    db_fields[safe_key] = safe_value
                else:
                    extra_fields[key] = safe_value
            db_fields["extra_data"] = json.dumps(extra_fields) if extra_fields else "{}"
            db_fields["synced_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            db.add(SheetData(**db_fields))
            added += 1
        db.commit()
        return {"status": "success", "new_rows_added": added}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@app.post("/add-to-sheet/")
def add_to_sheet(data: dict, db: Session = Depends(get_db)):
    try:
        SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

        SHEET_ID = os.getenv("GOOGLE_SHEET_ID") or "1fzbttlAvu0aMAHDpx3XyZ9VMy4VrV1rS-gxBx5C814A"
        if not SHEET_ID:
            raise ValueError("GOOGLE_SHEET_ID not set in .env")

        private_key = os.getenv("PRIVATE_KEY", "")
        if not private_key:
            raise ValueError("GOOGLE_PRIVATE_KEY not set in .env")
        private_key = private_key.replace('"', '').replace("'", "").replace("\\n", "\n").strip()

        creds = Credentials.from_service_account_info({
            "type": "service_account",
            "project_id": os.getenv("PROJECT_ID", ""),
            "private_key_id": os.getenv("PRIVATE_KEY_ID", ""),
            "private_key": private_key,
            "client_email": os.getenv("CLIENT_EMAIL", ""),
            "client_id": os.getenv("CLIENT_ID", ""),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": os.getenv("CLIENT_X509_CERT_URL", "")
        }, scopes=SCOPES)

        gc = gspread.authorize(creds)
        sheet = gc.open_by_key(SHEET_ID).sheet1

        # Flatten dynamic arrays into numbered fields
        flat = {
            "num_entrepreneurs": str(data.get("num_entrepreneurs", 0)),
            "num_professionals": str(data.get("num_professionals", 0)),
            "region_division_group_name": data.get("region_division_group_name", ""),
            "enterprise_coordinator_name": data.get("enterprise_coordinator_name", ""),
            "enterprise_coordinator_contact": data.get("enterprise_coordinator_contact", ""),
            "investment_opportunities": data.get("investment_opportunities", ""),
            "diaspora_name": data.get("diaspora_name", ""),
            "diaspora_country": data.get("diaspora_country", ""),
            "diaspora_skill_interest": data.get("diaspora_skill_interest", "")
        }

        # Flatten entrepreneurs
        ents = data.get("entrepreneurs", [])
        for i, ent in enumerate(ents, 1):
            flat[f"entrepreneur_{i}_full_name"] = ent.get("full_name", "")
            flat[f"entrepreneur_{i}_phone_whatsapp"] = ent.get("phone_whatsapp", "")
            flat[f"entrepreneur_{i}_business_name_type"] = ent.get("business_name_type", "")
            flat[f"entrepreneur_{i}_sector"] = ent.get("sector", "")
            flat[f"entrepreneur_{i}_years_in_business"] = ent.get("years_in_business", "")
            flat[f"entrepreneur_{i}_can_mentor"] = ent.get("can_mentor", "")

        # Flatten professionals
        pros = data.get("professionals", [])
        for i, pro in enumerate(pros, 1):
            flat[f"professional_{i}_full_name"] = pro.get("full_name", "")
            flat[f"professional_{i}_skill_profession"] = pro.get("skill_profession", "")
            flat[f"professional_{i}_willing_to_train"] = pro.get("willing_to_train", "")

        # Write to sheet
        headers = sheet.row_values(1)
        if not headers or headers == []:
            headers = list(flat.keys())
            sheet.append_row(headers)

        row_values = []
        for h in headers:
            key = h.strip().replace(" ", "_").lower()
            row_values.append(str(flat.get(key, "")))
        sheet.append_row(row_values)

        # Save to DB only if model exists
        if SheetData:
            row_id = hashlib.md5(json.dumps(data, sort_keys=True, default=str).encode()).hexdigest()
            if not db.query(SheetData).filter_by(row_id=row_id).first():
                db_fields: dict[str, str] = {
                    "row_id": row_id,
                    "extra_data": "{}",
                    "synced_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                }
                for key, value in flat.items():
                    safe_key = key.strip().replace(" ", "_").lower()
                    safe_value = str(value) if value is not None else ""
                    if hasattr(SheetData, safe_key):
                        db_fields[safe_key] = safe_value
                db.add(SheetData(**db_fields))
                db.commit()

        return {"status": "success", "message": "Form submitted successfully"}
    except Exception as e:
        print(f"Error in /add-to-sheet/: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
