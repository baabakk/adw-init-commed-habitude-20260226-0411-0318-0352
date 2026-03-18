import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Unique
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: 'UTC' })
  timezone!: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  telegramChatId?: string;

  @Column({ nullable: true })
  whatsappNumber?: string;

  @OneToMany(() => Habit, (habit) => habit.user)
  habits!: Habit[];
}

@Entity()
@Unique(['user', 'name'])
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.habits, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  name!: string;

  @Column({ nullable: true })
  goal?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  currentStreak!: number;

  @OneToMany(() => HabitCompletion, (completion) => completion.habit)
  completions!: HabitCompletion[];

  @OneToMany(() => Reminder, (reminder) => reminder.habit)
  reminders!: Reminder[];
}

@Entity()
export class HabitCompletion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Habit, (habit) => habit.completions, { onDelete: 'CASCADE' })
  habit!: Habit;

  @CreateDateColumn()
  completedAt!: Date;
}

@Entity()
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Habit, (habit) => habit.reminders, { onDelete: 'CASCADE' })
  habit!: Habit;

  @Column()
  time!: string;

  @Column({ default: 'daily' })
  frequency!: string;

  @Column({ default: 'sms' })
  channel!: 'sms' | 'telegram' | 'whatsapp';
}
