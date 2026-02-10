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
        // Define faculty with email and department
        const facultyData = [
            { name: 'Dr. V Ananthanarayanan', email: 'v_ananthanarayanan@cb.amrita.edu', department: 'B Tech CSE' },
            { name: 'Ms. P. Malathy', email: 'p_malathy@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Dr. A. Baskar', email: 'a_baskar@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Ms. Divya Singh', email: 's_divya2@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Dr. Vishnuvarthan R', email: 'r_vishnuvarthan@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Ms. E. Kuladevy', email: 'e_kuladevy@cb.amrita.edu', department: 'CIR' },
            { name: 'Dr. Raghu Pradeep Nair', email: 'pn_raghu@cb.amrita.edu', department: 'CIR' },
            { name: 'Ms. Anitha M', email: 'm_anitha@cb.amrita.edu', department: 'CIR' },
            { name: 'Dr. Nikhil Raj P', email: 'pp_nikhilraj@cb.amrita.edu', department: 'B.Tech CHE' },
            { name: 'Mr. Sumesh A K', email: 'ak_sumesh@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Dr. Swapna T R', email: 'tr_swapna@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Dr. Thangavel S', email: 's_thangavel@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Dr. M. Anbazhagan', email: 'm_anbazhagan@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Mr. V. Dayanand', email: 'v_dayanand@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Dr. Ramraj T', email: 't_ramraj@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Ms. Bindu K R', email: 'j_bindu@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Ms. Nayana', email: 'i_nayana@cb.amrita.edu', department: 'Office of Head - Research' },
            { name: 'Ms. D. Bharathi', email: 'd_bharathi@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Dr. T. Senthil Kumar', email: 't_senthilkumar@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Mr. Vedaj J. Padman', email: 'jp_vedaj@cb.amrita.edu', department: 'B.Tech CSE' },
            { name: 'Ms. G. Radhika', email: 'g_radhika@cb.amrita.edu', department: 'B.Tech CSE' }
        ];

        const facultyList = facultyData.map(f => ({
            name: f.name,
            email: f.email,
            department: f.department,
            maxLoad: 18
        }));

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
        // ---------------------------------------------------------
        // 5. TimeSlots
        // ---------------------------------------------------------
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        // Define the specific time mappings
        const slotDefinitions = [
            { slot: 1, start: '8:00 AM', end: '8:50 AM' },
            { slot: 2, start: '8:50 AM', end: '9:40 AM' },
            { slot: 3, start: '9:40 AM', end: '10:30 AM' },
            // Break 10:30-10:45
            { slot: 4, start: '10:45 AM', end: '11:35 AM' },
            { slot: 5, start: '11:35 AM', end: '12:25 PM' },
            { slot: 6, start: '12:25 PM', end: '1:15 PM' },
            // Lunch 1:15-2:05
            { slot: 7, start: '2:05 PM', end: '2:55 PM' },
            { slot: 8, start: '2:55 PM', end: '3:45 PM' },
            { slot: 9, start: '3:45 PM', end: '4:35 PM' },
            { slot: 10, start: '4:35 PM', end: '5:25 PM' },
            { slot: 11, start: '5:25 PM', end: '6:15 PM' }
        ];

        const timeslotList = [];
        for (const day of days) {
            for (const def of slotDefinitions) {
                timeslotList.push({
                    day,
                    slot: def.slot,
                    startTime: def.start,
                    endTime: def.end
                });
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
