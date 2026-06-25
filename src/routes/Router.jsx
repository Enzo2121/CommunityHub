import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import EventsPage from '../pages/EventsPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import CreateEventPage from '../pages/CreateEventPage';
import EditEventPage from '../pages/EditEventPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import ContactsPage from '../pages/ContactsPage';
import MessagesPage from '../pages/MessagesPage';
import SkillsPage from '../pages/SkillsPage';
import MySkillPage from '../pages/MySkillPage';
import PremiumPage from '../pages/PremiumPage';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:id', element: <EventDetailsPage /> },
      { path: '/skills', element: <SkillsPage /> },

      // Protected routes (must be logged in)
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/premium', element: <PremiumPage /> },
          { path: '/contacts', element: <ContactsPage /> },
          { path: '/messages', element: <MessagesPage /> },
          { path: '/my-skills', element: <MySkillPage /> },
          { path: '/events/create', element: <CreateEventPage /> },
          { path: '/events/:id/edit', element: <EditEventPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
