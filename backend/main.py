from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
import json
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Optional
from collections import Counter
import pathlib

from database import engine, get_db, Base
from models import SheetData
from config import settings

load_dotenv = None
try:
    from dotenv import load_dotenv as _ld
    _ld()
except Exception:
    pass

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DCLM-Ghana Entrepreneurship Database")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/api/add-to-sheet/")
def add_to_sheet(data: dict, db: Session = Depends(get_db)):
    try:
        row_id = hashlib.md5(json.dumps(data, sort_keys=True, default=str).encode()).hexdigest()

        if db.query(SheetData).filter_by(row_id=row_id).first():
            return {"status": "success", "message": "Already submitted"}

        sheet_data = SheetData(
            row_id=row_id,
            zone=data.get("zone", ""),
            region=data.get("region", ""),
            division=data.get("division", ""),
            pastor_name=data.get("pastor_name", ""),
            pastor_contact=data.get("pastor_contact", ""),
            entrepreneur_full_name=data.get("entrepreneur_full_name", ""),
            entrepreneur_phone_whatsapp=data.get("entrepreneur_phone_whatsapp", ""),
            entrepreneur_business_name=data.get("entrepreneur_business_name", ""),
            entrepreneur_business_type=data.get("entrepreneur_business_type", ""),
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


@app.post("/api/admin/login")
def admin_login(data: dict):
    username = data.get("username", "")
    password = data.get("password", "")
    if username != settings.ADMIN_USERNAME or password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {"sub": username, "exp": datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    return {"token": token, "username": username}


@app.get("/api/admin/submissions")
def get_submissions(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
    sort_by: str = "id",
    sort_dir: str = "desc",
    search: str = "",
    page: int = 1,
    per_page: int = 50,
):
    verify_token(authorization)

    query = db.query(SheetData)

    if search:
        like = f"%{search}%"
        query = query.filter(
            SheetData.entrepreneur_full_name.ilike(like)
            | SheetData.entrepreneur_business_name.ilike(like)
            | SheetData.entrepreneur_business_type.ilike(like)
            | SheetData.zone.ilike(like)
            | SheetData.region.ilike(like)
            | SheetData.division.ilike(like)
            | SheetData.pastor_name.ilike(like)
            | SheetData.entrepreneur_business_location.ilike(like)
        )

    total = query.count()

    sort_col = getattr(SheetData, sort_by, SheetData.id)
    if sort_dir == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
        "data": [
            {
                "id": r.id,
                "zone": r.zone,
                "region": r.region,
                "division": r.division,
                "pastor_name": r.pastor_name,
                "pastor_contact": r.pastor_contact,
                "entrepreneur_full_name": r.entrepreneur_full_name,
                "entrepreneur_phone_whatsapp": r.entrepreneur_phone_whatsapp,
                "entrepreneur_business_name": r.entrepreneur_business_name,
                "entrepreneur_business_type": r.entrepreneur_business_type,
                "entrepreneur_business_location": r.entrepreneur_business_location,
                "entrepreneur_sector": r.entrepreneur_sector,
                "entrepreneur_years_in_business": r.entrepreneur_years_in_business,
                "entrepreneur_can_mentor": r.entrepreneur_can_mentor,
                "synced_at": r.synced_at,
            }
            for r in items
        ],
    }


@app.delete("/api/admin/submissions/{submission_id}")
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    verify_token(authorization)
    record = db.query(SheetData).filter(SheetData.id == submission_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Submission not found")
    db.delete(record)
    db.commit()
    return {"status": "success", "message": "Deleted"}


@app.get("/api/admin/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    verify_token(authorization)

    total = db.query(SheetData).count()

    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    today = db.query(SheetData).filter(
        SheetData.synced_at.like(f"{today_str}%")
    ).count()

    month_str = datetime.utcnow().strftime("%Y-%m")
    this_month = db.query(SheetData).filter(
        SheetData.synced_at.like(f"{month_str}%")
    ).count()

    year_str = datetime.utcnow().strftime("%Y")
    this_year = db.query(SheetData).filter(
        SheetData.synced_at.like(f"{year_str}%")
    ).count()

    all_records = db.query(SheetData).all()

    by_type = Counter(r.entrepreneur_business_type or "Unknown" for r in all_records)
    by_sector = Counter(r.entrepreneur_sector or "Unknown" for r in all_records)
    by_zone = Counter(r.zone or "Unknown" for r in all_records)
    by_division = Counter(r.division or "Unknown" for r in all_records)
    by_mentor = Counter(r.entrepreneur_can_mentor or "Unknown" for r in all_records)
    by_years = Counter(r.entrepreneur_years_in_business or "Unknown" for r in all_records)
    by_region = Counter(r.region or "Unknown" for r in all_records)

    daily_counts = Counter()
    for r in all_records:
        if isinstance(r.synced_at, str) and len(r.synced_at) >= 10:
            daily_counts[r.synced_at[:10]] += 1

    last_30 = []
    for i in range(29, -1, -1):
        d = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        last_30.append({"date": d, "count": daily_counts.get(d, 0)})

    return {
        "total": total,
        "today": today,
        "this_month": this_month,
        "this_year": this_year,
        "by_type": dict(by_type.most_common()),
        "by_sector": dict(by_sector.most_common()),
        "by_zone": dict(by_zone.most_common()),
        "by_division": dict(by_division.most_common()),
        "by_region": dict(by_region.most_common()),
        "by_mentor": dict(by_mentor.most_common()),
        "by_years": dict(by_years.most_common()),
        "daily_trend": last_30,
    }


_static = pathlib.Path("static")
if _static.is_dir() and any(_static.iterdir()):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
