import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const STORAGE_KEYS = {
    USER_MOOD: 'sp_user_mood',
    TASKS: 'sp_tasks',
    SCHEDULED_TASKS: 'sp_scheduled_tasks',
    DISTRACTION_LOGS: 'sp_distraction_logs',
    WORK_LOGS: 'sp_work_logs',
    REFLECTIONS: 'sp_daily_reflections',
    USER_STATS: 'sp_user_stats',
    EVENT_LOG: 'sp_event_log'
};

const syncToCloud = async (key, value, silent = false) => {
    const user = auth.currentUser;
    if (!user) return; // Not logged in, local only

    try {
        const userRef = doc(db, "users", user.uid);

        // Dispatch Start Event
        if (!silent) window.dispatchEvent(new CustomEvent('sp-sync-start'));

        // We sync by updating the specific field in the user document
        // Mapping keys to cloud fields:
        const fieldMap = {
            [STORAGE_KEYS.TASKS]: 'tasks',
            [STORAGE_KEYS.SCHEDULED_TASKS]: 'scheduled',
            [STORAGE_KEYS.REFLECTIONS]: 'reflections',
            [STORAGE_KEYS.USER_STATS]: 'stats',
            [STORAGE_KEYS.USER_MOOD]: 'mood',
            [STORAGE_KEYS.DISTRACTION_LOGS]: 'distractions',
            [STORAGE_KEYS.WORK_LOGS]: 'work_logs'
        };

        const cloudField = fieldMap[key];
        if (cloudField) {
            // Store complex objects as JSON strings to avoid Firestore mapping issues/costs with deep indexing if not needed
            const dataToSave = typeof value === 'object' ? JSON.stringify(value) : value;
            await setDoc(userRef, { [cloudField]: dataToSave }, { merge: true });
            console.log(`Synced ${key} to cloud.`);

            // Dispatch Success Event
            if (!silent) window.dispatchEvent(new CustomEvent('sp-sync-success'));
        }
    } catch (err) {
        console.error("Cloud sync failed:", err);
        // Dispatch Error Event
        if (!silent) window.dispatchEvent(new CustomEvent('sp-sync-error', { detail: err }));
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
            // Streak broken? No, user requested "no need to be consistent"
            // So we just increment simply if it's a new day effectively tracking "Total Active Days"
            stats.currentStreak += 1;
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
};

export const clearAllStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    // Also clear user name if stored separately
    localStorage.removeItem('sp_user_name');
};

export const forceSyncAll = async () => {
    const user = auth.currentUser;
    if (!user) return;

    window.dispatchEvent(new CustomEvent('sp-sync-start'));

    try {
        const promises = Object.values(STORAGE_KEYS).map(async key => {
            const val = getStorage(key);
            if (val !== null) {
                // Reuse the internal logic if possible, but since it's not exported and scope issues...
                // actually we can just call setStorage(key, val) but that might trigger individual events.
                // Better to duplicate the raw syncToCloud call logic or make syncToCloud accept a 'silent' flag?
                // Or just loop and call syncToCloud logic directly since we are in the same module.
                // Wait, syncToCloud IS defined in this scope.
                await syncToCloud(key, val, true);
            }
        });

        await Promise.all(promises);
        window.dispatchEvent(new CustomEvent('sp-sync-success'));
        return true;
    } catch (error) {
        console.error("Force sync failed:", error);
        window.dispatchEvent(new CustomEvent('sp-sync-error', { detail: error }));
        return false;
    }
};
