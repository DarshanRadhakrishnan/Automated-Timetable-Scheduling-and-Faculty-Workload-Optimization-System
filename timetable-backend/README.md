# Timetable Scheduling and Faculty Workload Optimization System - Backend

A FastAPI-based backend service for automated timetable generation and faculty workload management.

## Project Structure

```
timetable-backend/
├── app/
│   ├── main.py                 # FastAPI entry point
│   ├── database.py             # DB connection
│   ├── models/                 # STEP 1: Data Models
│   │   ├── __init__.py
│   │   ├── faculty.py
│   │   ├── course.py
│   │   ├── section.py
│   │   ├── room.py
│   │   ├── timeslot.py
│   │   ├── availability.py
│   │   └── timetable.py
│   ├── schemas/                # Pydantic schemas
│   │   └── timetable.py
│   ├── services/               # STEP 3: Logic
│   │   └── generator.py
│   └── routers/                # APIs
│       └── timetable.py
├── requirements.txt
└── README.md
```

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Features

- **Faculty Management**: Store and manage faculty information
- **Course Management**: Define courses with credits and hours
- **Room Management**: Track classroom availability and capacity
- **TimeSlot Management**: Define available time slots
- **Timetable Generation**: Automatic timetable scheduling
- **Workload Optimization**: Optimize faculty workload distribution

## Development

### Database Setup

The application uses SQLite by default. To use a different database, set the `DATABASE_URL` environment variable:

```bash
# For PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/timetable_db

# For MySQL
DATABASE_URL=mysql+pymysql://user:password@localhost/timetable_db
```

### API Endpoints

- `GET /` - Health check
- `GET /api/v1/timetable/` - Get all timetable entries
- `POST /api/v1/timetable/generate` - Generate timetable
- `GET /api/v1/timetable/{id}` - Get specific timetable entry

## Contributing

1. Create a new branch for your feature
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT License
