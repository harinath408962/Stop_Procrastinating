import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const STORAGE_KEYS = {
    USER_MOOD: 'sp_user_mood',
    TASKS: 'sp_tasks',
    SCHEDULED_TASKS: 'sp_scheduled_tasks',
    DISTRACTION_LOGS: 'sp_distraction_logs',
    WORK_LOGS: 'sp_work_logs',
    REFLECTIONS: 'sp_daily_reflections',
    USER_STATS: 'sp_user_stats'
};

const syncToCloud = async (key, value) => {
    const user = auth.currentUser;
    if (!user) return; // Not logged in, local only

    try {
        const userRef = doc(db, "users", user.uid);
        // We sync by updating the specific field in the user document
        // Mapping keys to cloud fields:
        const fieldMap = {
            [STORAGE_KEYS.TASKS]: 'tasks',
            [STORAGE_KEYS.SCHEDULED_TASKS]: 'scheduled',
            [STORAGE_KEYS.REFLECTIONS]: 'reflections',
            [STORAGE_KEYS.USER_STATS]: 'stats',
            [STORAGE_KEYS.USER_MOOD]: 'mood'
        };

        const cloudField = fieldMap[key];
        if (cloudField) {
            // Store complex objects as JSON strings to avoid Firestore mapping issues/costs with deep indexing if not needed
            // Or store as objects? detailed SignIn.jsx used JSON.stringify. Let's stick to that for consistency v1.
            const dataToSave = typeof value === 'object' ? JSON.stringify(value) : value;
            await setDoc(userRef, { [cloudField]: dataToSave }, { merge: true });
            console.log(`Synced ${key} to cloud.`);
        }
    } catch (err) {
        console.error("Cloud sync failed:", err);
    }
};

export const getStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from storage:`, error);
        return defaultValue;
    }
};

export const setStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        // Trigger Cloud Sync
        syncToCloud(key, value);
    } catch (error) {
        console.error(`Error writing ${key} to storage:`, error);
    }
};

export const updateStreak = () => {
    const today = new Date().toDateString();
    let stats = getStorage(STORAGE_KEYS.USER_STATS, {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null
    });

    if (stats.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (stats.lastActiveDate === yesterday.toDateString()) {
            stats.currentStreak += 1;
        } else if (stats.lastActiveDate === null) {
            stats.currentStreak = 1; // First day
        } else {
            // Streak broken, or missed a day. 
            // Logic: if last active was not yesterday, reset.
            // But let's check if it's strictly > 1 day gap.
            const last = new Date(stats.lastActiveDate);
            const diffTime = Math.abs(new Date(today) - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                stats.currentStreak = 1;
            }
        }

        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }

        stats.lastActiveDate = today;
        setStorage(STORAGE_KEYS.USER_STATS, stats);
    }
    return stats;
};

export const addPoints = (amount) => {
    let stats = getStorage(STORAGE_KEYS.USER_STATS, {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null
    });

    // Ensure streak is up to date usually called before this, but safe to call here? 
    // Usually points come from tasks, so activity is confirmed.

    stats.totalPoints += amount;
    setStorage(STORAGE_KEYS.USER_STATS, stats);
    return stats;
}
