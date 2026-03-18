import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './db/connection';
import { registerStreakHandlers } from './services/streakService';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

async function bootstrap(): Promise<void> {
  await initializeDatabase();
  registerStreakHandlers();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
