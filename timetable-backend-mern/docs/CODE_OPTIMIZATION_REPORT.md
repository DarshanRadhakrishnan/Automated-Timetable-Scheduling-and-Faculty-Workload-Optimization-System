# Code Optimization Report

## Executive Summary
- **Total files analyzed**: 12 (Models + Routes)
- **Optimization opportunities found**: 5 Major, 3 Minor
- **Estimated performance improvement**: ~40-60% for heavy operations

## 1. Scheduling Algorithm Optimizations

### Current Implementation Analysis
The current `generateTimetable` (inferred from usage in `timetable.js`) and Conflict Detection appear to rely on iterative checking against database or in-memory arrays without efficient lookups.
- **Complexity**: Likely O(N²) or O(N*M) where N is sections and M is timeslots.
- **Resource Usage**: High CPU during generation.

### Performance Issues Identified
1. **Sequential Database Writes**: In `rescheduling.js`, the `/apply-changes` endpoint iterates through updates and awaits each DB operation sequentially.
   ```javascript
   for (const update of updates) {
       // ... await Timetable.findByIdAndUpdate(...)
   }
   ```
   *Impact*: Latency increases linearly with number of updates.

2. **Heavy Population**: `timetable.js` endpoint `GET /` fetches all entries and populates 5 relations (`sectionId`, `courseId`, `facultyId`, `roomId`, `timeslotId`) for potentially thousands of documents without pagination.
   *Impact*: High memory usage and slow response time on large datasets.

3. **Missing Indexes**: Database Analysis shows a lack of compound indexes on frequently queried fields like `facultyId`, `roomId`, and `timeslotId` in the `Timetable` collection.

### Recommended Optimizations

#### A. Parallel Execution for Bulk Updates
Refactor `apply-changes` to use `Promise.all` or MongoDB `bulkWrite`.
```javascript
// Optimized approach
const operations = updates.map(update => {
    return {
        updateOne: {
            filter: { _id: update.entryId },
            update: { $set: update.changes }
        }
    };
});
await Timetable.bulkWrite(operations);
```
*Expected Gain*: 10x faster for 50+ updates.

#### B. Implement Caching
Cache the `GET /api/timetable` response using Redis or simple memory cache (node-cache) with a short TTL (e.g., 60 seconds), invalidated on updates.

#### C. Hash Map for Conflict Detection
Instead of querying the DB for every check, load the existing schedule into a 3D Matrix or Hash Map (Time x Room) for O(1) collision checks.

## 2. Database Query Optimizations

### Index Strategy
Add the following indexes to `Timetable.js`:
1. `timetables.facultyId` (Ascending) - For Faculty Load queries.
2. `timetables.roomId` (Ascending) - For Room usage queries.
3. `timetables.sectionId` (Ascending) - For Section schedule queries.
4. **Compound Index**: `{ timeslotId: 1, roomId: 1 }` (Unique) - To enforce one class per room per slot at DB level.

### Query Optimization Examples
**Before:**
```javascript
const entries = await Timetable.find({ facultyId: id }).populate('...');
```
**After (Lean):**
```javascript
const entries = await Timetable.find({ facultyId: id }).lean().populate('...');
```
*Benefit*: `lean()` returns plain JS objects, bypassing Mongoose document overhead (approx. 3x faster hydration).

## 3. API Performance Improvements
- **Pagination**: Implement cursor-based or limit-offset pagination for the main timetable view.
- **Compression**: Enable GZIP compression in Express (`compression` middleware).

## 4. Security Enhancements
- **Input Validation**: Add `express-validator` middleware to all POST endpoints.
- **Rate Limiting**: Protect `/generate` endpoints to prevent DoS.

## 5. Implementation Priority
1. **High Priority**: Add MongoDB Indexes (Immediate win).
2. **High Priority**: Refactor `apply-changes` to use `bulkWrite`.
3. **Medium Priority**: Implement caching for GET requests.
4. **Low Priority**: Full algorithm rewrite to use Genetic Algorithms or Constraint Satisfaction logic.

## Metrics & Benchmarks (Estimated)
| Operation | Current | Optimized | Improvement |
|-----------|---------|-----------|-------------|
| Bulk Update (50 items) | ~1200ms | ~150ms | 87% |
| Get All Schedule (1000 items) | ~400ms | ~120ms (Lean) | 70% |
| Conflict Check | O(N) | O(1) (Hash) | 99% |
