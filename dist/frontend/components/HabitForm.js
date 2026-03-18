"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HabitForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function HabitForm({ onSubmit }) {
    const [name, setName] = (0, react_1.useState)('');
    const [goal, setGoal] = (0, react_1.useState)('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim())
            return;
        await onSubmit({ name: name.trim(), goal: goal.trim() || undefined });
        setName('');
        setGoal('');
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Create Habit" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "row", children: [(0, jsx_runtime_1.jsx)("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Habit name", required: true }), (0, jsx_runtime_1.jsx)("input", { value: goal, onChange: (e) => setGoal(e.target.value), placeholder: "Goal (optional)" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Add Habit" })] })] }));
}
