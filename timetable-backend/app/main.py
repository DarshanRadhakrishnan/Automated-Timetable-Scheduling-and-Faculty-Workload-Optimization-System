from fastapi import FastAPI
from app.database import Base, engine
from app.routers import timetable

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Academic Timetable Generator")

app.include_router(timetable.router, prefix="/timetable")
