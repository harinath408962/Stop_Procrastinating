const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Scheduled Function: Runs every 1 minute.
 * Checks all users' tasks and sends FCM notifications if a reminder is due.
 * 
 * Note: Requires 'Blaze' (Pay-as-you-go) plan on Firebase for Scheduled Functions.
 */
exports.checkReminders = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }); // Adjust TimeZone as needed

    console.log(`Running Check for ${currentTime}`);

    const usersSnapshot = await admin.firestore().collection('users').get();

    const notifications = [];

    usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.fcmToken || !data.tasks) return;

        const tasks = typeof data.tasks === 'string' ? JSON.parse(data.tasks) : data.tasks;
        const scheduled = data.scheduled ? (typeof data.scheduled === 'string' ? JSON.parse(data.scheduled) : data.scheduled) : [];

        // Logic similar to frontend checkAndSendNotifications
        const pending = [...tasks, ...scheduled].filter(task => {
            if (task.completed || !task.reminderTime) return false;
            if (task.reminderTime !== currentTime) return false;

            if (task.frequency === 'daily') return true;
            if (task.frequency === 'custom' && task.repeatDays && task.repeatDays.includes(currentDay)) return true;
            if (task.frequency === 'once') return true; // Simplified for backend
            return false;
        });

        if (pending.length > 0) {
            // Found tasks to notify
            pending.forEach(task => {
                const payload = {
                    notification: {
                        title: `Target: ${task.title || task.name}`,
                        body: task.smallStep ? `Step: ${task.smallStep}` : `Time to focus!`,
                    },
                    token: data.fcmToken
                };
                notifications.push(admin.messaging().send(payload));
            });
        }
    });

    await Promise.all(notifications);
    return null;
});
