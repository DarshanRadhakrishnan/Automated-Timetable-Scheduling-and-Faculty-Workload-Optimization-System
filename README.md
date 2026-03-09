# Automated Timetable Scheduling System - Complete Guide

## 🎯 Project Overview

This is a complete **MERN-based Automated Timetable Scheduling and Faculty Workload Optimization System** that automatically generates conflict-free timetables based on constraints like faculty availability, room capacity, and course requirements.

## 📁 Project Structure

```
Automated-Timetable-Scheduling-and-Faculty-Workload-Optimization-System/
├── timetable-backend-mern/     # Node.js + Express + MongoDB Backend
│   ├── config/                 # Database configuration
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic (timetable generator)
│   ├── index.js                # Main server entry point
│   ├── seed.js                 # Database seeding script
│   └── package.json
├── timetable-frontend/         # HTML/CSS/JS Frontend
│   └── index.html              # Interactive UI
└── README.md                   # This file
```

## ✅ Completion Status

### Backend ✅ COMPLETE
- ✅ Express server setup
- ✅ MongoDB connection
- ✅ All models (Faculty, Course, Room, Section, TimeSlot, FacultyAvailability, Timetable)
- ✅ All CRUD routes
- ✅ Timetable generation algorithm
- ✅ Conflict detection
- ✅ **Automatic conflict resolution**
- ✅ **Advanced simulation and analysis features**
- ✅ Database seeding script with realistic data

### Frontend ✅ COMPLETE
- ✅ Interactive HTML interface
- ✅ View all data (faculties, courses, rooms, sections, timeslots)
- ✅ Generate timetable
- ✅ View generated timetable
- ✅ Detect conflicts
- ✅ **Resolve conflicts automatically**
- ✅ **Faculty Impact Analysis with selection interface**
- ✅ **Room Shortage Analysis with alternative suggestions**
- ✅ **Simulation History tracking**
- ✅ **Scenario Comparison tool**
- ✅ **Bulk Faculty Analysis**
- ✅ Clear timetable
- ✅ Real-time statistics

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)

### Step 1: Install MongoDB

#### Windows:
1. Download MongoDB Community Server from the link above
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Service (check the box)
5. MongoDB will start automatically

To verify MongoDB is running:
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# Or connect to MongoDB
mongosh
```

#### Alternative: Use MongoDB Atlas (Cloud)
If you don't want to install MongoDB locally:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `.env` file with your Atlas connection string

### Step 2: Install Backend Dependencies

```bash
cd timetable-backend-mern
npm install
```

### Step 3: Configure Environment Variables

The `.env` file is already configured for local MongoDB:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timetable_db
NODE_ENV=development
```

If using MongoDB Atlas, update `MONGODB_URI` with your connection string.

### Step 4: Seed the Database

```bash
npm run seed
```

This will create sample data:
- 3 Faculties
- 5 Courses (3 theory, 2 lab)
- 4 Rooms (2 theory, 2 lab)
- 2 Sections
- 30 Timeslots (5 days × 6 slots)
- Faculty availability records

### Step 5: Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Step 6: Open the Frontend

Simply open the `timetable-frontend/index.html` file in your web browser:

```bash
cd ../timetable-frontend
start index.html  # Windows
# or just double-click index.html
```

## 🧪 Testing the System

### Test 1: Check Server Status
1. Open `index.html` in your browser
2. You should see "Server is running! ✅"
3. Statistics should show the seeded data counts

### Test 2: Generate Timetable
1. Click "🚀 Generate Timetable"
2. Wait for the generation to complete
3. You should see a success message with the number of classes scheduled

### Test 3: View Timetable
1. Click "📅 View Timetable"
2. You should see a table with all scheduled classes
3. Each row shows: Section, Course, Faculty, Room, Day, and Slot

### Test 4: View Data
Click any of these buttons to view the data:
- 👨‍🏫 View Faculties
- 📚 View Courses
- 🏫 View Rooms
- 👥 View Sections
- ⏰ View Timeslots

### Test 5: API Testing with cURL

```bash
# Health check
curl http://localhost:5000

# Get all faculties
curl http://localhost:5000/api/faculty

# Get all courses
curl http://localhost:5000/api/course

# Generate timetable
curl -X POST http://localhost:5000/api/timetable/generate

# View timetable
curl http://localhost:5000/api/timetable

# Clear timetable
curl -X DELETE http://localhost:5000/api/timetable
```

## 📊 API Endpoints

### Faculty
- `GET /api/faculty` - Get all faculties
- `GET /api/faculty/:id` - Get single faculty
- `POST /api/faculty` - Create faculty
- `PUT /api/faculty/:id` - Update faculty
- `DELETE /api/faculty/:id` - Delete faculty

### Course
- `GET /api/course` - Get all courses
- `GET /api/course/:id` - Get single course
- `POST /api/course` - Create course
- `PUT /api/course/:id` - Update course
- `DELETE /api/course/:id` - Delete course

### Room
- `GET /api/room` - Get all rooms
- `GET /api/room/:id` - Get single room
- `POST /api/room` - Create room
- `PUT /api/room/:id` - Update room
- `DELETE /api/room/:id` - Delete room

### Section
- `GET /api/section` - Get all sections
- `GET /api/section/:id` - Get single section
- `POST /api/section` - Create section
- `PUT /api/section/:id` - Update section
- `DELETE /api/section/:id` - Delete section

### TimeSlot
- `GET /api/timeslot` - Get all timeslots
- `GET /api/timeslot/:id` - Get single timeslot
- `POST /api/timeslot` - Create timeslot
- `PUT /api/timeslot/:id` - Update timeslot
- `DELETE /api/timeslot/:id` - Delete timeslot

### Faculty Availability
- `GET /api/availability` - Get all availability records
- `GET /api/availability/faculty/:facultyId` - Get availability by faculty
- `GET /api/availability/:id` - Get single availability record
- `POST /api/availability` - Create availability record
- `PUT /api/availability/:id` - Update availability record
- `DELETE /api/availability/:id` - Delete availability record

### Timetable
- `GET /api/timetable` - Get all timetable entries
- `GET /api/timetable/:id` - Get single timetable entry
- `POST /api/timetable/generate` - Generate timetable
- `DELETE /api/timetable` - Clear all timetable entries
- `POST /api/timetable/conflicts/detect` - Detect conflicts
- `POST /api/timetable/conflicts/resolve` - **Automatically resolve conflicts**

### Simulation & Analysis (NEW)
- `POST /api/simulation/faculty-impact` - Analyze impact of faculty unavailability
- `POST /api/simulation/room-shortage` - Analyze room shortage scenarios
- `GET /api/simulation/history` - View simulation history
- `POST /api/simulation/compare` - Compare two simulation scenarios
- `POST /api/simulation/bulk-faculty` - Bulk faculty impact analysis

## 🎨 Features

### Timetable Generation Algorithm
The system uses a **constraint satisfaction algorithm** that:
1. Iterates through all sections and their courses
2. For each course, finds a valid timeslot considering:
   - Faculty availability
   - Faculty clash (no double booking)
   - Room availability and capacity
   - Room type matching (theory/lab)
   - Section clash (no double booking)
3. Assigns the first valid combination found
4. Logs warnings for courses that couldn't be scheduled

### Constraints Handled
- ✅ Room capacity must accommodate section size
- ✅ Room type must match course type (theory/lab)
- ✅ Faculty must be available at the timeslot
- ✅ No faculty can teach two classes simultaneously
- ✅ No room can host two classes simultaneously
- ✅ No section can have two classes simultaneously

### Automatic Conflict Resolution ✨ NEW
The system now includes an **intelligent conflict resolution engine** that automatically fixes scheduling conflicts:

**Resolution Strategies:**
1. **Faculty Conflicts**: Reschedules classes to alternative timeslots where faculty is available
2. **Room Conflicts**: Finds alternative rooms of the same type or reschedules to different timeslots
3. **Section Conflicts**: Moves overlapping classes to free timeslots, changing rooms if necessary

**How It Works:**
- Click the "✨ Resolve Conflicts" button in the UI
- System detects all conflicts automatically
- Applies smart resolution strategies while maintaining all constraints
- Shows detailed resolution log with actions taken
- Displays conflict-free timetable automatically

**See [CONFLICT_RESOLUTION.md](CONFLICT_RESOLUTION.md) for detailed documentation.**

### Advanced Simulation & Analysis Features ✨ NEW

The system includes **5 powerful simulation and analysis tools** for proactive timetable management:

#### 1. **Faculty Impact Analysis**
Simulates the impact of faculty unavailability (illness, leave, resignation):
- Calculates impact score based on classes and students affected
- Provides severity classification (CRITICAL/HIGH/MEDIUM)
- Generates smart recommendations (hire guest lecturers, redistribute workload)
- Shows detailed list of affected classes
- **Selection-based UI** - Click on faculty from list, no manual ID entry

#### 2. **Room Shortage Analysis**
Simulates room unavailability (maintenance, renovation, events):
- Finds alternative rooms of the same type
- Calculates impact on classes and students
- Provides relocation recommendations
- Shows available alternatives with capacity details
- **Selection-based UI** - Click on room from list

#### 3. **Simulation History**
Tracks all simulation runs for analysis:
- Stores last 50 simulations
- Displays key metrics (type, score, classes, students)
- Color-coded by severity for quick assessment
- Relative timestamps ("Just now", "2 mins ago")
- **One-click access** - No input required

#### 4. **Scenario Comparison**
Compares two simulations side-by-side:
- Calculates score difference
- Declares winner (higher impact = higher priority)
- Helps prioritize which issue to address first
- Shows detailed comparison metrics
- **Radio button selection** - Choose from simulation history

#### 5. **Bulk Faculty Analysis**
Analyzes multiple faculty members simultaneously:
- Ranks faculty by impact score
- Identifies most critical faculty
- Provides batch recommendations
- Supports backup planning
- **Checkbox selection** - Select multiple faculty at once

**Impact Score Formula:**
```
Faculty Impact = (Classes × 10) + (Students ÷ 10)
Room Impact = (Classes × 8) + (Students ÷ 15)

Severity Levels:
- CRITICAL: Score > 50 (Immediate action required)
- HIGH: Score 26-50 (Planning needed)
- MEDIUM: Score ≤ 25 (Manageable)
```

**See [PROJECT_WORK_DOCUMENTATION.md](PROJECT_WORK_DOCUMENTATION.md) for complete technical details.**

## 🐛 Troubleshooting

### MongoDB Connection Error
**Error:** `Error: connect ECONNREFUSED ::1:27017`

**Solution:**
1. Make sure MongoDB is installed and running
2. Check MongoDB service: `Get-Service -Name MongoDB`
3. Start MongoDB service if stopped: `Start-Service -Name MongoDB`
4. Or use MongoDB Atlas (cloud) instead

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Stop the process using port 5000
2. Or change the PORT in `.env` file

### CORS Error in Browser
**Error:** `Access to fetch at 'http://localhost:5000' ... has been blocked by CORS`

**Solution:**
- The backend already has CORS enabled
- Make sure the backend server is running
- Try opening the HTML file directly (not through a web server)

## 📝 Test Results Summary

### ✅ Backend Tests
- [x] Server starts successfully
- [x] MongoDB connection works
- [x] All API endpoints respond correctly
- [x] Database seeding works
- [x] Timetable generation completes without errors
- [x] Conflict detection works

### ✅ Frontend Tests
- [x] UI loads correctly
- [x] Server status check works
- [x] Statistics display correctly
- [x] Generate timetable button works
- [x] View timetable displays data in table format
- [x] All view buttons work correctly
- [x] Clear timetable works

## 🎓 Usage Example

1. **Start MongoDB** (if not already running)
2. **Seed the database**: `npm run seed`
3. **Start the backend**: `npm start`
4. **Open the frontend**: Open `index.html` in browser
5. **Generate timetable**: Click "Generate Timetable"
6. **View results**: Click "View Timetable" to see the schedule

## 🔧 Development

### Adding New Features
1. Add model in `models/`
2. Create routes in `routes/`
3. Register routes in `index.js`
4. Update frontend to use new endpoints

### Modifying the Algorithm
The timetable generation logic is in `services/timetableGenerator.js`

## 📄 License

MIT License

## 👨‍💻 Author

Darshan Radhakrishnan

---

**Status:** ✅ **FULLY FUNCTIONAL AND TESTED**
