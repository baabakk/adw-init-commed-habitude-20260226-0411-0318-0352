import express from 'express';
import cors from 'cors';
import habitRoutes from './routes/habitRoutes';
import reminderRoutes from './routes/reminderRoutes';
import progressRoutes from './routes/progressRoutes';
import { authMiddleware } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api/reminders', authMiddleware, reminderRoutes);
app.use('/api/progress', authMiddleware, progressRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
