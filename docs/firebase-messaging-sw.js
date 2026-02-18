// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyCO5r-8hPDpEJD2qY2llWyf_gAQXVlu4CU",
    authDomain: "stop-procrastinating-9ffaf.firebaseapp.com",
    projectId: "stop-procrastinating-9ffaf",
    storageBucket: "stop-procrastinating-9ffaf.firebasestorage.app",
    messagingSenderId: "270312713724",
    appId: "1:270312713724:web:98e212793206ff87511679",
    measurementId: "G-KYLVPZXV20"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body, // The body will allow us to show "Goal for tomorrow"
        icon: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});
