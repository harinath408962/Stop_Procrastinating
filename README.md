# Stop Procrastinating

An intelligent, empathetic anti-procrastination assistant designed to help you overcome inertia, build momentum, and track your progress.

![Stop Procrastinating App Screenshot](https://via.placeholder.com/800x400?text=Stop+Procrastinating+App+Preview)

## 🚀 Key Features

*   **🎯 Start Small Philosophy**: overcoming the initial resistance by breaking tasks into "2-minute micro-steps".
*   **🎭 Mood-Based Productivity**: Filter and select tasks based on your current state (Focused, Low Energy, or Bored).
*   **☁️ Cloud Sync & Backup**: Seamlessly sync your data across devices using Google Sign-In (powered by Firebase).
*   **🔥 Gamification**: Earn "Focus Points" and build daily streaks to stay motivated.
*   **🛡️ Distraction Limiter**: Set firm intentions before visiting distracting sites.
*   **📊 Insights & Analysis**: Visualize your work vs. procrastination habits over time.
*   **📅 Planning Hub**: Manage daily commitments and schedule future tasks to reduce anxiety.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite
*   **Styling**: Plain CSS with Modern Design Variables, `lucide-react` for icons
*   **Backend / Auth**: Firebase Authentication, Cloud Firestore
*   **Persistence**: LocalStorage (offline-first) + Cloud Sync

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/harinath408962/Stop_Procrastinating.git
    cd Stop_Procrastinating
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🔧 Configuration (Firebase)

To enable Cloud Sync, this project requires a Firebase configuration.
Create a file at `src/utils/firebase.js` with your keys:

```javascript
import { initializeApp } from "firebase/app";
// ... content of config
```

> **Note**: The current repo comes with a pre-configured `firebase.js`.

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
