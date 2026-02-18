/**
 * Notification Utility
 * Handles permission requests and sending system notifications.
 */

import { messaging, db, auth } from './firebase'; // Ensure db/auth imported
import { getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';

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

// --- Background Notification Setup ---
export const initializeBackgroundNotifications = async () => {
    if (!messaging) return; // Not supported

    try {
        const user = auth.currentUser;
        if (!user) return; // Need user to save token

        const permission = await requestNotificationPermission();
        if (permission) {
            const token = await getToken(messaging, {
                vapidKey: 'BC3s2k0hQN9HOIxnyTzaj5SZCT8E_5WMJ_VhnQxxlz0_DVbTNXAwE4k0kmyY_yhqKCTtdZf8NeZ5S3UsF_GxL2I' // Placeholder: User needs to generate this pair in Firebase Console
            }).catch(err => {
                console.warn("Failed to get FCM token. VAPID key likely missing or invalid.", err);
                return null;
            });

            if (token) {
                // Save token to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    fcmToken: token
                }, { merge: true });
                console.log("FCM Token saved to profile.");
            }
        }
    } catch (err) {
        console.error("Error initializing background notifications:", err);
    }
};
// -------------------------------------

export const sendNotification = (title, body, tag) => {
    if (Notification.permission === 'granted') {
        try {
            const handleNotificationClick = (n) => {
                n.onclick = (event) => {
                    event.preventDefault(); // Prevent browser default focus if needed
                    window.focus(); // Try to focus the tab/window
                    n.close();
                };
            };

            // Check if service worker is active for mobile support
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(title, {
                        body,
                        icon: '/vite.svg',
                        tag,
                        vibrate: [200, 100, 200],
                        data: { url: window.location.href } // Data for SW to handle click if implemented there
                    });
                });
            } else {
                const n = new Notification(title, {
                    body,
                    icon: '/vite.svg',
                    tag,
                    requireInteraction: true // Keep it on screen until user interacts
                });
                handleNotificationClick(n);
            }
        } catch (e) {
            console.error("Notification failed:", e);
        }
    }
};

import { getStorage, STORAGE_KEYS } from './storage';

/**
 * Checks for tasks due for reminder.
 * Should be called periodically (e.g., every minute).
 * 
 * @param {Array} tasks - Combined list of daily tasks and scheduled plans.
 * @returns {Array} - IDs of tasks that triggered a notification.
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

    // --- Prepare "Goal for Tomorrow" ---
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowLink = tomorrow.setHours(0, 0, 0, 0);

    // Get Scheduled Plans (Long term goals)
    const scheduled = getStorage(STORAGE_KEYS.SCHEDULED_TASKS, []);
    const tomorrowGoals = scheduled.filter(t => {
        if (!t.startDate || !t.dueDate) return false;
        const s = new Date(t.startDate).setHours(0, 0, 0, 0);
        const e = new Date(t.dueDate).setHours(0, 0, 0, 0);
        return tomorrowLink >= s && tomorrowLink <= e;
    });

    const tomorrowGoalText = tomorrowGoals.length > 0
        ? `\n📅 Tomorrow: ${tomorrowGoals[0].name}`
        : '';
    // -----------------------------------

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
                // Motivational Messages
                const motivations = [
                    "You got this! 💪",
                    "Success starts now. 🚀",
                    "Do it for your future self. ✨",
                    "Just 5 minutes. Go! ⏱️",
                    "Small steps, big results. 📈"
                ];
                const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];

                // Clear Goal Text + Tomorrow's Goal
                const title = `Target: ${task.title || task.name}`;
                const baseBody = task.smallStep
                    ? `Step: ${task.smallStep}\n${randomMotivation}`
                    : `Time to make progress.\n${randomMotivation}`;

                const finalBody = `${baseBody}${tomorrowGoalText}`;

                sendNotification(title, finalBody, task.id);
                triggered.push(task.id);
            }
        }
    });

    return triggered;
};
