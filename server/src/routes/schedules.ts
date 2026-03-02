import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/schedules
router.get('/', async (req: Request, res: Response) => {
    try {
        const { dayOfWeek, roomId, buildingId } = req.query;
        const where: any = {};
        if (dayOfWeek) where.dayOfWeek = dayOfWeek;
        if (roomId) where.roomId = roomId;
        if (buildingId) where.room = { buildingId };

        const schedules = await prisma.scheduleEntry.findMany({
            where,
            include: {
                course: { include: { department: true } },
                room: { include: { building: true } },
                lecturer: true,
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
        res.json(schedules);
    } catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/schedules/by-building
router.get('/by-building', async (_req: Request, res: Response) => {
    try {
        const buildings = await prisma.building.findMany({
            include: {
                rooms: {
                    include: {
                        schedules: {
                            include: {
                                course: { include: { department: true } },
                                lecturer: true,
                            },
                            orderBy: { startTime: 'asc' },
                        },
                    },
                    orderBy: { name: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        });
        res.json(buildings);
    } catch (error) {
        console.error('Get schedules by building error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/schedules
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, roomId, lecturerId, dayOfWeek, startTime, endTime, batch, weekNumber, sessionMode } = req.body;

        // Check conflicts
        const conflicts = await checkConflicts({ roomId, lecturerId, dayOfWeek, startTime, endTime });
        if (conflicts.length > 0) {
            res.status(409).json({ error: 'Schedule conflict detected.', conflicts });
            return;
        }

        const entry = await prisma.scheduleEntry.create({
            data: { courseId, roomId, lecturerId, dayOfWeek, startTime, endTime, batch: batch || '', weekNumber: weekNumber || 1, sessionMode: sessionMode || 'PHYSICAL' },
            include: {
                course: { include: { department: true } },
                room: { include: { building: true } },
                lecturer: true,
            },
        });
        req.app.get('io')?.emit('schedule-changed', entry);
        res.status(201).json(entry);
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/schedules/:id
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, roomId, lecturerId, dayOfWeek, startTime, endTime, batch, weekNumber, sessionMode } = req.body;

        // Check conflicts (exclude current entry)
        const conflicts = await checkConflicts({ roomId, lecturerId, dayOfWeek, startTime, endTime }, req.params.id as string);
        if (conflicts.length > 0) {
            res.status(409).json({ error: 'Schedule conflict detected.', conflicts });
            return;
        }

        const entry = await prisma.scheduleEntry.update({
            where: { id: req.params.id as string },
            data: { courseId, roomId, lecturerId, dayOfWeek, startTime, endTime, batch: batch || '', weekNumber: weekNumber || 1, sessionMode: sessionMode || 'PHYSICAL' },
            include: {
                course: { include: { department: true } },
                room: { include: { building: true } },
                lecturer: true,
            },
        });
        req.app.get('io')?.emit('schedule-changed', entry);
        res.json(entry);
    } catch (error) {
        console.error('Update schedule error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/schedules/:id
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.scheduleEntry.delete({ where: { id: req.params.id as string } });
        req.app.get('io')?.emit('schedule-changed', { deleted: req.params.id });
        res.status(204).send();
    } catch (error) {
        console.error('Delete schedule error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Helper: Check for scheduling conflicts
async function checkConflicts(
    entry: { roomId: string; lecturerId: string; dayOfWeek: string; startTime: string; endTime: string },
    excludeId?: string
) {
    const conflicts: string[] = [];
    const where: any = {
        dayOfWeek: entry.dayOfWeek,
        startTime: { lt: entry.endTime },
        endTime: { gt: entry.startTime },
    };
    if (excludeId) where.id = { not: excludeId };

    // Room conflict
    const roomConflict = await prisma.scheduleEntry.findFirst({
        where: { ...where, roomId: entry.roomId },
        include: { course: true, room: true },
    });
    if (roomConflict) {
        conflicts.push(`Room ${roomConflict.room.name} is already booked for ${roomConflict.course.name} at ${roomConflict.startTime}-${roomConflict.endTime}`);
    }

    // Lecturer conflict
    const lecturerConflict = await prisma.scheduleEntry.findFirst({
        where: { ...where, lecturerId: entry.lecturerId },
        include: { course: true, lecturer: true },
    });
    if (lecturerConflict) {
        conflicts.push(`${lecturerConflict.lecturer.name} is already scheduled for ${lecturerConflict.course.name} at ${lecturerConflict.startTime}-${lecturerConflict.endTime}`);
    }

    return conflicts;
}

export default router;
