"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChartData = generateChartData;
/**
 * Generates chart data for the past 30 days
 */
function generateChartData(completions) {
    const today = new Date();
    const labels = [];
    const data = [];
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Format as YYYY-MM-DD
        const dateStr = date.toISOString().split('T')[0];
        // Format for display (M/D)
        const month = date.getMonth() + 1;
        const day = date.getDate();
        labels.push(`${month}/${day}`);
        // Count completions for this day
        const completed = completions.some(c => c.date === dateStr) ? 1 : 0;
        data.push(completed);
    }
    return { labels, data };
}
