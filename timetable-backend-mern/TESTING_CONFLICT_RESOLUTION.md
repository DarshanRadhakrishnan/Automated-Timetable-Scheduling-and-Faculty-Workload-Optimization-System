# Testing Conflict Resolution - Quick Guide

## Quick Test Steps

Follow these steps to test the new automatic conflict resolution feature:

### 1. Start the System

```bash
# Terminal 1 - Start MongoDB (if not already running)
# MongoDB should be running as a service

# Terminal 2 - Start Backend
cd timetable-backend-mern
npm start
```

### 2. Open the Frontend
- Open `timetable-frontend/index.html` in your web browser
- You should see "Server is running! ✅"

### 3. Generate a Timetable
1. Click **"🚀 Generate Timetable"**
2. Wait for the generation to complete
3. You should see a success message

### 4. Check for Conflicts
1. Click **"🔍 Detect Conflicts"**
2. Review any conflicts found
3. Note the number and types of conflicts

### 5. Resolve Conflicts Automatically
1. Click **"✨ Resolve Conflicts"** (the green button)
2. Wait for the resolution process to complete
3. You should see:
   - A success banner showing conflicts resolved
   - Statistics (Initial, Resolved, Remaining)
   - Detailed resolution log
   - Automatic display of conflict-free timetable

### 6. Verify the Results
1. The conflict-free timetable will be displayed automatically
2. Click **"🔍 Detect Conflicts"** again to verify no conflicts remain
3. You should see "✅ No conflicts detected in this timetable version!"

## Expected Results

### Scenario 1: All Conflicts Resolved
```
🎉 Conflict Resolution Complete!
All conflicts have been successfully resolved!

Initial Conflicts: 5
Resolved: 5
Remaining: 0

[Detailed resolution log showing actions taken]

📅 View Conflict-Free Timetable
```

### Scenario 2: Partial Resolution
```
⚠️ Partial Resolution
Some conflicts could not be automatically resolved

Initial Conflicts: 8
Resolved: 6
Remaining: 2

[Remaining conflicts listed]

Options:
- 📅 View Current Timetable
- 🔄 Manual Rescheduling
```

## Testing Different Scenarios

### Test 1: Faculty Conflicts
1. Generate a timetable
2. Manually create a conflict by editing the database (optional)
3. Run conflict resolution
4. Verify faculty is rescheduled to a different timeslot

### Test 2: Room Conflicts
1. Generate a timetable with limited rooms
2. Check for room conflicts
3. Run conflict resolution
4. Verify classes are moved to alternative rooms or timeslots

### Test 3: Section Conflicts
1. Generate a timetable
2. Check for section conflicts
3. Run conflict resolution
4. Verify section classes are properly distributed

## API Testing

### Using cURL

```bash
# Detect conflicts
curl -X POST "http://localhost:5000/api/timetable/conflicts/detect?proposalId=1"

# Resolve conflicts
curl -X POST "http://localhost:5000/api/timetable/conflicts/resolve?proposalId=1"

# View timetable
curl "http://localhost:5000/api/timetable?proposalId=1"
```

### Using Postman

1. **Detect Conflicts**
   - Method: POST
   - URL: `http://localhost:5000/api/timetable/conflicts/detect?proposalId=1`
   - Expected: List of conflicts

2. **Resolve Conflicts**
   - Method: POST
   - URL: `http://localhost:5000/api/timetable/conflicts/resolve?proposalId=1`
   - Expected: Resolution summary with log

3. **Verify Resolution**
   - Method: POST
   - URL: `http://localhost:5000/api/timetable/conflicts/detect?proposalId=1`
   - Expected: Empty conflict list

## Troubleshooting Test Issues

### Issue: "No timetable found"
**Solution**: Generate a timetable first using "🚀 Generate Timetable"

### Issue: "No conflicts detected"
**Solution**: This is actually good! It means your timetable is already conflict-free

### Issue: Backend not responding
**Solution**: 
1. Check if MongoDB is running
2. Verify backend is started (`npm start`)
3. Check console for errors

### Issue: Some conflicts remain unresolved
**Solution**: 
1. This is normal if constraints are very tight
2. Use "🔄 Dynamic Rescheduling" for manual resolution
3. Consider adding more resources (rooms, timeslots)

## Performance Expectations

- **Small timetables** (< 50 entries): Resolution in 1-3 seconds
- **Medium timetables** (50-200 entries): Resolution in 3-10 seconds
- **Large timetables** (> 200 entries): Resolution in 10-30 seconds

## Success Criteria

✅ All conflicts detected  
✅ Resolution strategies applied  
✅ Constraints maintained  
✅ Timetable remains valid  
✅ UI shows detailed results  
✅ Automatic timetable display works  

## Next Steps After Testing

1. **Review the timetable** to ensure it meets your requirements
2. **Export or save** the conflict-free timetable
3. **Test with different data** by modifying seed.js
4. **Integrate with your workflow** using the API endpoints

## Additional Resources

- Full documentation: [CONFLICT_RESOLUTION.md](CONFLICT_RESOLUTION.md)
- Main README: [README.md](README.md)
- API documentation: See README.md § API Endpoints

---

**Happy Testing! 🎉**
