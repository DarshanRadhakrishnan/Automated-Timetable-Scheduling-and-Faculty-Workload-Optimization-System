# 🚀 EPIC 4 - QUICK REFERENCE CARD

## **All 5 Features at a Glance**

| # | Feature | Button Color | Input | Output |
|---|---------|--------------|-------|--------|
| 1 | 🧪 Faculty Impact | RED | 1 Faculty ID | Score, Classes, Students, Recommendations |
| 2 | 🏫 Room Shortage | PINK | 1 Room ID | Score, Classes, Alternatives |
| 3 | 📊 View History | BLUE | None | Table of all simulations |
| 4 | 🔄 Compare | PURPLE | 2 Simulation IDs | Side-by-side comparison |
| 5 | 📈 Bulk Faculty | ORANGE | Multiple Faculty IDs | Ranked table |

---

## **Quick Test (5 Minutes)**

1. Open `getIds.html` → Get 3 Faculty IDs + 1 Room ID
2. Open `index.html`
3. Test each feature in order (1→2→3→4→5)
4. Done! ✅

---

## **Sample Input Format**

- **Faculty Impact:** `67a3292b3d8d6411f420e6ef`
- **Room Shortage:** `698820f05f6d83fc34eaf52e`
- **Bulk Faculty:** `id1,id2,id3` (comma-separated, NO SPACES!)
- **Compare:** Use Simulation IDs from History

---

## **Impact Score Guide**

- **0-25:** 🟢 MEDIUM (manageable)
- **26-50:** 🟡 HIGH (requires planning)
- **51-100:** 🔴 CRITICAL (urgent action needed)

---

## **Files Created**

1. `routes/simulation.js` - Backend API
2. `index.html` - Updated with 5 buttons + functions
3. `getIds.html` - Helper tool to get IDs
4. `EPIC4_TESTING_GUIDE.md` - Full testing guide
5. `EPIC4_QUICK_REFERENCE.md` - This file

---

## **API Endpoints**

- `POST /api/simulation/faculty-impact`
- `POST /api/simulation/room-shortage`
- `GET /api/simulation/history`
- `POST /api/simulation/compare`
- `POST /api/simulation/bulk-faculty`

---

## **Troubleshooting**

| Problem | Solution |
|---------|----------|
| "Failed to fetch" | Check backend is running |
| "Not found" | Use real IDs from `getIds.html` |
| "No history" | Run Feature 1 or 2 first |

---

**Status:** ✅ ALL WORKING  
**Last Updated:** 2026-02-10
