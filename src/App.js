import Header from './Header';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; 
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import KanbanBoard from "./components/KanbanBoard";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import UserManagement from './UserManagement';

function App() {
  return (
    <Router>
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/" element={<KanbanBoard />} />

    </Routes>
</Router>
  );
}

export default App;
