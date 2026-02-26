import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const today = new Date();
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const todayDay = days[today.getDay()];

        const [buildings, rooms, courses, lecturers, todayClasses] = await Promise.all([
            prisma.building.count(),
            prisma.room.count(),
            prisma.course.count(),
            prisma.lecturer.count(),
            prisma.scheduleEntry.findMany({
                where: { dayOfWeek: todayDay as any },
                include: {
                    course: { include: { department: true } },
                    room: { include: { building: true } },
                    lecturer: true,
                },
                orderBy: { startTime: 'asc' },
            }),
        ]);

        res.json({
            counts: { buildings, rooms, courses, lecturers, todayClasses: todayClasses.length },
            todaySchedule: todayClasses,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
