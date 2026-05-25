// components/Dashboard.jsx
import React from 'react';
import StudentDashboard from '../pages/student/Dashboard';
import InstructorDashboard from '../pages/instructor/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
import ParentDashboard from '../pages/parent/Dashboard';

const Dashboard = ({ user, onLogout }) => {
  switch (user?.role) {
    case 'student':
      return <StudentDashboard user={user} onLogout={onLogout} />;

    case 'instructor':
      return <InstructorDashboard user={user} onLogout={onLogout} />;

    case 'super_admin':
    case 'institution_admin':
      return <AdminDashboard user={user} onLogout={onLogout} />;

    case 'parent':
      return <ParentDashboard user={user} onLogout={onLogout} />;

    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <p className="text-2xl text-gray-600 dark:text-gray-400">Unknown role: {user?.role}</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;