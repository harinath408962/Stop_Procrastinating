# Backend Guide for Background Notifications

To enable notifications even when the app is closed, you need to deploy the "Backend Part" (Cloud Functions).

## Prerequisites
1.  **Firebase Project**: You must be the owner of the Firebase project.
2.  **Blaze Plan**: Scheduled Cloud Functions require the **Blaze (Pay as you go)** plan. It is free for small usage but requires a credit card.

## Steps to Deploy

1.  **Install Firebase Tools** (if not installed):
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase**:
    ```bash
    firebase login
    ```

3.  **Initialize Functions** (if needed, but code is already provided in `functions/`):
    - Ensure you are in the root directory.
    - Run `firebase init functions` and select "Use existing files".

4.  **Install Dependencies**:
    ```bash
    cd functions
    npm install
    ```

5.  **Deploy**:
    ```bash
    cd ..
    firebase deploy --only functions
    ```

## Frontend Configuration
The frontend is already configured to request a "Background Token" and save it to your profile.
However, you need to generate a "VAPID Key" in the Firebase Console:
1.  Go to Project Settings > Cloud Messaging.
2.  Under "Web configuration", generate a Key pair.
3.  Copy the Key and replace `'BM6_GgqGq_GqGqGq'` in `src/utils/notifications.js` with your actual key.
