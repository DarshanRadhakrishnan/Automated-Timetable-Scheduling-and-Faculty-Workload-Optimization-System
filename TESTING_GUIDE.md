# 🧪 TESTING GUIDE - Enhanced Timetable System

## Quick Test Checklist

### ✅ Step 1: Verify Application is Running
```bash
# Check frontend (should be on port 3000)
lsof -i :3000

# Check backend (should be on port 5001)
lsof -i :5001
```

### ✅ Step 2: Open the Timetable Page
Navigate to: `http://localhost:3000/timetable`

### ✅ Step 3: Test Dashboard Statistics
**Expected:** Top section shows 6 stat cards with numbers:
- Total Faculties
- Total Courses
- Total Rooms
- Total Sections
- Total Timeslots
- Scheduled Classes

**Action:** Verify numbers are displayed (not 0 if data exists)

### ✅ Step 4: Test Quick Actions Panel
**Expected:** See 4 sections of buttons:

1. **Timetable Management:**
   - 🚀 Generate Timetable
   - 👁️ View Timetable
   - 🗑️ Clear Timetable
   - Select Plan dropdown (appears after generation)
   - 📄 CSV button (appears after generation)

2. **Data Viewers:**
   - 📋 View All
   - 👨‍🏫 View Faculties
   - 📚 View Courses
   - 🏢 View Rooms
   - 🎓 View Sections
   - ⏰ View Timeslots

3. **Conflict Intelligence:**
   - 🔍 Detect Conflicts
   - ⚠️ View Conflicts (with count)
   - ✨ Resolve Conflicts

4. **Advanced Tools:**
   - 🔄 Dynamic Rescheduling

### ✅ Step 5: Test Timetable Generation
**Action:**
1. Click "🚀 Generate Timetable"
2. Wait for processing (may take 10-30 seconds)

**Expected:**
- Loading message appears
- Success message: "✅ Generated 3 timetable proposals! Showing Rank 1 (Score: XXX)"
- Dropdown appears with 3 options:
  - Rank 1 (Score: XXXX)
  - Rank 2 (Score: XXXX)
  - Rank 3 (Score: XXXX)
- Timetable table populates with data
- Statistics update

### ✅ Step 6: Test Plan Selection
**Action:**
1. Click the "Select Plan" dropdown
2. Choose "Rank 2"

**Expected:**
- Timetable refreshes
- Shows different schedule
- Dropdown shows selected plan

### ✅ Step 7: Test CSV Export
**Action:**
1. Click "📄 CSV" button

**Expected:**
- File downloads: `timetable-rank-X.csv`
- File contains timetable data in CSV format

### ✅ Step 8: Test Data Filters
**Action:**
1. Click "👨‍🏫 View Faculties"
2. Dropdown appears below
3. Select a faculty member

**Expected:**
- Table shows only classes for that faculty
- All columns still visible

**Repeat for:**
- View Courses
- View Rooms
- View Sections
- View Timeslots

### ✅ Step 9: Test Conflict Detection
**Action:**
1. Click "🔍 Detect Conflicts"
2. Wait for detection

**Expected:**
- Loading message: "🔄 Detecting..."
- Result message appears:
  - If conflicts: "⚠️ Found X conflicts in Rank Y!"
  - If none: "✅ No conflicts in Rank Y! Timetable is conflict-free."
- Display mode changes to "conflicts"
- Table shows conflict details with 4 columns:
  - Type (colored badge)
  - Reason (detailed message)
  - Entity (name)
  - Timeslot ID

### ✅ Step 10: Test Conflict Resolution
**Action:**
1. Click "✨ Resolve Conflicts"
2. Wait for resolution

**Expected:**
- Loading message: "🔄 Analyzing and resolving conflicts..."
- Success message: "✅ Resolved X out of Y conflicts!"
- Display mode changes to "resolution"
- Shows resolution summary with:
  - Initial Conflicts count
  - Resolved count
  - Remaining count
- Change Log appears with numbered entries
- Each change shows:
  - Class name
  - Action taken
  - Old value (crossed out in red)
  - New value (in green)
  - Unchanged items
- Two buttons appear:
  - "👁️ View Conflict-Free Timetable"
  - "📥 Download File"

### ✅ Step 11: Test View Conflict-Free Timetable
**Action:**
1. Click "👁️ View Conflict-Free Timetable"

**Expected:**
- Display mode changes back to "timetable"
- Shows updated timetable
- Conflicts should be resolved

### ✅ Step 12: Test Dynamic Rescheduling
**Action:**
1. Click "🔄 Dynamic Rescheduling"

**Expected:**
- Modal opens
- Shows 3 mode options:
  - 🎉 Public Holiday
  - 👨‍🏫 Faculty Leave
  - 🏢 Room Unavailable

**Test Faculty Leave:**
1. Click "Faculty Leave"
2. Select a faculty from dropdown
3. Select a day
4. Click "Find Substitutes & Alternatives"

**Expected:**
- Shows affected classes
- Provides resolution options
- Can apply changes

### ✅ Step 13: Test Dark Mode
**Action:**
1. Toggle dark mode (if available in your system)

**Expected:**
- All components adapt to dark theme
- Text remains readable
- Colors adjust appropriately

### ✅ Step 14: Test Responsive Design
**Action:**
1. Resize browser window
2. Try mobile view (< 768px)

**Expected:**
- Layout adapts to screen size
- Buttons stack vertically on mobile
- Table scrolls horizontally if needed
- All features remain accessible

---

## 🐛 Troubleshooting

### Issue: Statistics show 0
**Solution:** Make sure you have data in the database (faculties, courses, rooms, sections, timeslots)

### Issue: Generate button doesn't work
**Solution:** 
1. Check backend is running on port 5001
2. Check browser console for errors
3. Verify MongoDB connection

### Issue: Dropdown doesn't appear after generation
**Solution:** 
1. Check if generation was successful
2. Look for error messages
3. Verify rankings were returned from backend

### Issue: Conflict detection times out
**Solution:**
1. This is normal for large timetables
2. Wait for completion
3. Check backend logs

### Issue: CSV export doesn't work
**Solution:**
1. Check browser's download settings
2. Verify popup blocker isn't blocking download
3. Check browser console for errors

---

## ✅ Success Criteria

All features are working if:
- [x] Dashboard statistics display correctly
- [x] All 15 action buttons are visible and clickable
- [x] Timetable generation creates 3 ranked proposals
- [x] Plan selection switches between proposals
- [x] CSV export downloads file
- [x] All 6 filter options work correctly
- [x] Conflict detection shows results
- [x] Conflict resolution works and shows change log
- [x] Dynamic rescheduling modal opens
- [x] Dark mode works (if enabled)
- [x] Responsive design adapts to screen size

---

## 📸 Expected Screenshots

### 1. Initial View
- Dashboard with statistics
- Quick Actions panel with all buttons
- Empty timetable table

### 2. After Generation
- Success message
- Plan selector dropdown
- Populated timetable table
- Updated statistics

### 3. Conflict Detection
- Conflict table with colored badges
- Detailed error messages
- Entity and timeslot information

### 4. Conflict Resolution
- Resolution summary with statistics
- Change log with visual diffs
- Action buttons

### 5. Filtered View
- Filter dropdown
- Filtered table results
- Active filter button highlighted

---

**Test all features to ensure everything works as expected!** 🚀
