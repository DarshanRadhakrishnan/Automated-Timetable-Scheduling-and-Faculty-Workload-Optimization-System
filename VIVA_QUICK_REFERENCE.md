# 📱 VIVA QUICK REFERENCE CARD
## Dynamic Rescheduling System

---

## 🎯 OPENING STATEMENT (Memorize This!)

> "Good morning. I'll present the **Dynamic Rescheduling System** - an automated solution for handling unexpected schedule changes like faculty leaves, room unavailability, and public holidays. The system uses **constraint-based algorithms** to find optimal alternatives in seconds while respecting all timetable constraints."

---

## 🔑 THREE MAIN FEATURES

### 1️⃣ **Public Holiday Rescheduling**
- **What:** Reschedules all classes on a holiday
- **How:** Finds alternative slots in same week
- **Algorithm:** Constraint-based search with ranking

### 2️⃣ **Faculty Leave Management**
- **What:** Finds substitute faculty or reschedules
- **How:** 2-tier approach (substitute first, then reschedule)
- **Validates:** Availability, workload, course compatibility

### 3️⃣ **Room Unavailability**
- **What:** Finds alternative rooms or time slots
- **How:** Matches room type and capacity
- **Validates:** Room availability, section size

---

## 💻 TECH STACK (Say This Confidently!)

**Frontend:**
- Next.js/React
- TypeScript
- React Hooks (useState, useEffect)
- Axios for API calls

**Backend:**
- Node.js/Express
- MongoDB with Mongoose
- RESTful API
- Transaction support

**Key Files:**
- `DynamicReschedulingPanel.tsx` (Frontend)
- `reschedulingService.ts` (Backend logic)
- MongoDB Collections: Timetable, Faculty, Room

---

## 📊 KEY NUMBERS

- ✅ **3 modes** of rescheduling
- ✅ **21 faculty members** in database
- ✅ **18 rooms** available
- ✅ **2-tier approach** for each scenario
- ✅ **4 constraint types** validated

---

## 🎬 DEMO SEQUENCE

1. **Open timetable page** → "This is our dashboard"
2. **Click Dynamic Rescheduling** → "Opens modal with 3 modes"
3. **Select Faculty Leave** → "I'll demonstrate faculty leave"
4. **Choose faculty from dropdown** → "Populated from database"
5. **Select day** → "Let's say Monday"
6. **Click Analyze** → "System searches for substitutes"
7. **Show results** → "Here are the alternatives found"
8. **Explain ranking** → "Ranked by preference and constraints"

---

## ❓ TOP 5 EXPECTED QUESTIONS

### Q1: How do you prevent conflicts?
**A:** "Multi-level validation: faculty availability, room availability, section conflicts, and workload constraints - all checked using MongoDB aggregation queries."

### Q2: What algorithm do you use?
**A:** "Constraint-based search with ranking. We generate candidates, filter by constraints, rank by preference (same week, minimal disruption), and return top results."

### Q3: How do you handle database updates?
**A:** "MongoDB transactions ensure atomicity - either all changes apply or none do. This prevents partial updates that could corrupt the timetable."

### Q4: What if no alternative is found?
**A:** "Fallback strategy: try same week, then next week, then suggest manual intervention. System always returns actionable information."

### Q5: Why automated vs manual?
**A:** "Manual is time-consuming (hours vs seconds), error-prone (easy to miss conflicts), not scalable, and inconsistent. Our system guarantees constraint satisfaction."

---

## 🎯 TECHNICAL TERMS TO USE

✅ Constraint-based algorithm  
✅ MongoDB transactions  
✅ Atomic operations  
✅ Aggregation queries  
✅ React hooks  
✅ Asynchronous data fetching  
✅ RESTful API  
✅ Normalized schema  
✅ Optimistic concurrency  
✅ Two-tier approach  

---

## ⚡ POWER PHRASES

Use these to sound confident:

- "Our system uses a **constraint-based search algorithm**..."
- "We ensure data integrity through **MongoDB transactions**..."
- "The interface features **dynamically populated dropdowns**..."
- "We validate against **multiple constraint levels**..."
- "The algorithm employs **intelligent ranking**..."
- "We've implemented a **two-tier fallback strategy**..."

---

## 🚫 AVOID SAYING

❌ "It just works"  
❌ "We store it"  
❌ "The user clicks"  
❌ "It's simple"  

### ✅ INSTEAD SAY

✅ "It uses constraint-based algorithms to ensure..."  
✅ "We use atomic transactions to maintain..."  
✅ "The user interacts through a validated interface..."  
✅ "While the interface is intuitive, the backend employs sophisticated..."  

---

## 🎓 CODE SNIPPETS TO MENTION

### Frontend Data Fetching:
```typescript
useEffect(() => {
    const fetchData = async () => {
        const [faculties, rooms] = await Promise.all([
            getAvailableFaculties(),
            getAvailableRooms()
        ]);
        setFaculties(faculties);
        setRooms(rooms);
    };
    if (isOpen) fetchData();
}, [isOpen]);
```

### Backend Transaction:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
    await Timetable.updateMany({...}, {...}, { session });
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
}
```

---

## 🌟 CONFIDENCE BOOSTERS

**Remember:**
- ✅ You built a working system
- ✅ It solves a real problem
- ✅ The code is clean and functional
- ✅ You understand the logic
- ✅ You can demonstrate it live

**If stuck:**
- Take a breath
- Refer to the demo
- Explain step by step
- It's okay to say "Let me show you in the code"

---

## 📋 PRE-VIVA CHECKLIST

□ Backend running on port 5001  
□ Frontend running on port 3000  
□ Database connected  
□ Browser ready at timetable page  
□ Read through main preparation doc  
□ Practice opening statement 3 times  
□ Test all three modes once  
□ Review this quick reference  

---

## 🎤 FINAL MANTRA

**"I built a sophisticated automated system that uses constraint-based algorithms to solve real-world scheduling problems. I can explain it, demonstrate it, and defend my design decisions."**

---

## 🔥 LAST-MINUTE TIPS

1. **Speak slowly** - You know more than you think
2. **Use the demo** - Show, don't just tell
3. **Be specific** - Use technical terms correctly
4. **Stay calm** - You've got this!
5. **Smile** - Confidence is contagious

---

**GOOD LUCK! 🍀**

*You've prepared well. Trust yourself and your work!*
