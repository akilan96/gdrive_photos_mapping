import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useStudioStore } from '../stores/useStudioStore';
import { StudioLayout } from '../components/layout/StudioLayout';
import { LoginView } from '../features/auth/LoginView';
import { DashboardView } from '../features/dashboard/DashboardView';
import { EventsListView } from '../features/events/EventsListView';
import { EventDetailView } from '../features/events/EventDetailView';
import { ClientsListView } from '../features/clients/ClientsListView';
import { ClientProfileView } from '../features/clients/ClientProfileView';
import { PaymentsListView } from '../features/payments/PaymentsListView';
import { CalendarView } from '../features/calendar/CalendarView';
import { EquipmentListView } from '../features/equipment/EquipmentListView';
import { TeamListView } from '../features/team/TeamListView';
import { WorkflowKanbanView } from '../features/workflow/WorkflowKanbanView';
import { GalleriesListView } from '../features/galleries/GalleriesListView';
import { GalleryDetailView } from '../features/galleries/GalleryDetailView';
import { SettingsView } from '../features/settings/SettingsView';
import { CustomerGalleryLayout } from '../features/customer-gallery/CustomerGalleryLayout';

// Guard for Studio routes
const ProtectedRoute: React.FC = () => {
  const auth = useStudioStore((s) => s.auth);
  const searchParams = new URLSearchParams(window.location.search);
  const hasQueryLink = searchParams.get('link') || searchParams.get('folder');

  // If query link is provided (e.g. ?link=... or ?folder=...), always render customer gallery
  if (hasQueryLink) {
    return <CustomerGalleryLayout />;
  }

  if (!auth.isAuthenticated) {
    // For root access when not authenticated, default to customer proofing gallery
    return <CustomerGalleryLayout />;
  }
  return <StudioLayout />;
};

export const router = createBrowserRouter([
  // Public Customer Proofing Galleries (NO AUTH REQUIRED)
  {
    path: '/gallery/:shareId',
    element: <CustomerGalleryLayout />,
  },
  {
    path: '/gallery/:shareId/favourites',
    element: <CustomerGalleryLayout />,
  },
  {
    path: '/gallery/:shareId/complete',
    element: <CustomerGalleryLayout />,
  },

  // Studio Login
  {
    path: '/login',
    element: <LoginView />,
  },

  // Protected Studio Management Portal
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardView />,
      },
      {
        path: 'events',
        element: <EventsListView />,
      },
      {
        path: 'events/new',
        element: <EventsListView />,
      },
      {
        path: 'events/:id',
        element: <EventDetailView />,
      },
      {
        path: 'events/:id/edit',
        element: <EventDetailView />,
      },
      {
        path: 'clients',
        element: <ClientsListView />,
      },
      {
        path: 'clients/:id',
        element: <ClientProfileView />,
      },
      {
        path: 'calendar',
        element: <CalendarView />,
      },
      {
        path: 'payments',
        element: <PaymentsListView />,
      },
      {
        path: 'equipment',
        element: <EquipmentListView />,
      },
      {
        path: 'team',
        element: <TeamListView />,
      },
      {
        path: 'workflow',
        element: <WorkflowKanbanView />,
      },
      {
        path: 'galleries',
        element: <GalleriesListView />,
      },
      {
        path: 'galleries/:id',
        element: <GalleryDetailView />,
      },
      {
        path: 'settings',
        element: <SettingsView />,
      },
    ],
  },

  // Clean Folder ID Direct URLs (e.g. http://localhost:5173/1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x)
  {
    path: '/:shareId',
    element: <CustomerGalleryLayout />,
  },
  {
    path: '/:shareId/favourites',
    element: <CustomerGalleryLayout />,
  },
  {
    path: '/:shareId/complete',
    element: <CustomerGalleryLayout />,
  },

  // Fallback Catch-all
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

