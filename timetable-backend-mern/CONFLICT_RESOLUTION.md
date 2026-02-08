# Conflict Resolution Feature Documentation

## Overview

The Automated Timetable Scheduling System now includes an **intelligent conflict resolution feature** that automatically detects and resolves scheduling conflicts in your timetable. This feature uses smart algorithms to find alternative timeslots, rooms, and resources to eliminate conflicts while maintaining all scheduling constraints.

## Features

### 1. Automatic Conflict Detection
- Detects **faculty conflicts** (same faculty teaching multiple classes at the same time)
- Detects **room conflicts** (same room assigned to multiple classes simultaneously)
- Detects **section conflicts** (same section scheduled for multiple classes at once)

### 2. Intelligent Resolution Strategies

#### Faculty Conflict Resolution
When a faculty member is double-booked:
1. **Reschedule**: Finds an alternative timeslot where:
   - The faculty is available
   - The section is free
   - The room is available
2. Maintains all original constraints (room type, capacity, etc.)

#### Room Conflict Resolution
When a room is double-booked:
1. **Alternative Room**: Finds a different room of the same type with sufficient capacity
2. **Reschedule**: If no alternative room is available, reschedules to a different timeslot
3. Ensures the new room meets all requirements (type, capacity)

#### Section Conflict Resolution
When a section has overlapping classes:
1. **Reschedule**: Moves one class to a different timeslot
2. **Room Change**: If needed, also changes the room to resolve the conflict
3. Verifies faculty availability at the new timeslot

## How to Use

### Via Web Interface

1. **Generate a Timetable**
   - Click the "🚀 Generate Timetable" button
   - Wait for the timetable to be generated

2. **Detect Conflicts** (Optional)
   - Click "🔍 Detect Conflicts" to see if any conflicts exist
   - Review the conflict report

3. **Resolve Conflicts**
   - Click the "✨ Resolve Conflicts" button
   - The system will automatically:
     - Detect all conflicts
     - Apply resolution strategies
     - Show you the results
   - After 2 seconds, the conflict-free timetable will be displayed automatically

4. **View Results**
   - See a summary showing:
     - Initial number of conflicts
     - Number of conflicts resolved
     - Number of remaining conflicts (if any)
   - View detailed resolution actions taken
   - Click "📅 View Conflict-Free Timetable" to see the final schedule

### Via API

#### Endpoint
```
POST /api/timetable/conflicts/resolve?proposalId=<id>
```

#### Request
```bash
curl -X POST "http://localhost:5000/api/timetable/conflicts/resolve?proposalId=1"
```

#### Response (Success - All Conflicts Resolved)
```json
{
  "message": "Resolved 5 out of 5 conflicts",
  "success": true,
  "data": {
    "success": true,
    "message": "Resolved 5 out of 5 conflicts",
    "conflictsResolved": 5,
    "initialConflicts": 5,
    "remainingConflicts": 0,
    "resolutionLog": [
      {
        "type": "faculty",
        "conflict": { ... },
        "action": {
          "action": "moved",
          "entryId": "...",
          "from": "...",
          "to": "...",
          "reason": "Faculty conflict resolved by rescheduling"
        }
      }
    ],
    "remainingConflictDetails": []
  }
}
```

#### Response (Partial Resolution)
```json
{
  "message": "Resolved 3 out of 5 conflicts",
  "success": true,
  "data": {
    "success": true,
    "message": "Resolved 3 out of 5 conflicts",
    "conflictsResolved": 3,
    "initialConflicts": 5,
    "remainingConflicts": 2,
    "resolutionLog": [ ... ],
    "remainingConflictDetails": [ ... ]
  }
}
```

## Resolution Algorithm

The conflict resolution system follows this workflow:

```
1. Detect all conflicts in the timetable
   ↓
2. Group conflicts by type (faculty, room, section)
   ↓
3. For each faculty conflict:
   - Find the conflicting entries
   - Try to move one entry to a different timeslot
   - Verify all constraints (faculty availability, section free, room free)
   ↓
4. For each room conflict:
   - Try to find an alternative room (same type, sufficient capacity)
   - If not found, try to reschedule to a different timeslot
   ↓
5. For each section conflict:
   - Try to reschedule to a different timeslot
   - If needed, also change the room
   ↓
6. Re-detect conflicts to verify resolution
   ↓
7. Return detailed results with resolution log
```

## Constraints Maintained

The resolution algorithm ensures all original constraints are maintained:

- ✅ **Room Capacity**: New rooms must accommodate section size
- ✅ **Room Type**: Theory classes stay in theory rooms, labs in lab rooms
- ✅ **Faculty Availability**: Faculty must be available at new timeslots
- ✅ **No Double Booking**: No resource (faculty/room/section) is double-booked
- ✅ **Course Requirements**: All course-specific requirements are preserved

## UI Features

### Success Display
When all conflicts are resolved:
- 🎉 Celebration banner with green gradient
- Statistics showing initial conflicts, resolved, and remaining
- Detailed log of resolution actions
- Automatic display of conflict-free timetable after 2 seconds
- Button to manually view the timetable

### Partial Resolution Display
When some conflicts remain:
- ⚠️ Warning banner with orange gradient
- Statistics showing progress
- List of remaining conflicts
- Options to:
  - View the current timetable
  - Use manual rescheduling tools

### Resolution Actions Display
Each resolved conflict shows:
- Icon indicating action type (📅 moved, 🏫 room changed, 🔄 both)
- Conflict type (FACULTY, ROOM, SECTION)
- Reason for the action taken

## Best Practices

1. **Generate First**: Always generate a timetable before attempting resolution
2. **Check Conflicts**: Use "Detect Conflicts" to see what needs fixing
3. **Resolve Automatically**: Let the system try automatic resolution first
4. **Manual Override**: Use "Dynamic Rescheduling" for remaining conflicts
5. **Verify Results**: Always review the final timetable to ensure it meets your needs

## Troubleshooting

### "No timetable found" Error
- **Cause**: No timetable has been generated yet
- **Solution**: Click "🚀 Generate Timetable" first

### "proposalId is required" Error
- **Cause**: No proposal ID was provided to the API
- **Solution**: Ensure you include `?proposalId=<id>` in the API request

### Some Conflicts Cannot Be Resolved
- **Cause**: Insufficient resources or scheduling constraints are too tight
- **Possible Solutions**:
  - Add more rooms
  - Add more timeslots
  - Adjust faculty availability
  - Use manual rescheduling for specific conflicts

## Technical Details

### Files Modified/Created

1. **Backend**:
   - `services/conflictResolver.js` - New conflict resolution service
   - `routes/timetable.js` - Added `/conflicts/resolve` endpoint

2. **Frontend**:
   - `index.html` - Added "Resolve Conflicts" button and `resolveConflicts()` function

### Dependencies
- Uses existing models: `Timetable`, `Conflict`, `Faculty`, `Room`, `TimeSlot`, `FacultyAvailability`
- Integrates with existing `conflictDetector.js` service

## Future Enhancements

Potential improvements for future versions:
- Priority-based resolution (resolve critical conflicts first)
- Machine learning to predict optimal resolutions
- Batch resolution for multiple proposal IDs
- Undo/redo functionality for resolution actions
- Export resolution report as PDF
- Email notifications when conflicts are resolved

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all prerequisites are met (MongoDB running, backend started)
3. Review the API response for specific error details
4. Use the manual rescheduling tools for complex scenarios

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Author**: Darshan Radhakrishnan
