"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingEventLog = exports.Streak = exports.ReminderSchedule = exports.HabitCompletion = exports.Habit = exports.User = void 0;
const typeorm_1 = require("typeorm");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "telegramId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "whatsappNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', default: '' }),
    __metadata("design:type", Array)
], User.prototype, "preferredChannels", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'UTC' }),
    __metadata("design:type", String)
], User.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Habit, (habit) => habit.user),
    __metadata("design:type", Array)
], User.prototype, "habits", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
let Habit = class Habit {
};
exports.Habit = Habit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Habit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User, (user) => user.habits, { onDelete: 'CASCADE' }),
    __metadata("design:type", User)
], Habit.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Habit.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Habit.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Habit.prototype, "goal", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '0 8 * * *' }),
    __metadata("design:type", String)
], Habit.prototype, "reminderSchedule", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Habit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Habit.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HabitCompletion, (completion) => completion.habit),
    __metadata("design:type", Array)
], Habit.prototype, "completions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ReminderSchedule, (schedule) => schedule.habit),
    __metadata("design:type", Array)
], Habit.prototype, "reminderSchedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Streak, (streak) => streak.habit),
    __metadata("design:type", Array)
], Habit.prototype, "streaks", void 0);
exports.Habit = Habit = __decorate([
    (0, typeorm_1.Entity)('habits'),
    (0, typeorm_1.Unique)(['user', 'name'])
], Habit);
let HabitCompletion = class HabitCompletion {
};
exports.HabitCompletion = HabitCompletion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], HabitCompletion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Habit, (habit) => habit.completions, { onDelete: 'CASCADE' }),
    __metadata("design:type", Habit)
], HabitCompletion.prototype, "habit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], HabitCompletion.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], HabitCompletion.prototype, "completed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HabitCompletion.prototype, "createdAt", void 0);
exports.HabitCompletion = HabitCompletion = __decorate([
    (0, typeorm_1.Entity)('habit_completions'),
    (0, typeorm_1.Index)(['habit', 'date'], { unique: true })
], HabitCompletion);
let ReminderSchedule = class ReminderSchedule {
};
exports.ReminderSchedule = ReminderSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReminderSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Habit, (habit) => habit.reminderSchedules, { onDelete: 'CASCADE' }),
    __metadata("design:type", Habit)
], ReminderSchedule.prototype, "habit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ReminderSchedule.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ReminderSchedule.prototype, "cronExpression", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'UTC' }),
    __metadata("design:type", String)
], ReminderSchedule.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], ReminderSchedule.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ReminderSchedule.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ReminderSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ReminderSchedule.prototype, "updatedAt", void 0);
exports.ReminderSchedule = ReminderSchedule = __decorate([
    (0, typeorm_1.Entity)('reminder_schedules')
], ReminderSchedule);
let Streak = class Streak {
};
exports.Streak = Streak;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Streak.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Habit, (habit) => habit.streaks, { onDelete: 'CASCADE' }),
    __metadata("design:type", Habit)
], Streak.prototype, "habit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Streak.prototype, "currentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], Streak.prototype, "lastCompletedDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Streak.prototype, "updatedAt", void 0);
exports.Streak = Streak = __decorate([
    (0, typeorm_1.Entity)('streaks'),
    (0, typeorm_1.Index)(['habit'], { unique: true })
], Streak);
let MessagingEventLog = class MessagingEventLog {
};
exports.MessagingEventLog = MessagingEventLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MessagingEventLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MessagingEventLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MessagingEventLog.prototype, "habitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], MessagingEventLog.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MessagingEventLog.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], MessagingEventLog.prototype, "attempt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MessagingEventLog.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MessagingEventLog.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MessagingEventLog.prototype, "createdAt", void 0);
exports.MessagingEventLog = MessagingEventLog = __decorate([
    (0, typeorm_1.Entity)('messaging_event_logs')
], MessagingEventLog);
