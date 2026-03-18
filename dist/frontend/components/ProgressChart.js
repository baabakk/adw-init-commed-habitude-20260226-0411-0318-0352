"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgressChart;
const jsx_runtime_1 = require("react/jsx-runtime");
const recharts_1 = require("recharts");
function ProgressChart({ data }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h2", { children: "30-Day Progress" }), (0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: 260 }, children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: data, children: [(0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "date", hide: true }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { domain: [0, 1], ticks: [0, 1] }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, {}), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "completed", stroke: "#2563eb", strokeWidth: 2, dot: false })] }) }) })] }));
}
