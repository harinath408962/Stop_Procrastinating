import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MoodSelect from './pages/MoodSelect';
import TaskList from './pages/TaskList';
import AddTask from './pages/AddTask';
import TaskComplete from './pages/TaskComplete';
import Schedule from './pages/Schedule';
import Reflection from './pages/Reflection';
import DistractionLimiter from './pages/DistractionLimiter';
import Analysis from './pages/Analysis';
import SignIn from './pages/SignIn';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/mood" element={<MoodSelect />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/add-task" element={<AddTask />} />
                <Route path="/complete/:taskId" element={<TaskComplete />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/reflect" element={<Reflection />} />
                <Route path="/limit" element={<DistractionLimiter />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
