import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/lecturers
router.get('/', async (_req: Request, res: Response) => {
    try {
        const lecturers = await prisma.lecturer.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(lecturers);
    } catch (error) {
        console.error('Get lecturers error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/lecturers
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, contact, profilePic } = req.body;
        const lecturer = await prisma.lecturer.create({
            data: { name, email, contact: contact || null, profilePic: profilePic || null },
        });
        req.app.get('io')?.emit('data-changed', { type: 'lecturers' });
        res.status(201).json(lecturer);
    } catch (error) {
        console.error('Create lecturer error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/lecturers/:id
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, contact, profilePic } = req.body;
        const lecturer = await prisma.lecturer.update({
            where: { id: req.params.id as string },
            data: { name, email, contact: contact || null, profilePic: profilePic || null },
        });
        req.app.get('io')?.emit('data-changed', { type: 'lecturers' });
        res.json(lecturer);
    } catch (error) {
        console.error('Update lecturer error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/lecturers/:id
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.lecturer.delete({ where: { id: req.params.id as string } });
        req.app.get('io')?.emit('data-changed', { type: 'lecturers' });
        res.status(204).send();
    } catch (error) {
        console.error('Delete lecturer error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
