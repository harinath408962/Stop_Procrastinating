/**
 * Smart Recommender Engine
 * Generates actionable insights based on processed user data.
 */
import { analyzeProductivityByTime, analyzeDistractionTriggers } from './dataProcessor';
import { getStorage, STORAGE_KEYS } from '../storage';

export const generateSmartInsight = () => {
    const tasks = getStorage(STORAGE_KEYS.TASKS, []);
    const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);
    const workLogs = getStorage(STORAGE_KEYS.WORK_LOGS, []);
    const distLogs = getStorage(STORAGE_KEYS.DISTRACTION_LOGS, []);

    // Combine all task-like work
    const allWork = [...tasks, ...scheduled];

    // 1. Run Analysis
    const productivityMap = analyzeProductivityByTime(allWork, workLogs);
    const { sortedTriggers, timePatterns } = analyzeDistractionTriggers(distLogs);

    const insights = [];

    // --- Insight 1: Peak Productivity Time ---
    let bestTime = 'morning';
    let maxScore = -1;

    Object.entries(productivityMap).forEach(([time, data]) => {
        if (data.score > maxScore) {
            maxScore = data.score;
            bestTime = time;
        }
    });

    if (maxScore > 50) {
        const timeLabels = {
            morning: 'Morning (5AM - 12PM)',
            afternoon: 'Afternoon (12PM - 5PM)',
            evening: 'Evening (5PM - 9PM)',
            night: 'Night (9PM - 5AM)'
        };
        insights.push({
            type: 'success',
            title: '✨ Peak Performance',
            text: `You are naturally most productive in the **${bestTime}**. Schedule your hardest tasks then!`,
        });
    }

    // --- Insight 2: Distraction Warning ---
    if (sortedTriggers.length > 0) {
        const topApp = sortedTriggers[0];
        let worstTime = 'night';
        let maxDist = -1;
        Object.entries(timePatterns).forEach(([time, count]) => {
            if (count > maxDist) {
                maxDist = count;
                worstTime = time;
            }
        });

        if (maxDist > 2) {
            insights.push({
                type: 'warning',
                title: '⚠️ Distraction Alert',
                text: `Watch out for **${topApp.app}** in the ${worstTime}. It's your top distraction.`,
            });
        }
    }

    // --- Insight 3: Recent Trend (Last 3 Days) ---
    // Simple check on points momentum
    // (This would require daily history, simplifying for V1 to use current session streak or similar if available)
    // For now, let's use a generic encouragement if empty
    if (insights.length < 2) {
        insights.push({
            type: 'info',
            title: '💡 Tip',
            text: "Log more work and distractions to unlock deeper insights into your habits."
        });
    }

    return insights;
};
