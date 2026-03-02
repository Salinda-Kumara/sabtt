export interface Building {
    id: string;
    name: string;
    abbreviation: string;
    rooms: Room[];
    createdAt: string;
    updatedAt: string;
}

export interface Room {
    id: string;
    name: string;
    buildingId: string;
    building: Building;
    capacity: number;
    schedules?: ScheduleEntry[];
    createdAt: string;
    updatedAt: string;
}

export interface Department {
    id: string;
    name: string;
    code: string;
    color: string;
    _count?: { courses: number };
    createdAt: string;
    updatedAt: string;
}

export interface Batch {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface Lecturer {
    id: string;
    name: string;
    email: string;
    contact?: string;
    profilePic?: string;
    createdAt: string;
    updatedAt: string;
}

export type ClassType = 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type SessionMode = 'PHYSICAL' | 'ONLINE' | 'HYBRID';

export interface Course {
    id: string;
    name: string;
    code: string;
    departmentId: string;
    department: Department;
    classType: ClassType;
    createdAt: string;
    updatedAt: string;
}

export interface ScheduleEntry {
    id: string;
    courseId: string;
    course: Course;
    roomId: string;
    room: Room;
    lecturerId: string;
    lecturer: Lecturer;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    batch: string;
    weekNumber: number;
    sessionMode: SessionMode;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'VIEWER';
}

export interface DashboardStats {
    counts: {
        buildings: number;
        rooms: number;
        courses: number;
        lecturers: number;
        todayClasses: number;
    };
    todaySchedule: ScheduleEntry[];
}

export interface BuildingWithSchedules extends Building {
    rooms: (Room & {
        schedules: (ScheduleEntry & {
            course: Course & { department: Department };
            lecturer: Lecturer;
        })[];
    })[];
}
