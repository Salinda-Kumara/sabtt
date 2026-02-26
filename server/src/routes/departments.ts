import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/departments
router.get('/', async (_req: Request, res: Response) => {
    try {
        const departments = await prisma.department.findMany({
            include: { _count: { select: { courses: true } } },
            orderBy: { name: 'asc' },
        });
        res.json(departments);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/departments
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, code, color } = req.body;
        const department = await prisma.department.create({
            data: { name, code, color: color || '#6366f1' },
        });
        req.app.get('io')?.emit('data-changed', { type: 'departments' });
        res.status(201).json(department);
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/departments/:id
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, code, color } = req.body;
        const department = await prisma.department.update({
            where: { id: req.params.id },
            data: { name, code, color },
        });
        req.app.get('io')?.emit('data-changed', { type: 'departments' });
        res.json(department);
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/departments/:id
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.department.delete({ where: { id: req.params.id } });
        req.app.get('io')?.emit('data-changed', { type: 'departments' });
        res.status(204).send();
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
