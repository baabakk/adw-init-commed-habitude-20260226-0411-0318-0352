import { Router } from 'express';
import { AppDataSource } from '../db/connection';
import { HabitCompletion } from '../db/models';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/:habitId', async (req: AuthenticatedRequest, res) => {
  const completionRepo = AppDataSource.getRepository(HabitCompletion);
  const days = Number(req.query.days || 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const completions = await completionRepo.find({
    where: {
      habit: { id: req.params.habitId, user: { id: req.user!.id } },
      completedAt: { $gte: since } as any
    },
    order: { completedAt: 'ASC' }
  });

  const data = completions.map((c) => ({ date: c.completedAt.toISOString().slice(0, 10), value: 1 }));
  res.json({ habitId: req.params.habitId, days, data });
});

export default router;
