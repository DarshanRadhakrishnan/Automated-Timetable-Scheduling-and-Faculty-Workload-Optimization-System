# Project Module Breakdown (Revised)

This document outlines the **5 Core Modules** of the **Automated Timetable Scheduling & Faculty Workload Optimization System**. This structure is designed to distribute development work effectively among team members.

## Module 1: Data Modeling & Frontend (Foundation)
**Focus:** The structural backbone (Database Schemas) and the user-facing interface.

*   **Key Components:**
    *   **Frontend:** `timetable-frontend/` (HTML, CSS, JS) - Forms for Faculty, Courses, Rooms.
    *   **Backend Models:** `models/Faculty.js`, `models/Course.js`, `models/Room.js`, `models/Section.js`, `models/TimeSlot.js`.
    *   **Routes:** Basic CRUD APIs (`routes/faculty.js`, `routes/course.js` etc.)
*   **Responsibilities:**
    *   Designing the database schema to store college resources.
    *   Building the UI for users to input data.
    *   Visualizing the final timetable grid on the frontend.

## Module 2: Generation & Ranking (The Core Engine)
**Focus:** The intelligent algorithm that creates the timetable.

*   **Key Components:**
    *   **Service:** `services/timetableGenerator.js`
    *   **Route:** `routes/timetable.js` (Generation endpoint)
    *   **Logic:**
        *   **Ranking System:** Logic to calculate "Fitness Score" (Workload balance, Gaps, Compactness).
        *   **Hard Constraints:** Ensuring no double bookings during initial generation.
*   **Responsibilities:**
    *   Generating multiple valid timetable candidates.
    *   Scoring each candidate based on optimization criteria (e.g., preference for fewer gaps).
    *   Selecting and saving the best schedule.

## Module 3: Conflict Detection & Resolution (Safety Net)
**Focus:** Ensuring integrity and fixing issues post-generation.

*   **Key Components:**
    *   **Service:** `services/conflictDetector.js`, `services/conflictResolver.js`
    *   **Route:** `conflicts/` endpoints.
    *   **Model:** `models/Conflict.js`.
*   **Responsibilities:**
    *   Running a secondary check to catch any overlaps missed by the generator.
    *   Providing a mechanism to *automatically resolve* simple conflicts (e.g., swapping two classes).
    *   Logging unresolved conflicts for manual review.

## Module 4: Dynamic Rescheduling (Adaptability)
**Focus:** Handling real-world changes during the semester.

*   **Key Components:**
    *   **Service:** `services/reschedulingService.js` (Functions: `findSubstitutes`, `findAlternativeRooms`)
    *   **Route:** `routes/rescheduling.js` (Endpoints: `/check-faculty-leave`, `/check-room-maintenance`)
*   **Responsibilities:**
    *   Processing requests like "Faculty X is on leave today".
    *   Finding available substitute teachers who are free in that specific slot.
    *   Locating empty rooms if a assigned room becomes unavailable (e.g., maintenance).
    *   Rescheduling classes due to unexpected holidays.

## Module 5: Impact Analysis & Optimization Strategies (Intelligence)
**Focus:** Advanced analytics and long-term improvements.

*   **Key Components:**
    *   **Service:** Analysis logic within `reschedulingService.js` and `timetableGenerator.js` (Scoring details).
    *   **Logic:**
        *   Analyzing "Workload Balance" (Standard Deviation of faculty hours).
        *   Suggesting "Make-up Slots" for cancelled classes.
*   **Responsibilities:**
    *   Calculating how a single change (e.g., one leave request) ripples through the schedule (Cascading effects).
    *   Providing data on resource utilization (e.g., "Room 101 is used 90% of the time, Room 102 only 10%").
    *   Implementing the "Make-up Class" strategy to ensure curriculum completion.
