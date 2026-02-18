# 5-Minute Quick Setup Guide

## ⚡ Prerequisites
- Node.js 14+ installed
- MongoDB running (localhost:27017)
- Git installed
- Code editor (VS Code recommended)

## 🚀 Installation Steps

### Step 1: Clone Repository (30 seconds)
```bash
git clone https://github.com/DarshanRadhakrishnan/Automated-Timetable-Scheduling-and-Faculty-Workload-Optimization-System.git
cd Automated-Timetable-Scheduling-and-Faculty-Workload-Optimization-System/timetable-backend-mern
```

### Step 2: Install Dependencies (2 minutes)
```bash
npm install
```

### Step 3: Environment Configuration (1 minute)
Ensure `.env` file exists with:
```env
MONGODB_URI=mongodb://localhost:27017/timetable
PORT=5000
```
(If missing, copy from `.env.example` or create new)

### Step 4: Database Setup (1 minute)
```bash
npm run seed    # Optional: Load sample data
```

### Step 5: Run Tests (1 minute)
To verify everything is working:
```bash
npm test           # Should see 99+ tests passing
```
Or generate coverage:
```bash
npm run test:coverage
```

### Step 6: Start Server (10 seconds)
```bash
npm start
# Server running at http://localhost:5000
```

## ✅ Verification Checklist

- [ ] Tests pass: `npm test` shows success.
- [ ] Server starts: `npm start` shows `Server is running on port 5000`.
- [ ] API responds: Open `http://localhost:5000` in browser (should see JSON message).
- [ ] Postman tests pass (import collection and run).

## 📁 File Placement Guide

Important files created:
```
project/
├── routes/
│   └── analysis.js          ← Impact Analysis Logic
├── __tests__/
│   ├── analysis.test.js      ← Unit Tests
│   └── analysis.api.test.js  ← Integration Tests
├── postman/
│   └── Timetable_Analysis_API.postman_collection.json
└── docs/
    └── *.md                  ← Documentation
```

## 🔧 Troubleshooting

### Issue: MongoDB Connection Error
**Solution:**
```bash
# Check if MongoDB service is running
net start MongoDB
# Or verify connection string in .env
```

### Issue: Tests Failing
**Solution:**
1. Ensure no other server is running on port 5000 (though tests mock app execution).
2. Check if `timetable_test` database can be created (permissions).
3. `npm install` again to fix missing dev dependencies.

## 🎯 Next Steps

1. Review API documentation in `routes/analysis.js` (JSDoc).
2. Import Postman collection.
3. Run demonstration script (`docs/DEMONSTRATION_SCRIPT.md`).

## 📞 Support
- Reach out to the project maintainer via GitHub Issues.
