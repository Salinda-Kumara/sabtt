import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/rooms
router.get('/', async (_req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany({
            include: { building: true },
            orderBy: [{ building: { name: 'asc' } }, { name: 'asc' }],
        });
        res.json(rooms);
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/rooms
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, buildingId, capacity } = req.body;
        const room = await prisma.room.create({
            data: { name, buildingId, capacity: capacity || 30 },
            include: { building: true },
        });
        req.app.get('io')?.emit('data-changed', { type: 'rooms' });
        res.status(201).json(room);
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/rooms/:id
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, buildingId, capacity } = req.body;
        const room = await prisma.room.update({
            where: { id: req.params.id },
            data: { name, buildingId, capacity },
            include: { building: true },
        });
        req.app.get('io')?.emit('data-changed', { type: 'rooms' });
        res.json(room);
    } catch (error) {
        console.error('Update room error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/rooms/:id
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.room.delete({ where: { id: req.params.id } });
        req.app.get('io')?.emit('data-changed', { type: 'rooms' });
        res.status(204).send();
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
