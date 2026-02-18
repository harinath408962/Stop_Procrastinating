/**
 * Notification Utility
 * Handles permission requests and sending system notifications.
 */

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendNotification = (title, body, tag) => {
    if (Notification.permission === 'granted') {
        try {
            // Check if service worker is active for mobile support, fallback to standard
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(title, {
                        body,
                        icon: '/vite.svg', // Verify this path exists or use a default
                        tag, // Use tag to prevent duplicate notifications if needed
                        vibrate: [200, 100, 200]
                    });
                });
            } else {
                new Notification(title, {
                    body,
                    icon: '/vite.svg',
                    tag
                });
            }
        } catch (e) {
            console.error("Notification failed:", e);
        }
    }
};

/**
 * Checks for tasks due for reminder.
 * Should be called periodically (e.g., every minute).
 * 
 * @param {Array} tasks - Combined list of daily tasks and scheduled plans.
 * @returns {Array} - IDs of tasks that triggered a notification (to update lastNotified state if needed, though simpler to just rely on minute precision).
 */
export const checkAndSendNotifications = (tasks) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // We use a simple localStorage key to avoid double-firing in the same minute 
    // if the hook runs multiple times (React StrictMode etc)
    const lastRunKey = 'sp_last_notification_check';
    const lastRun = localStorage.getItem(lastRunKey);

    // If we already checked this minute, skip.
    if (lastRun === currentTime) return [];

    localStorage.setItem(lastRunKey, currentTime);

    const triggered = [];

    tasks.forEach(task => {
        if (task.completed) return; // Don't notify for completed tasks
        if (!task.reminderTime) return; // No reminder set

        // 1. Check Time Match
        if (task.reminderTime === currentTime) {

            // 2. Check Frequency Match
            let shouldNotify = false;

            if (task.frequency === 'daily') {
                shouldNotify = true;
            } else if (task.frequency === 'custom' && task.repeatDays && Array.isArray(task.repeatDays)) {
                if (task.repeatDays.includes(currentDay)) {
                    shouldNotify = true;
                }
            } else if (task.frequency === 'once') {
                // For 'once', usually we'd match the specific date too. 
                // But simplified for now: if it's a daily task, "once" might mean just today?
                // Or if it's a scheduled task with a startDate/dueDate?

                // Let's assume for Daily Tasks "Once" means just today.
                // For Scheduled Tasks, they are active between startDate and dueDate.

                const today = new Date().setHours(0, 0, 0, 0);

                if (task.startDate && task.dueDate) {
                    const s = new Date(task.startDate).setHours(0, 0, 0, 0);
                    const e = new Date(task.dueDate).setHours(0, 0, 0, 0);
                    if (today >= s && today <= e) shouldNotify = true;
                } else {
                    // It's a daily task created today? Or just allow it if it exists.
                    shouldNotify = true;
                }
            }

            if (shouldNotify) {
                sendNotification(
                    "Time to focus! 🎯",
                    `Reminder: ${task.title || task.name}`,
                    task.id
                );
                triggered.push(task.id);
            }
        }
    });

    return triggered;
};
