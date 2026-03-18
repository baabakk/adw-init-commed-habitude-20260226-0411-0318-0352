import cron from 'node-cron';
import { habits } from './data-store';
import { sendSMSReminder } from './messaging/sms';
import { sendTelegramReminder } from './messaging/telegram';
import { sendWhatsAppReminder } from './messaging/whatsapp';

let scheduledJobs: cron.ScheduledTask[] = [];

export function scheduleReminders(): void {
  // Clear existing jobs
  scheduledJobs.forEach(job => job.stop());
  scheduledJobs = [];

  // Schedule new jobs based on habits
  habits.forEach(habit => {
    const [hour, minute] = habit.reminderTime.split(':').map(Number);
    
    // Use cron syntax: minute hour day-of-month month day-of-week
    const cronTime = `${minute} ${hour} * * *`;
    
    const job = cron.schedule(cronTime, () => {
      console.log(`Sending reminder for habit '${habit.name}' at ${habit.reminderTime}`);
      
      habit.reminderChannels.forEach(channel => {
        try {
          switch (channel) {
            case 'sms':
              sendSMSReminder(habit);
              break;
            case 'telegram':
              sendTelegramReminder(habit);
              break;
            case 'whatsapp':
              sendWhatsAppReminder(habit);
              break;
          }
        } catch (error) {
          console.error(`Failed to send ${channel} reminder for habit ${habit.id}:`, error);
        }
      });
    });
    
    scheduledJobs.push(job);
  });
  
  console.log(`Scheduled ${scheduledJobs.length} reminder jobs`);
}