import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/courses
router.get('/', async (_req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: { department: true },
            orderBy: { code: 'asc' },
        });
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/courses
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, code, departmentId, classType } = req.body;
        const course = await prisma.course.create({
            data: { name, code, departmentId, classType: classType || 'LECTURE' },
            include: { department: true },
        });
        req.app.get('io')?.emit('data-changed', { type: 'courses' });
        res.status(201).json(course);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/courses/:id
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, code, departmentId, classType } = req.body;
        const course = await prisma.course.update({
            where: { id: req.params.id as string },
            data: { name, code, departmentId, classType },
            include: { department: true },
        });
        req.app.get('io')?.emit('data-changed', { type: 'courses' });
        res.json(course);
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/courses/:id
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.course.delete({ where: { id: req.params.id as string } });
        req.app.get('io')?.emit('data-changed', { type: 'courses' });
        res.status(204).send();
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
