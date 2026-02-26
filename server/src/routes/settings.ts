import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminOnly, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/settings
router.get('/', async (_req: Request, res: Response) => {
    try {
        const settings = await prisma.setting.findMany();
        const settingsMap: Record<string, string> = {};
        settings.forEach((s) => { settingsMap[s.key] = s.value; });
        res.json(settingsMap);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/settings
router.put('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const settings = req.body as Record<string, string>;
        for (const [key, value] of Object.entries(settings)) {
            await prisma.setting.upsert({
                where: { key },
                create: { key, value },
                update: { value },
            });
        }
        req.app.get('io')?.emit('settings-changed');
        res.json({ success: true });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
