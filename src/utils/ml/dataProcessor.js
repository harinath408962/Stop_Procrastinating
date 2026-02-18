/**
 * ML Data Processor
 * Analyzes raw user data to find patterns in productivity and distractions.
 */

export const analyzeProductivityByTime = (tasks, workLogs) => {
    // Buckets: Morning (5-12), Afternoon (12-17), Evening (17-21), Night (21-5)
    const buckets = {
        morning: { attempts: 0, completed: 0, totalMinutes: 0, score: 0 },
        afternoon: { attempts: 0, completed: 0, totalMinutes: 0, score: 0 },
        evening: { attempts: 0, completed: 0, totalMinutes: 0, score: 0 },
        night: { attempts: 0, completed: 0, totalMinutes: 0, score: 0 }
    };

    const getTimeOfDay = (dateStr) => {
        const hour = new Date(dateStr).getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    };

    // 0. Filter for Last 30 Days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.setHours(0, 0, 0, 0);

    const isRecent = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr).getTime() >= cutoff;
    };

    // 1. Analyze Tasks
    tasks.forEach(task => {
        if (!task.completedAt) return;
        if (!isRecent(task.completedAt)) return; // Filter

        const bucket = getTimeOfDay(task.completedAt);
        buckets[bucket].attempts++;
        buckets[bucket].completed++; // Completed tasks count as success
        buckets[bucket].totalMinutes += (parseInt(task.timeTaken) || 0);
    });

    // 2. Analyze Work Logs
    workLogs.forEach(log => {
        if (!isRecent(log.date)) return; // Filter

        const bucket = getTimeOfDay(log.date);
        buckets[bucket].attempts++;
        buckets[bucket].completed++; // Logs are essentially completed sessions
        buckets[bucket].totalMinutes += (parseInt(log.duration) || 0);
    });

    // Calculate "Productivity Score" per bucket
    // Simple heuristic: Total Minutes * 1 + Completion Count * 10
    Object.keys(buckets).forEach(key => {
        const b = buckets[key];
        b.score = (b.totalMinutes) + (b.completed * 10);
    });

    return buckets;
};

export const analyzeDistractionTriggers = (distractionLogs) => {
    const triggers = {}; // { "Instagram": 5, "YouTube": 2 }
    const timePatterns = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    // 0. Filter for Last 30 Days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.setHours(0, 0, 0, 0);

    distractionLogs.forEach(log => {
        if (!log.date) return;
        if (new Date(log.date).getTime() < cutoff) return; // Filter

        // App frequency
        triggers[log.app] = (triggers[log.app] || 0) + 1;

        // Time correlation
        const hour = new Date(log.date).getHours();
        let bucket = 'night';
        if (hour >= 5 && hour < 12) bucket = 'morning';
        else if (hour >= 12 && hour < 17) bucket = 'afternoon';
        else if (hour >= 17 && hour < 21) bucket = 'evening';

        timePatterns[bucket]++;
    });

    // Sort triggers by frequency
    const sortedTriggers = Object.entries(triggers)
        .sort(([, a], [, b]) => b - a)
        .map(([app, count]) => ({ app, count }));

    return { sortedTriggers, timePatterns };
};

export const calculateCompletionRate = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
};
