"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const HabitForm_1 = __importDefault(require("./components/HabitForm"));
const HabitList_1 = __importDefault(require("./components/HabitList"));
const ProgressChart_1 = __importDefault(require("./components/ProgressChart"));
const ReminderSettings_1 = __importDefault(require("./components/ReminderSettings"));
const apiClient_1 = require("./utils/apiClient");
function App() {
    const [habits, setHabits] = (0, react_1.useState)([]);
    const [chartData, setChartData] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)('');
    const loadHabits = async () => {
        try {
            const data = await apiClient_1.apiClient.get('/habits');
            setHabits(data);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load habits');
        }
    };
    (0, react_1.useEffect)(() => {
        if (!localStorage.getItem('token')) {
            localStorage.setItem('token', 'dev-token');
        }
        void loadHabits();
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Habitude" }), error ? (0, jsx_runtime_1.jsx)("div", { className: "card", style: { color: '#b91c1c' }, children: error }) : null, (0, jsx_runtime_1.jsx)(HabitForm_1.default, { onSubmit: async (payload) => { await apiClient_1.apiClient.post('/habits', payload); await loadHabits(); } }), (0, jsx_runtime_1.jsx)(ReminderSettings_1.default, { habits: habits, onCreate: async (payload) => {
                    await apiClient_1.apiClient.post('/reminders', payload);
                } }), (0, jsx_runtime_1.jsx)(HabitList_1.default, { habits: habits, onComplete: async (habitId) => {
                    await apiClient_1.apiClient.post(`/habits/${habitId}/complete`, {});
                    await loadHabits();
                }, onSelect: async (habitId) => {
                    const progress = await apiClient_1.apiClient.get(`/progress/${habitId}`);
                    setChartData(progress.chartData);
                } }), (0, jsx_runtime_1.jsx)(ProgressChart_1.default, { data: chartData })] }));
}
