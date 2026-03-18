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
exports.Reminder = exports.HabitCompletion = exports.Habit = exports.User = void 0;
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
    (0, typeorm_1.Column)({ default: 'UTC' }),
    __metadata("design:type", String)
], User.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "telegramChatId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "whatsappNumber", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Habit, (habit) => habit.user),
    __metadata("design:type", Array)
], User.prototype, "habits", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
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
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Habit.prototype, "goal", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Habit.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Habit.prototype, "currentStreak", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HabitCompletion, (completion) => completion.habit),
    __metadata("design:type", Array)
], Habit.prototype, "completions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Reminder, (reminder) => reminder.habit),
    __metadata("design:type", Array)
], Habit.prototype, "reminders", void 0);
exports.Habit = Habit = __decorate([
    (0, typeorm_1.Entity)(),
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
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HabitCompletion.prototype, "completedAt", void 0);
exports.HabitCompletion = HabitCompletion = __decorate([
    (0, typeorm_1.Entity)()
], HabitCompletion);
let Reminder = class Reminder {
};
exports.Reminder = Reminder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Reminder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Habit, (habit) => habit.reminders, { onDelete: 'CASCADE' }),
    __metadata("design:type", Habit)
], Reminder.prototype, "habit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Reminder.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'daily' }),
    __metadata("design:type", String)
], Reminder.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'sms' }),
    __metadata("design:type", String)
], Reminder.prototype, "channel", void 0);
exports.Reminder = Reminder = __decorate([
    (0, typeorm_1.Entity)()
], Reminder);
