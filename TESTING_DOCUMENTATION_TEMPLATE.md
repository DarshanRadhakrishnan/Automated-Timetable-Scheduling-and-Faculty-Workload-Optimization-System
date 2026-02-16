# **Chapter 5: System Testing and Validation**

## **5.1 Testing Overview**
To ensure the reliability and stability of the *Automated Timetable Scheduling System*, a comprehensive testing strategy was implemented. The testing phase focused on validating the core logic of the Impact Analysis module, ensuring data integrity across API endpoints, and verifying the system's robustness under various scenarios.

We utilized a **Test-Driven Development (TDD)** approach, where tests were written to define the expected behavior of the system before final deployment. The testing suite consists of:
1.  **Unit Tests:** To verify individual functions and algorithmic logic in isolation.
2.  **Integration Tests:** To verify the interaction between the API, the backend server, and the MongoDB database.

---

## **5.2 Test Environment Setup**
The testing environment was configured using industry-standard tools to simulate a production-grade deployment:
*   **Testing Framework:** Jest (v29.x) for running test suites and assertions.
*   **API Testing Tool:** Supertest for simulating HTTP requests to the Express.js server.
*   **Database:** A localized MongoDB instance (`127.0.0.1:27017`) was used to ensure data isolation during testing.
*   **CI/CD Simulation:** Automated scripts (`npm run test:unit`, `npm run test:integration`) were created to streamline the execution process.

---

## **5.3 Unit Testing (Logic Verification)**
Unit testing focused on the `Analysis Engine`, specifically validating the *Impact Score Calculation* and *Severity Classification* algorithms.

**Objective:** Ensure that the mathematical formulas for workload analysis are accurate and handle edge cases (e.g., zero students, decimals) correctly.

**Execution:**
The unit tests were executed using the command:
`npm run test:unit`

**Results:**
*   **Total Tests:** 50
*   **Passed:** 50 (100%)
*   **Failed:** 0

**[INSERT SCREENSHOT 1 HERE]**
*Figure 5.1: Terminal output showing 50 passing Unit Tests for Impact Analysis logic.*

---

## **5.4 Integration Testing (API & Database)**
Integration testing verified the end-to-end functionality of the API endpoints, ensuring they correctly receive data, interact with MongoDB, and return the expected JSON responses.

**Objective:** Validate the three core analysis endpoints:
*   `POST /api/analysis/faculty-impact`: Checks faculty workload and returns recommendations.
*   `POST /api/analysis/room-shortage`: Finds alternative rooms for overbooked slots.
*   `POST /api/analysis/bulk-faculty`: Scans the entire department for critical risks.

**Execution:**
The integration tests were executed against a live test database using the command:
`npm run test:integration`

**Results:**
*   **Total Tests:** 17
*   **Passed:** 17 (100%)
*   **Failed:** 0

**[INSERT SCREENSHOT 2 HERE]**
*Figure 5.2: Terminal output showing 17 passing Integration Tests connecting to MongoDB.*

---

## **5.5 Detailed Test Coverage Report**
To provide a visual summary of the system's health, an automated HTML report was generated. This report details the code coverage, indicating that over **94%** of the codebase is covered by tests.

**[INSERT SCREENSHOT 3 HERE]**
*Figure 5.3: Automated HTML Test Report Dashboard showing 100% Pass Rate and High Code Coverage.*

---

## **5.6 Conclusion of Testing**
The testing phase confirmed that the **Automated Timetable System** is stable, accurate, and ready for deployment. The strict validation of the Impact Analysis module ensures that the system provides reliable recommendations to administrators, with zero known critical bugs at the time of this report.
