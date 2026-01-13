
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Mood from './pages/Mood';
import Routine from './pages/Routine';
import Gratitude from './pages/Gratitude';
import GoalSetting from './pages/GoalSetting';
import Journal from './pages/Journal';
import Therapy from './pages/Therapy';
import Emergency from './pages/Emergency';
import Settings from './pages/Settings';
import { dbService } from './services/dbService';
import { UserAccount, Role } from './types';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(() => {
    return dbService.getActiveUser();
  });

  const handleLogin = (authenticatedUser: UserAccount) => {
    setUser(authenticatedUser);
    dbService.setActiveUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    dbService.setActiveUser(null);
  };

  // Fixed ProtectedRoute: Making children optional in the type definition to resolve TS compiler errors
  // where it fails to recognize children passed via JSX when used within the Route 'element' prop.
  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: Role[] }) => {
    if (!user) return <Navigate to="/login" />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
    return <>{children}</>;
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" />} 
          />
          
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute allowedRoles={[Role.GUEST, Role.SEEKER, Role.GUIDE]}><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/mood" 
            element={<ProtectedRoute allowedRoles={[Role.SEEKER, Role.GUIDE]}><Mood /></ProtectedRoute>} 
          />
          <Route 
            path="/goals" 
            element={<ProtectedRoute allowedRoles={[Role.SEEKER, Role.GUIDE]}><GoalSetting /></ProtectedRoute>} 
          />
          <Route 
            path="/routine" 
            element={<ProtectedRoute allowedRoles={[Role.SEEKER, Role.GUIDE]}><Routine /></ProtectedRoute>} 
          />
          <Route 
            path="/journal" 
            element={<ProtectedRoute allowedRoles={[Role.SEEKER, Role.GUIDE]}><Journal /></ProtectedRoute>} 
          />
          <Route 
            path="/gratitude" 
            element={<ProtectedRoute allowedRoles={[Role.SEEKER, Role.GUIDE]}><Gratitude /></ProtectedRoute>} 
          />
          <Route 
            path="/therapy" 
            element={<ProtectedRoute allowedRoles={[Role.GUEST, Role.SEEKER, Role.GUIDE]}><Therapy /></ProtectedRoute>} 
          />
          <Route 
            path="/emergency" 
            element={<ProtectedRoute allowedRoles={[Role.GUIDE]}><Emergency /></ProtectedRoute>} 
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute allowedRoles={[Role.GUIDE]}><Settings /></ProtectedRoute>} 
          />
          
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
}
