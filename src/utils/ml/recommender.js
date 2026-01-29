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

    if (maxScore > 50) { // Threshold to ensure enough data
        const timeLabels = {
            morning: 'Morning (5AM - 12PM)',
            afternoon: 'Afternoon (12PM - 5PM)',
            evening: 'Evening (5PM - 9PM)',
            night: 'Night (9PM - 5AM)'
        };
        insights.push({
            type: 'productivity',
            text: `You are naturally most productive in the **${bestTime}**. Schedule your hardest tasks then! 🚀`,
            score: maxScore
        });
    }

    // --- Insight 2: Distraction Warning ---
    if (sortedTriggers.length > 0) {
        const topApp = sortedTriggers[0];

        // Find most dangerous time for distractions
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
                text: `Watch out for **${topApp.app}** in the ${worstTime}. It's your top distraction. 🛡️`,
                score: maxDist * 10
            });
        }
    }

    // --- Insight 3: Cold Start / Encouragement ---
    if (insights.length === 0) {
        return {
            type: 'neutral',
            text: "Keep logging work to unlock Smart Insights! 🧠"
        };
    }

    // Return the highest scoring insight (most relevant)
    // Or rotate them? Let's return the top one for now.
    return insights[0];
};
