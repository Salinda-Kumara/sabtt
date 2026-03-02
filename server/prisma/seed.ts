import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.scheduleEntry.deleteMany();
    await prisma.course.deleteMany();
    await prisma.lecturer.deleteMany();
    await prisma.department.deleteMany();
    await prisma.room.deleteMany();
    await prisma.building.deleteMany();
    await prisma.user.deleteMany();
    await prisma.setting.deleteMany();

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: {
            email: 'admin@university.edu',
            password: hashedPassword,
            name: 'System Admin',
            role: 'ADMIN',
        },
    });
    console.log('  ✅ Admin user created (admin@university.edu / admin123)');

    // Buildings
    const engBuilding = await prisma.building.create({
        data: { name: 'Engineering Building', abbreviation: 'ENG' },
    });
    const sciBuilding = await prisma.building.create({
        data: { name: 'Science Complex', abbreviation: 'SCI' },
    });
    const artBuilding = await prisma.building.create({
        data: { name: 'Arts & Humanities', abbreviation: 'ART' },
    });
    console.log('  ✅ 3 Buildings created');

    // Rooms
    const rooms = await Promise.all([
        prisma.room.create({ data: { name: 'E101', buildingId: engBuilding.id, capacity: 120 } }),
        prisma.room.create({ data: { name: 'E201', buildingId: engBuilding.id, capacity: 60 } }),
        prisma.room.create({ data: { name: 'E305 Lab', buildingId: engBuilding.id, capacity: 40 } }),
        prisma.room.create({ data: { name: 'S101', buildingId: sciBuilding.id, capacity: 100 } }),
        prisma.room.create({ data: { name: 'S202', buildingId: sciBuilding.id, capacity: 50 } }),
        prisma.room.create({ data: { name: 'S310 Lab', buildingId: sciBuilding.id, capacity: 35 } }),
        prisma.room.create({ data: { name: 'A101', buildingId: artBuilding.id, capacity: 80 } }),
        prisma.room.create({ data: { name: 'A205', buildingId: artBuilding.id, capacity: 45 } }),
        prisma.room.create({ data: { name: 'A301', buildingId: artBuilding.id, capacity: 30 } }),
        prisma.room.create({ data: { name: 'E401', buildingId: engBuilding.id, capacity: 200 } }),
    ]);
    console.log('  ✅ 10 Rooms created');

    // Departments
    const csDept = await prisma.department.create({
        data: { name: 'Computer Science', code: 'CS', color: '#6366f1' },
    });
    const eeDept = await prisma.department.create({
        data: { name: 'Electrical Engineering', code: 'EE', color: '#f59e0b' },
    });
    const phDept = await prisma.department.create({
        data: { name: 'Physics', code: 'PH', color: '#10b981' },
    });
    const enDept = await prisma.department.create({
        data: { name: 'English Literature', code: 'EN', color: '#ec4899' },
    });
    console.log('  ✅ 4 Departments created');

    // Lecturers
    const lecturers = await Promise.all([
        prisma.lecturer.create({ data: { name: 'Dr. Sarah Chen', email: 'schen@university.edu' } }),
        prisma.lecturer.create({ data: { name: 'Prof. James Wilson', email: 'jwilson@university.edu' } }),
        prisma.lecturer.create({ data: { name: 'Dr. Maria Garcia', email: 'mgarcia@university.edu' } }),
        prisma.lecturer.create({ data: { name: 'Prof. Robert Kim', email: 'rkim@university.edu' } }),
        prisma.lecturer.create({ data: { name: 'Dr. Emily Thompson', email: 'ethompson@university.edu' } }),
        prisma.lecturer.create({ data: { name: 'Prof. David Brown', email: 'dbrown@university.edu' } }),
        prisma.lecturer.create({ data: { name: 'Dr. Lisa Anderson', email: 'landerson@university.edu' } }),
        prisma.lecturer.create({ data: { name: 'Prof. Michael Davis', email: 'mdavis@university.edu' } }),
    ]);
    console.log('  ✅ 8 Lecturers created');

    // Courses
    const courses = await Promise.all([
        prisma.course.create({ data: { name: 'Data Structures & Algorithms', code: 'CS201', departmentId: csDept.id, classType: 'LECTURE' } }),
        prisma.course.create({ data: { name: 'Database Systems', code: 'CS301', departmentId: csDept.id, classType: 'LECTURE' } }),
        prisma.course.create({ data: { name: 'Software Engineering Lab', code: 'CS305L', departmentId: csDept.id, classType: 'LAB' } }),
        prisma.course.create({ data: { name: 'Circuit Analysis', code: 'EE201', departmentId: eeDept.id, classType: 'LECTURE' } }),
        prisma.course.create({ data: { name: 'Digital Electronics', code: 'EE301', departmentId: eeDept.id, classType: 'LECTURE' } }),
        prisma.course.create({ data: { name: 'Electronics Lab', code: 'EE305L', departmentId: eeDept.id, classType: 'LAB' } }),
        prisma.course.create({ data: { name: 'Classical Mechanics', code: 'PH201', departmentId: phDept.id, classType: 'LECTURE' } }),
        prisma.course.create({ data: { name: 'Quantum Physics', code: 'PH301', departmentId: phDept.id, classType: 'LECTURE' } }),
        prisma.course.create({ data: { name: 'Physics Lab', code: 'PH205L', departmentId: phDept.id, classType: 'LAB' } }),
        prisma.course.create({ data: { name: 'Shakespeare Studies', code: 'EN201', departmentId: enDept.id, classType: 'LECTURE' } }),
        prisma.course.create({ data: { name: 'Creative Writing', code: 'EN301', departmentId: enDept.id, classType: 'TUTORIAL' } }),
        prisma.course.create({ data: { name: 'Modern Poetry', code: 'EN202', departmentId: enDept.id, classType: 'LECTURE' } }),
    ]);
    console.log('  ✅ 12 Courses created');

    // Schedule entries (Monday through Friday)
    const scheduleData = [
        // Monday
        { courseIdx: 0, roomIdx: 0, lecturerIdx: 0, day: 'MONDAY', start: '08:00', end: '10:00' },
        { courseIdx: 3, roomIdx: 1, lecturerIdx: 2, day: 'MONDAY', start: '08:00', end: '10:00' },
        { courseIdx: 6, roomIdx: 3, lecturerIdx: 4, day: 'MONDAY', start: '09:00', end: '11:00' },
        { courseIdx: 9, roomIdx: 6, lecturerIdx: 6, day: 'MONDAY', start: '10:00', end: '12:00' },
        { courseIdx: 1, roomIdx: 0, lecturerIdx: 1, day: 'MONDAY', start: '13:00', end: '15:00' },
        { courseIdx: 4, roomIdx: 1, lecturerIdx: 3, day: 'MONDAY', start: '13:00', end: '15:00' },
        { courseIdx: 7, roomIdx: 3, lecturerIdx: 5, day: 'MONDAY', start: '14:00', end: '16:00' },
        // Tuesday
        { courseIdx: 2, roomIdx: 2, lecturerIdx: 0, day: 'TUESDAY', start: '09:00', end: '12:00' },
        { courseIdx: 5, roomIdx: 5, lecturerIdx: 2, day: 'TUESDAY', start: '09:00', end: '12:00' },
        { courseIdx: 8, roomIdx: 5, lecturerIdx: 4, day: 'TUESDAY', start: '13:00', end: '16:00' },
        { courseIdx: 10, roomIdx: 7, lecturerIdx: 6, day: 'TUESDAY', start: '10:00', end: '12:00' },
        { courseIdx: 11, roomIdx: 8, lecturerIdx: 7, day: 'TUESDAY', start: '14:00', end: '16:00' },
        // Wednesday
        { courseIdx: 0, roomIdx: 0, lecturerIdx: 0, day: 'WEDNESDAY', start: '08:00', end: '10:00' },
        { courseIdx: 3, roomIdx: 1, lecturerIdx: 2, day: 'WEDNESDAY', start: '10:00', end: '12:00' },
        { courseIdx: 6, roomIdx: 3, lecturerIdx: 4, day: 'WEDNESDAY', start: '08:00', end: '10:00' },
        { courseIdx: 9, roomIdx: 6, lecturerIdx: 6, day: 'WEDNESDAY', start: '13:00', end: '15:00' },
        { courseIdx: 1, roomIdx: 9, lecturerIdx: 1, day: 'WEDNESDAY', start: '14:00', end: '16:00' },
        { courseIdx: 4, roomIdx: 1, lecturerIdx: 3, day: 'WEDNESDAY', start: '14:00', end: '16:00' },
        // Thursday
        { courseIdx: 2, roomIdx: 2, lecturerIdx: 0, day: 'THURSDAY', start: '09:00', end: '12:00' },
        { courseIdx: 5, roomIdx: 5, lecturerIdx: 2, day: 'THURSDAY', start: '09:00', end: '12:00' },
        { courseIdx: 7, roomIdx: 3, lecturerIdx: 5, day: 'THURSDAY', start: '10:00', end: '12:00' },
        { courseIdx: 10, roomIdx: 7, lecturerIdx: 6, day: 'THURSDAY', start: '14:00', end: '16:00' },
        { courseIdx: 11, roomIdx: 8, lecturerIdx: 7, day: 'THURSDAY', start: '10:00', end: '12:00' },
        // Friday
        { courseIdx: 0, roomIdx: 0, lecturerIdx: 0, day: 'FRIDAY', start: '09:00', end: '11:00' },
        { courseIdx: 3, roomIdx: 1, lecturerIdx: 2, day: 'FRIDAY', start: '09:00', end: '11:00' },
        { courseIdx: 6, roomIdx: 3, lecturerIdx: 4, day: 'FRIDAY', start: '10:00', end: '12:00' },
        { courseIdx: 1, roomIdx: 0, lecturerIdx: 1, day: 'FRIDAY', start: '13:00', end: '15:00' },
        { courseIdx: 4, roomIdx: 1, lecturerIdx: 3, day: 'FRIDAY', start: '13:00', end: '15:00' },
        { courseIdx: 8, roomIdx: 5, lecturerIdx: 4, day: 'FRIDAY', start: '13:00', end: '16:00' },
        { courseIdx: 9, roomIdx: 6, lecturerIdx: 6, day: 'FRIDAY', start: '14:00', end: '16:00' },
    ];

    for (const entry of scheduleData) {
        await prisma.scheduleEntry.create({
            data: {
                courseId: courses[entry.courseIdx].id,
                roomId: rooms[entry.roomIdx].id,
                lecturerId: lecturers[entry.lecturerIdx].id,
                dayOfWeek: entry.day as any,
                startTime: entry.start,
                endTime: entry.end,
            },
        });
    }
    console.log(`  ✅ ${scheduleData.length} Schedule entries created`);

    // Settings
    await prisma.setting.createMany({
        data: [
            { key: 'universityName', value: 'University of Technology' },
            { key: 'displayInterval', value: '15' },
        ],
    });
    console.log('  ✅ Settings initialized');

    console.log('\n🎉 Seed complete!');
    console.log('   Login: admin@university.edu / admin123');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
