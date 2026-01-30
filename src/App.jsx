import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MoodSelect from './pages/MoodSelect';
import TaskList from './pages/TaskList';
import AddTask from './pages/AddTask';
import TaskComplete from './pages/TaskComplete';
import Schedule from './pages/Schedule';
import Reflection from './pages/Reflection'; // v2
import DistractionLimiter from './pages/DistractionLimiter';
import Analysis from './pages/Analysis';
import SignIn from './pages/SignIn';

import Settings from './pages/Settings'; // v2
import { useEffect } from 'react';
import { auth } from './utils/firebase';
import { loadFromCloud } from './utils/storage';

function App() {
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // Auto-sync on app load/refresh if logged in
                loadFromCloud(user);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/mood" element={<MoodSelect />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/add-task" element={<AddTask />} />
                <Route path="/complete/:taskId" element={<TaskComplete />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/reflect" element={<Reflection />} />
                <Route path="/limit" element={<DistractionLimiter />} />
            </Routes>
        </HashRouter>
    )
}

export default App
