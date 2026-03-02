import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/buildings
router.get('/', async (_req: Request, res: Response) => {
    try {
        const buildings = await prisma.building.findMany({
            include: { rooms: true },
            orderBy: { name: 'asc' },
        });
        res.json(buildings);
    } catch (error) {
        console.error('Get buildings error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/buildings/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const building = await prisma.building.findUnique({
            where: { id: req.params.id as string },
            include: { rooms: { include: { schedules: { include: { course: { include: { department: true } }, lecturer: true } } } } },
        });
        if (!building) {
            res.status(404).json({ error: 'Building not found.' });
            return;
        }
        res.json(building);
    } catch (error) {
        console.error('Get building error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/buildings
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, abbreviation } = req.body;
        const building = await prisma.building.create({
            data: { name, abbreviation },
            include: { rooms: true },
        });
        req.app.get('io')?.emit('data-changed', { type: 'buildings' });
        res.status(201).json(building);
    } catch (error) {
        console.error('Create building error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/buildings/:id
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, abbreviation } = req.body;
        const building = await prisma.building.update({
            where: { id: req.params.id as string },
            data: { name, abbreviation },
            include: { rooms: true },
        });
        req.app.get('io')?.emit('data-changed', { type: 'buildings' });
        res.json(building);
    } catch (error) {
        console.error('Update building error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/buildings/:id
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.building.delete({ where: { id: req.params.id as string } });
        req.app.get('io')?.emit('data-changed', { type: 'buildings' });
        res.status(204).send();
    } catch (error) {
        console.error('Delete building error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
