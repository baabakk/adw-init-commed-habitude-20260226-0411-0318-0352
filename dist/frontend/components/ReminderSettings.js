"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReminderSettings;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function ReminderSettings({ habits, onCreate }) {
    const [habitId, setHabitId] = (0, react_1.useState)('');
    const [timeOfDay, setTimeOfDay] = (0, react_1.useState)('08:00');
    const [frequency, setFrequency] = (0, react_1.useState)('daily');
    const [channels, setChannels] = (0, react_1.useState)(['sms']);
    const toggleChannel = (channel) => {
        setChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
    };
    const submit = async (e) => {
        e.preventDefault();
        if (!habitId || channels.length === 0)
            return;
        await onCreate({ habitId, timeOfDay, frequency, channels });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Reminder Settings" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: submit, className: "row", children: [(0, jsx_runtime_1.jsxs)("select", { value: habitId, onChange: (e) => setHabitId(e.target.value), required: true, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select habit" }), habits.map((h) => ((0, jsx_runtime_1.jsx)("option", { value: h.id, children: h.name }, h.id)))] }), (0, jsx_runtime_1.jsx)("input", { type: "time", value: timeOfDay, onChange: (e) => setTimeOfDay(e.target.value) }), (0, jsx_runtime_1.jsxs)("select", { value: frequency, onChange: (e) => setFrequency(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "daily", children: "Daily" }), (0, jsx_runtime_1.jsx)("option", { value: "weekdays", children: "Weekdays" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: channels.includes('sms'), onChange: () => toggleChannel('sms') }), " SMS"] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: channels.includes('telegram'), onChange: () => toggleChannel('telegram') }), " Telegram"] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: channels.includes('whatsapp'), onChange: () => toggleChannel('whatsapp') }), " WhatsApp"] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Save Reminder" })] })] }));
}
