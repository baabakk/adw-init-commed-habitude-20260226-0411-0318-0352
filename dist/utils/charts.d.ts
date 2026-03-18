import { Completion } from '../data-store';
export interface ChartData {
    labels: string[];
    data: number[];
}
export declare function generateChartData(completions: Completion[]): ChartData;
