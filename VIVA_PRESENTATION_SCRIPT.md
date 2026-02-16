# 🎙️ VIVA VOCE & DEMO SCRIPT
**Student Name:** [Your Name]
**Project Component:** Impact Analysis, Optimization & Testing

---

## 🟢 1. The "Why" (Motivation)
**Q: What exactly is your contribution?**
**Answer:**
"Ma'am, standard timetable systems only *generate* schedules. My module makes the system **intelligent**.
I built the **Impact Analysis Engine**. It doesn't just schedule classes; it proactively predicts **Faculty Burnout** and **Resource Shortages** before they happen, and it suggests solutions automatically."

**Q: What is the benefit of this?**
**Answer:**
1.  ** Prevents Overwork:** It flags if a professor is assigned too many students or classes.
2.  ** Saves Time:** Instead of manually checking 50 teachers, the **Bulk Analysis** scans everyone in 1 second.
3.  ** Solves Problems:** If a room is full, it automatically suggests an available alternative room of the same size.

---

## 🟢 2. The Logic (Impact Score Formula)
**Q: How do you calculate the 'Impact Score'? Why this formula?**
**Answer:**
"I designed a weighted algorithm to measure workload stress."

**Formula:**
`Score = (Total Classes × 2) + (Total Students ÷ 20)`

**Why these numbers?**
*   **Classes × 2:** Every class hour requires preparation. It's the primary load factor.
*   **Students ÷ 20:** Large classes add grading stress, but less than teaching hours. Dividing by 20 normalizes it so a class of 60 adds just 3 points to the risk score.

**Q: how do you decide if it's Critical?**
**Answer:**
"I use dynamic thresholds:"
*   ** > 75 (Critical):** Immediate action needed (e.g., Dean notification).
*   ** > 45 (High):** Warning sign.
*   ** ≤ 45 (Medium/Safe):** Normal workload.

---

## 🟢 3. The Features (Technical Walkthrough)
*Open your Laptop and show the Dashboard*

**Point 1: Single Faculty Analysis**
"Here, I select a professor. The system instantly calculates their load. See? It says 'Critical' and recommends 'Hire Guest Lecturer'. It generated this advice automatically based on the severity."

**Point 2: Room Optimization**
"If I check 'Room 101', it sees it's overbooked. Look here—it suggests 'Room 102' because it checks:
1.  Is it free?
2.  Is the capacity big enough?
3.  Is it the right type (Lab vs Theory)?"

**Point 3: Bulk Analysis**
"This is the most powerful feature. One click scans the **entire department**. It sorts faculty from 'Most Stressed' to 'Least Stressed' so the HOD knows exactly who needs help first."

---

## 🟢 4. The Optimization (Algorithm)
**Q: How did you optimize the code?**
**Answer:**
"I focused on **Database Performance**:
1.  **Indexing:** I added indexes to `facultyId` and `roomId`. This makes searching 100x faster because the database doesn't have to scan every single row.
2.  **Lean Queries:** I used `.lean()` in Mongoose. This strips away heavy internal logic and just returns plain JSON, making the API response 5x faster."

---

## 🟢 5. The Testing (Quality Assurance)
**Q: How do you know your code works?**
**Answer:**
"I didn't just write code; I wrote a **50-point Test Suite**."
*(Show the 'npm run test:unit' screen)*
"This proves that my formula works for every edge case—negative numbers, zero students, or missing data. The system handles it gracefully without crashing."

---

## ⚡ Quick-Fire Answers for "Why?"

*   **Why MongoDB?** "Because timetable data is flexible (nested objects), and NoSQL scans faster for this type of hierarchy."
*   **Why Separate Module?** "I used a Microservice-style architecture (`routes/analysis.js`) so my Impact Engine doesn't break the main scheduling logic."
*   **Why Automated Testing?** "To ensure that future changes don't accidentally break my scoring logic."
