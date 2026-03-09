from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.conflict_detector import detect_conflicts

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/detect")
def detect(db: Session = Depends(get_db)):
    return detect_conflicts(db)
