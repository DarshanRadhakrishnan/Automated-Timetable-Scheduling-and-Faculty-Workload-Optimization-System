# 🧪 Impact Analysis Module - Test Execution Guide

**Project:** Automated Timetable Scheduling & Faculty Workload Optimization  
**Module:** Intelligent Impact Analysis System  
**Date:** February 16, 2026  
**Test Status:** 🟢 **PASSED (100%)**

---

## 📋 1. Executive Summary of Testing
We have successfully implemented and tested the **Impact Analysis Engines** using a strict "Test-Driven Development" (TDD) approach. 

| **Test Category** | **Purpose** | **Result** |
| :--- | :--- | :--- |
| **Unit Testing** | Verifies the *logic* (Formula accuracy, Severity rules) | ✅ **50/50 Passed** |
| **Integration Testing** | Verifies the *API & Database* (Data retrieval, JSON structure) | ✅ **17/17 Passed** |
| **System Stability** | Verifies the *Deployment* (Startup scripts, Database connection) | ✅ **Stable** |

---

## 🚀 2. How to Demonstrate Testing (Step-by-Step)
Use this script when showing your project to an evaluator or faculty.

### **Step A: Show the Logic Validation (Unit Tests)**
*Explain: "First, verified that our critical impact formulas work in isolation, handling all edge cases like zero students or invalid inputs."*

**Command to Run:**
```bash
npm run test:unit
```
**What to Show:**
- Scroll through the compilation of **50 passing tests**.
- Point out specific tests like:
  - `√ should calculate correctly with updated weights`
  - `√ should return CRITICAL for score > 75`
  - `√ CRITICAL should mention Dean/emergency`

### **Step B: Show the System Integration (API Tests)**
*Explain: "Next, I tested the API endpoints to ensure they correctly talk to the MongoDB database and return the right JSON data."*

**Command to Run:**
```bash
npm run test:integration
```
**What to Show:**
- The **17 passing tests**.
- Highlight that it connects to the **Live Test Database** (`127.0.0.1`).
- Show that it validates real scenarios like:
  - `POST /api/analysis/faculty-impact`
  - `POST /api/analysis/room-shortage`

### **Step C: Show the Final Report**
*Explain: "Finally, I generated a professional HTML report to document the 100% success rate."*

**Action:**
1. Go to your project folder.
2. Open **`test-report.html`**.
3. Show the **Green "100% Passed" Dashboard**.

---

## 🧠 3. Understanding the Test Results (For Q&A)

### **Q: How is the "Impact Score" calculated?**
**Formula:** `(Total Classes × 2) + (Total Students ÷ 20)`
- **Logic:** We assign a weight of **2** to every class and divide student load by **20** to normalize the score out of 100.
- **Example:** 10 Classes + 100 Students = `(10*2) + (100/20)` = **25 (Safe)**.

### **Q: What determines a "Critical" Status?**
- **Critical (Red):** Score > 75
- **High (Yellow):** Score > 45
- **Medium (Green):** Score ≤ 45
*Note: These thresholds were calibrated during testing to avoid false alarms.*

### **Q: What happens if the Database is down?**
- The **Integration Tests** are designed to fail fast (5 seconds timeout) if the database is unreachable, ensuring we know immediately if there's an infrastructure issue.

---

## 🛠️ 4. Troubleshooting
If tests fail during presentation:

1. **"Connection Refused" Error:**
   - Run `start-mongodb.bat` manually to ensure the database is active.
   
2. **"Timeout" Error:**
   - The test suite has been configured with a **30-second timeout** to accommodate slower computers. Just re-run the command.

---
**Signed off by:** Development Team  
**Verified by:** Automated Jest Testing Suite
