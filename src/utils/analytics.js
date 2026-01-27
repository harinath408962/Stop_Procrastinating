import { auth, db } from './firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { getStorage, setStorage, STORAGE_KEYS } from './storage';

/**
 * Creates a standardized event object.
 * @param {string} eventType - The type of event (e.g., 'task_start', 'mood_update').
 * @param {object} payload - Additional data specific to the event.
 * @returns {object} The created event object.
 */
export const createEvent = (eventType, payload = {}) => {
    const now = new Date();

    let timeOfDay = 'night';
    // Use manual override if provided in payload
    if (payload.overrideTimeOfDay) {
        timeOfDay = payload.overrideTimeOfDay;
    } else {
        // Fallback to auto-calc
        const currentHour = now.getHours();
        if (currentHour >= 5 && currentHour < 12) timeOfDay = 'morning';
        else if (currentHour >= 12 && currentHour < 17) timeOfDay = 'afternoon';
        else if (currentHour >= 17 && currentHour < 21) timeOfDay = 'evening';
    }

    // Clean payload to remove the utility field from stored data if desired, 
    // but keeping it might be useful for debug. Let's keep distinct 'time_of_day' field.
    // We will remove 'overrideTimeOfDay' from the final payload object to avoid clutter.
    const { overrideTimeOfDay, ...cleanPayload } = payload;

    // Get current mood from storage for context
    const currentMood = getStorage(STORAGE_KEYS.USER_MOOD, 'neutral');

    return {
        event_id: crypto.randomUUID(),
        user_id: auth.currentUser ? auth.currentUser.uid : 'local_user',
        timestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        time_of_day: timeOfDay,
        event_type: eventType,
        mood_before: currentMood, // Snapshot mood at time of event
        payload: cleanPayload,
        synced: false
    };
};

/**
 * Logs an event to local storage and attempts to sync it.
 * @param {string} eventType 
 * @param {object} payload 
 */
export const logEvent = (eventType, payload) => {
    const event = createEvent(eventType, payload);
    const events = getStorage(STORAGE_KEYS.EVENT_LOG, []);
    events.push(event);
    setStorage(STORAGE_KEYS.EVENT_LOG, events);

    // Attempt sync silently
    syncEventsToCloud();
};

/**
 * Syncs unsynced events to Firestore.
 */
export const syncEventsToCloud = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const events = getStorage(STORAGE_KEYS.EVENT_LOG, []);
    const unsyncedEvents = events.filter(e => !e.synced);

    if (unsyncedEvents.length === 0) return;

    try {
        const batch = writeBatch(db);
        const eventsRef = collection(db, 'users', user.uid, 'events');

        unsyncedEvents.forEach(event => {
            // Use event_id as document ID for idempotency
            const docRef = doc(eventsRef, event.event_id);
            // We don't save 'synced: false' to cloud, obviously
            const { synced, ...eventData } = event;
            batch.set(docRef, eventData);
        });

        await batch.commit();

        // Mark as synced locally
        const updatedEvents = events.map(e => {
            if (unsyncedEvents.find(ue => ue.event_id === e.event_id)) {
                return { ...e, synced: true };
            }
            return e;
        });

        // Optimization: optionally prune old synced events here if list gets too long
        // For now, keep them for potential CSV export of full history from local
        setStorage(STORAGE_KEYS.EVENT_LOG, updatedEvents);
        console.log(`Synced ${unsyncedEvents.length} events to cloud.`);

    } catch (error) {
        console.error("Failed to sync events:", error);
    }
};
