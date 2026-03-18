"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HabitList;
const jsx_runtime_1 = require("react/jsx-runtime");
function HabitList({ habits, onComplete, onSelect }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Your Habits" }), habits.length === 0 ? (0, jsx_runtime_1.jsx)("p", { children: "No habits yet." }) : null, habits.map((habit) => ((0, jsx_runtime_1.jsxs)("div", { className: "row", style: { justifyContent: 'space-between', marginBottom: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: habit.name }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, color: '#6b7280' }, children: habit.goal || 'No goal set' }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12 }, children: ["\uD83D\uDD25 Streak: ", habit.currentStreak] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => onSelect(habit.id), children: "View Progress" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => onComplete(habit.id), children: "Complete Today" })] })] }, habit.id)))] }));
}
