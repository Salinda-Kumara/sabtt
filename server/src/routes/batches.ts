import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/batches
router.get('/', async (_req: Request, res: Response) => {
    try {
        const batches = await prisma.batch.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(batches);
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/batches
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, color } = req.body;
        const batch = await prisma.batch.create({
            data: { name, color: color || '#3b82f6' },
        });
        req.app.get('io')?.emit('data-changed', { type: 'batches' });
        res.status(201).json(batch);
    } catch (error: any) {
        console.error('Create batch error:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Batch name already exists.' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/batches/:id
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, color } = req.body;
        const batch = await prisma.batch.update({
            where: { id: req.params.id as string },
            data: { name, color },
        });
        req.app.get('io')?.emit('data-changed', { type: 'batches' });
        res.json(batch);
    } catch (error: any) {
        console.error('Update batch error:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Batch name already exists.' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/batches/:id
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.batch.delete({ where: { id: req.params.id as string } });
        req.app.get('io')?.emit('data-changed', { type: 'batches' });
        res.status(204).send();
    } catch (error) {
        console.error('Delete batch error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
