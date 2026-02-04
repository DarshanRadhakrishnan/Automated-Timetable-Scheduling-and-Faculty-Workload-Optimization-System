require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const fs = require('fs');
const path = require('path');

const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Room = require('./models/Room');
const Section = require('./models/Section');
const TimeSlot = require('./models/TimeSlot');
const FacultyAvailability = require('./models/FacultyAvailability');

const seedDatabase = async () => {
    try {
        await connectDB();

        // Path to data.json
        // Adjust this path if your folder structure is different
        // Assuming timetable-backend-mern and timetable-backend are siblings
        const dataPath = path.join(__dirname, '..', 'timetable-backend', 'data.json');

        console.log(`Reading data from: ${dataPath}`);

        if (!fs.existsSync(dataPath)) {
            console.error('Error: data.json not found!');
            process.exit(1);
        }

        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);

        // Clear existing data
        await Faculty.deleteMany({});
        await Course.deleteMany({});
        await Room.deleteMany({});
        await Section.deleteMany({});
        await TimeSlot.deleteMany({});
        await FacultyAvailability.deleteMany({});

        console.log('Cleared existing data');

        // ---------------------------------------------------------
        // 1. Process Faculty
        // ---------------------------------------------------------
        // Using a Map to ensure uniqueness by name or ID
        const facultyMap = new Map();

        data.faculty_data.forEach(f => {
            if (!facultyMap.has(f.name)) {
                // Determine maxLoad based on designation if possible, else 18
                // data.json constraints say 18 for all
                facultyMap.set(f.name, {
                    name: f.name,
                    maxLoad: 18
                });
            }
        });

        // Convert Map to array and insert
        const facultyList = Array.from(facultyMap.values());
        const createdFaculties = await Faculty.insertMany(facultyList);
        console.log(`Created ${createdFaculties.length} faculties`);

        // ---------------------------------------------------------
        // 2. Process Courses
        // ---------------------------------------------------------
        // We will create separate entries for Theory and Lab components
        const courseList = [];
        const processedCourseCodes = new Set();

        // Helper to add course
        const addCourse = (name, type, hours) => {
            // Check for duplicates? The name might be "Course (Theory)" vs "Course (Lab)"
            // We can allow duplicates if they are different types or codes
            courseList.push({
                name: name,
                courseType: type,
                hoursPerWeek: hours
            });
        };

        // From Catalog
        data.course_catalog.forEach(c => {
            const courseName = `${c.course_name} (${c.course_code})`;

            // Theory Component
            if (c.hours_per_week && c.hours_per_week.lecture > 0) {
                addCourse(`${courseName} - Theory`, 'theory', c.hours_per_week.lecture);
            } else if (c.course_type && !c.course_type.toLowerCase().includes('lab') && c.credits.L > 0) {
                // Fallback if hours_per_week not explicit but credits exist
                addCourse(`${courseName} - Theory`, 'theory', c.credits.L || 3);
            }

            // Lab Component
            if (c.hours_per_week && c.hours_per_week.lab > 0) {
                addCourse(`${courseName} - Lab`, 'lab', c.hours_per_week.lab);
            } else if (c.lab_required) {
                addCourse(`${courseName} - Lab`, 'lab', c.lab_duration_slots || 2);
            }
        });

        // From Professional Electives (PE1, PE2)
        if (data.professional_electives) {
            ['PE1', 'PE2'].forEach(peKey => {
                if (data.professional_electives[peKey]) {
                    data.professional_electives[peKey].forEach(pe => {
                        const courseName = `${pe.course_name} (${pe.course_code})`;
                        // Assume theory for PEs unless stated
                        addCourse(`${courseName} - Elective`, 'theory', 3);
                    });
                }
            });
        }

        const createdCourses = await Course.insertMany(courseList);
        console.log(`Created ${createdCourses.length} courses`);

        // ---------------------------------------------------------
        // 3. Process Rooms
        // ---------------------------------------------------------
        const roomList = [];
        if (data.infrastructure && data.infrastructure.buildings) {
            data.infrastructure.buildings.forEach(b => {
                if (b.rooms) {
                    b.rooms.forEach(r => {
                        let rType = 'theory';
                        if (r.type && r.type.toLowerCase().includes('lab')) {
                            rType = 'lab';
                        }
                        // Also check lab_type field
                        if (r.lab_type) {
                            rType = 'lab';
                        }

                        roomList.push({
                            name: `${r.room_id} (${b.building_id})`,
                            capacity: r.capacity || 60,
                            roomType: rType
                        });
                    });
                }
            });
        }
        const createdRooms = await Room.insertMany(roomList);
        console.log(`Created ${createdRooms.length} rooms`);

        // ---------------------------------------------------------
        // 4. Process Sections
        // ---------------------------------------------------------
        const sectionList = data.student_sections.map(s => ({
            name: s.section_id,
            studentCount: s.total_students || 60
        }));
        const createdSections = await Section.insertMany(sectionList);
        console.log(`Created ${createdSections.length} sections`);

        // ---------------------------------------------------------
        // 5. TimeSlots
        // ---------------------------------------------------------
        // Create 5 days x 8 slots
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const slots = [1, 2, 3, 4, 5, 6, 7, 8];
        const timeslotList = [];
        for (const day of days) {
            for (const slot of slots) {
                timeslotList.push({ day, slot });
            }
        }
        const createdTimeslots = await TimeSlot.insertMany(timeslotList);
        console.log(`Created ${createdTimeslots.length} timeslots`);

        // ---------------------------------------------------------
        // 6. Faculty Availability
        // ---------------------------------------------------------
        // Default: All faculty available for all slots
        const availabilityRecords = [];
        for (const faculty of createdFaculties) {
            for (const timeslot of createdTimeslots) {
                availabilityRecords.push({
                    facultyId: faculty._id,
                    timeslotId: timeslot._id,
                    isAvailable: true,
                });
            }
        }
        await FacultyAvailability.insertMany(availabilityRecords);
        console.log(`Created ${availabilityRecords.length} availability records`);

        console.log('\n✅ Database seeded with REALISTIC data successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
