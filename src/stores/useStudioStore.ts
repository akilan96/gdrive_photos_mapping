import { create } from 'zustand';
import {
  UserSession,
  Client,
  EventItem,
  Payment,
  Equipment,
  TeamMember,
  Gallery,
  WorkflowItem,
  StudioSettings,
  AppNotification,
  WORKFLOW_STAGES,
  ClientSelectionReport,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_CLIENTS,
  INITIAL_EVENTS,
  INITIAL_PAYMENTS,
  INITIAL_EQUIPMENT,
  INITIAL_TEAM,
  INITIAL_GALLERIES,
  INITIAL_NOTIFICATIONS,
} from '../data/demoData';

// Helper to safely read from localStorage
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
};

// Helper to safely write to localStorage
const setLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
};

// Build initial workflow items for events if not present
const buildDefaultWorkflows = (events: EventItem[]): WorkflowItem[] => {
  const workflows: WorkflowItem[] = [];
  events.forEach((evt) => {
    WORKFLOW_STAGES.forEach((stage) => {
      let status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked' = 'Pending';
      if (evt.status === 'Delivered') {
        status = 'Completed';
      } else if (evt.status === 'Client Selection Pending') {
        if (stage.id <= 7) status = 'Completed';
        else if (stage.id === 8) status = 'In Progress';
      } else if (evt.status === 'Editing') {
        if (stage.id <= 6) status = 'Completed';
        else if (stage.id === 10) status = 'In Progress';
      } else if (evt.status === 'Shoot Scheduled') {
        if (stage.id <= 4) status = 'Completed';
        else if (stage.id === 5) status = 'In Progress';
      }

      workflows.push({
        id: `wf-${evt.id}-${stage.id}`,
        eventId: evt.id,
        stageId: stage.id,
        status,
        dueDate: evt.eventDate,
        notes: `Stage: ${stage.name}`,
      });
    });
  });
  return workflows;
};

interface StudioState {
  auth: UserSession;
  settings: StudioSettings;
  clients: Client[];
  events: EventItem[];
  payments: Payment[];
  equipment: Equipment[];
  team: TeamMember[];
  galleries: Gallery[];
  workflows: WorkflowItem[];
  notifications: AppNotification[];

  // Auth actions
  login: (username: string, pin: string) => boolean;
  logout: () => void;
  updatePin: (newPin: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<StudioSettings>) => void;
  toggleTheme: () => void;

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => { success: boolean; error?: string };

  // Event actions
  addEvent: (event: Omit<EventItem, 'id' | 'createdAt'>) => EventItem;
  updateEvent: (id: string, event: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => EventItem;

  // Payment actions
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Equipment actions
  addEquipment: (item: Omit<Equipment, 'id'>) => Equipment;
  updateEquipment: (id: string, item: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  // Team actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => TeamMember;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // Gallery actions
  addGallery: (gallery: Omit<Gallery, 'id' | 'createdAt'>) => Gallery;
  updateGallery: (id: string, gallery: Partial<Gallery>) => void;
  deleteGallery: (id: string) => void;
  addPhotosToGallery: (galleryId: string, photos: Gallery['photos']) => void;
  importSelectionReport: (report: ClientSelectionReport) => { success: boolean; message: string };

  // Workflow actions
  updateWorkflowItem: (id: string, updates: Partial<WorkflowItem>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt'>) => void;

  // Full Backup & Reset
  exportBackupJson: () => string;
  restoreBackupJson: (jsonStr: string) => boolean;
  resetDemoData: () => void;
}

export const useStudioStore = create<StudioState>((set, get) => {
  // Initialize stored data or use initial demo seeds
  const initialAuth: UserSession = getLocal('mersal_auth', {
    username: 'studio',
    name: 'Akilan S.',
    role: 'Studio Director',
    isAuthenticated: true, // pre-authenticated for quick seamless demonstration
  });

  const initialSettings: StudioSettings = getLocal('mersal_settings', INITIAL_SETTINGS);
  const initialClients: Client[] = getLocal('mersal_clients', INITIAL_CLIENTS);
  const initialEvents: EventItem[] = getLocal('mersal_events', INITIAL_EVENTS);
  const initialPayments: Payment[] = getLocal('mersal_payments', INITIAL_PAYMENTS);
  const initialEquipment: Equipment[] = getLocal('mersal_equipment', INITIAL_EQUIPMENT);
  const initialTeam: TeamMember[] = getLocal('mersal_team', INITIAL_TEAM);
  let initialGalleries: Gallery[] = getLocal('mersal_galleries', INITIAL_GALLERIES);
  // Remove any legacy Unsplash demo photos from cached galleries
  initialGalleries = initialGalleries.map((g) => ({
    ...g,
    photos: g.photos.filter((p) => !p.url.includes('unsplash.com')),
  }));
  // Ensure the live Google Drive testing gallery gal-400 is always present
  if (!initialGalleries.some((g) => g.folderId === '1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x' || g.shareId === '1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x')) {
    initialGalleries = [INITIAL_GALLERIES[0], ...initialGalleries];
  }
  const initialWorkflows: WorkflowItem[] = getLocal(
    'mersal_workflows',
    buildDefaultWorkflows(initialEvents)
  );
  const initialNotifications: AppNotification[] = getLocal(
    'mersal_notifications',
    INITIAL_NOTIFICATIONS
  );

  return {
    auth: initialAuth,
    settings: initialSettings,
    clients: initialClients,
    events: initialEvents,
    payments: initialPayments,
    equipment: initialEquipment,
    team: initialTeam,
    galleries: initialGalleries,
    workflows: initialWorkflows,
    notifications: initialNotifications,

    // Auth actions
    login: (username: string, pin: string) => {
      const { settings } = get();
      if (username.trim().toLowerCase() === 'studio' && pin.trim() === settings.demoPin) {
        const authData: UserSession = {
          username: 'studio',
          name: 'Akilan S.',
          role: 'Studio Director',
          isAuthenticated: true,
        };
        set({ auth: authData });
        setLocal('mersal_auth', authData);
        return true;
      }
      return false;
    },

    logout: () => {
      const authData: UserSession = {
        username: '',
        name: '',
        role: '',
        isAuthenticated: false,
      };
      set({ auth: authData });
      setLocal('mersal_auth', authData);
    },

    updatePin: (newPin: string) => {
      set((state) => {
        const updated = { ...state.settings, demoPin: newPin };
        setLocal('mersal_settings', updated);
        return { settings: updated };
      });
    },

    // Settings
    updateSettings: (newSettings) => {
      set((state) => {
        const updated = { ...state.settings, ...newSettings };
        setLocal('mersal_settings', updated);
        return { settings: updated };
      });
    },

    toggleTheme: () => {
      set((state) => {
        const nextTheme: 'dark' | 'light' = state.settings.theme === 'dark' ? 'light' : 'dark';
        const updated = { ...state.settings, theme: nextTheme };
        setLocal('mersal_settings', updated);

        if (nextTheme === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.body.classList.add('theme-light');
        } else {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
          document.body.classList.remove('theme-light');
        }

        return { settings: updated };
      });
    },

    // Clients CRUD
    addClient: (clientData) => {
      const newClient: Client = {
        ...clientData,
        id: `cli-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      set((state) => {
        const updated = [newClient, ...state.clients];
        setLocal('mersal_clients', updated);
        return { clients: updated };
      });
      return newClient;
    },

    updateClient: (id, clientData) => {
      set((state) => {
        const updated = state.clients.map((c) => (c.id === id ? { ...c, ...clientData } : c));
        setLocal('mersal_clients', updated);
        return { clients: updated };
      });
    },

    deleteClient: (id) => {
      const { events } = get();
      const hasLinkedEvents = events.some((e) => e.clientId === id);
      if (hasLinkedEvents) {
        return {
          success: false,
          error: 'Cannot delete client with active linked events. Please reassign or delete the events first.',
        };
      }
      set((state) => {
        const updated = state.clients.filter((c) => c.id !== id);
        setLocal('mersal_clients', updated);
        return { clients: updated };
      });
      return { success: true };
    },

    // Events CRUD
    addEvent: (eventData) => {
      const newEvent: EventItem = {
        ...eventData,
        id: `evt-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };

      // Auto-generate workflow stages for this new event
      const newWorkflows: WorkflowItem[] = WORKFLOW_STAGES.map((stage) => ({
        id: `wf-${newEvent.id}-${stage.id}`,
        eventId: newEvent.id,
        stageId: stage.id,
        status: stage.id === 1 ? 'Completed' : 'Pending',
        dueDate: newEvent.eventDate,
        notes: `Stage: ${stage.name}`,
      }));

      set((state) => {
        const updatedEvents = [newEvent, ...state.events];
        const updatedWorkflows = [...state.workflows, ...newWorkflows];
        setLocal('mersal_events', updatedEvents);
        setLocal('mersal_workflows', updatedWorkflows);
        return { events: updatedEvents, workflows: updatedWorkflows };
      });
      return newEvent;
    },

    updateEvent: (id, eventData) => {
      set((state) => {
        const updated = state.events.map((e) => (e.id === id ? { ...e, ...eventData } : e));
        setLocal('mersal_events', updated);
        return { events: updated };
      });
    },

    deleteEvent: (id) => {
      set((state) => {
        const updatedEvents = state.events.filter((e) => e.id !== id);
        const updatedPayments = state.payments.filter((p) => p.eventId !== id);
        const updatedWorkflows = state.workflows.filter((w) => w.eventId !== id);
        const updatedGalleries = state.galleries.filter((g) => g.eventId !== id);

        setLocal('mersal_events', updatedEvents);
        setLocal('mersal_payments', updatedPayments);
        setLocal('mersal_workflows', updatedWorkflows);
        setLocal('mersal_galleries', updatedGalleries);

        return {
          events: updatedEvents,
          payments: updatedPayments,
          workflows: updatedWorkflows,
          galleries: updatedGalleries,
        };
      });
    },

    duplicateEvent: (id) => {
      const { events } = get();
      const existing = events.find((e) => e.id === id);
      if (!existing) throw new Error('Event not found');

      const duplicated: EventItem = {
        ...existing,
        id: `evt-${Date.now().toString().slice(-4)}`,
        title: `${existing.title} (Copy)`,
        status: 'Enquiry',
        createdAt: new Date().toISOString().split('T')[0],
      };

      set((state) => {
        const updated = [duplicated, ...state.events];
        setLocal('mersal_events', updated);
        return { events: updated };
      });
      return duplicated;
    },

    // Payments CRUD
    addPayment: (paymentData) => {
      const newPayment: Payment = {
        ...paymentData,
        id: `pay-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      set((state) => {
        const updated = [newPayment, ...state.payments];
        setLocal('mersal_payments', updated);
        return { payments: updated };
      });
      return newPayment;
    },

    updatePayment: (id, paymentData) => {
      set((state) => {
        const updated = state.payments.map((p) => (p.id === id ? { ...p, ...paymentData } : p));
        setLocal('mersal_payments', updated);
        return { payments: updated };
      });
    },

    deletePayment: (id) => {
      set((state) => {
        const updated = state.payments.filter((p) => p.id !== id);
        setLocal('mersal_payments', updated);
        return { payments: updated };
      });
    },

    // Equipment CRUD
    addEquipment: (itemData) => {
      const newEquipment: Equipment = {
        ...itemData,
        id: `eq-${Date.now().toString().slice(-4)}`,
      };
      set((state) => {
        const updated = [...state.equipment, newEquipment];
        setLocal('mersal_equipment', updated);
        return { equipment: updated };
      });
      return newEquipment;
    },

    updateEquipment: (id, itemData) => {
      set((state) => {
        const updated = state.equipment.map((eq) => (eq.id === id ? { ...eq, ...itemData } : eq));
        setLocal('mersal_equipment', updated);
        return { equipment: updated };
      });
    },

    deleteEquipment: (id) => {
      set((state) => {
        const updated = state.equipment.filter((eq) => eq.id !== id);
        setLocal('mersal_equipment', updated);
        return { equipment: updated };
      });
    },

    // Team CRUD
    addTeamMember: (memberData) => {
      const newMember: TeamMember = {
        ...memberData,
        id: `tm-${Date.now().toString().slice(-4)}`,
      };
      set((state) => {
        const updated = [...state.team, newMember];
        setLocal('mersal_team', updated);
        return { team: updated };
      });
      return newMember;
    },

    updateTeamMember: (id, memberData) => {
      set((state) => {
        const updated = state.team.map((tm) => (tm.id === id ? { ...tm, ...memberData } : tm));
        setLocal('mersal_team', updated);
        return { team: updated };
      });
    },

    deleteTeamMember: (id) => {
      set((state) => {
        const updated = state.team.filter((tm) => tm.id !== id);
        setLocal('mersal_team', updated);
        return { team: updated };
      });
    },

    // Galleries CRUD
    addGallery: (galleryData) => {
      const newGallery: Gallery = {
        ...galleryData,
        id: `gal-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      set((state) => {
        const updated = [newGallery, ...state.galleries];
        setLocal('mersal_galleries', updated);
        return { galleries: updated };
      });
      return newGallery;
    },

    updateGallery: (id, galleryData) => {
      set((state) => {
        const updated = state.galleries.map((g) => (g.id === id ? { ...g, ...galleryData } : g));
        setLocal('mersal_galleries', updated);
        return { galleries: updated };
      });
    },

    deleteGallery: (id) => {
      set((state) => {
        const updated = state.galleries.filter((g) => g.id !== id);
        setLocal('mersal_galleries', updated);
        return { galleries: updated };
      });
    },

    addPhotosToGallery: (galleryId, newPhotos) => {
      set((state) => {
        const updated = state.galleries.map((g) => {
          if (g.id === galleryId) {
            return {
              ...g,
              photos: [...g.photos, ...newPhotos],
            };
          }
          return g;
        });
        setLocal('mersal_galleries', updated);
        return { galleries: updated };
      });
    },

    importSelectionReport: (report) => {
      const { galleries, events } = get();
      const matched = galleries.find(
        (g) => g.id === report.galleryId || g.shareId === report.shareId
      );

      if (!matched) {
        return {
          success: false,
          message: `Gallery "${report.galleryTitle}" with ID "${report.galleryId}" could not be matched.`,
        };
      }

      const selectedIds = report.selectedPhotos.map((p) => p.id);
      set((state) => {
        const updatedGalleries = state.galleries.map((g) => {
          if (g.id === matched.id) {
            return {
              ...g,
              status: 'Submitted' as const,
              selectedPhotoIds: selectedIds,
              submittedAt: report.submittedAt || new Date().toISOString(),
              selectionNotes: report.notes || g.selectionNotes,
            };
          }
          return g;
        });

        // Also update the linked event status to 'Album Designing' or 'Editing'
        const updatedEvents = state.events.map((e) => {
          if (e.id === matched.eventId) {
            return { ...e, status: 'Album Designing' as const };
          }
          return e;
        });

        // Add in-app notification
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: 'Client Selection Imported!',
          message: `${report.clientName} submitted ${report.selectedCount} photo selections for "${matched.title}".`,
          type: 'gallery',
          read: false,
          link: `/galleries/${matched.id}`,
          createdAt: new Date().toISOString(),
        };

        const updatedNotifs = [newNotif, ...state.notifications];

        setLocal('mersal_galleries', updatedGalleries);
        setLocal('mersal_events', updatedEvents);
        setLocal('mersal_notifications', updatedNotifs);

        return {
          galleries: updatedGalleries,
          events: updatedEvents,
          notifications: updatedNotifs,
        };
      });

      return {
        success: true,
        message: `Successfully imported ${selectedIds.length} photo selections for "${matched.title}". Event status moved to Album Designing.`,
      };
    },

    // Workflow
    updateWorkflowItem: (id, updates) => {
      set((state) => {
        const updated = state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w));
        setLocal('mersal_workflows', updated);
        return { workflows: updated };
      });
    },

    // Notifications
    markNotificationRead: (id) => {
      set((state) => {
        const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        setLocal('mersal_notifications', updated);
        return { notifications: updated };
      });
    },

    markAllNotificationsRead: () => {
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, read: true }));
        setLocal('mersal_notifications', updated);
        return { notifications: updated };
      });
    },

    addNotification: (notifData) => {
      const newNotif: AppNotification = {
        ...notifData,
        id: `notif-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const updated = [newNotif, ...state.notifications];
        setLocal('mersal_notifications', updated);
        return { notifications: updated };
      });
    },

    // Backup & Restore
    exportBackupJson: () => {
      const { settings, clients, events, payments, equipment, team, galleries, workflows } =
        get();
      const backupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings,
        clients,
        events,
        payments,
        equipment,
        team,
        galleries,
        workflows,
      };
      return JSON.stringify(backupData, null, 2);
    },

    restoreBackupJson: (jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!parsed.clients || !parsed.events || !parsed.payments) {
          throw new Error('Invalid backup schema');
        }

        set({
          settings: parsed.settings || INITIAL_SETTINGS,
          clients: parsed.clients,
          events: parsed.events,
          payments: parsed.payments,
          equipment: parsed.equipment || [],
          team: parsed.team || [],
          galleries: parsed.galleries || [],
          workflows: parsed.workflows || [],
        });

        setLocal('mersal_settings', parsed.settings || INITIAL_SETTINGS);
        setLocal('mersal_clients', parsed.clients);
        setLocal('mersal_events', parsed.events);
        setLocal('mersal_payments', parsed.payments);
        setLocal('mersal_equipment', parsed.equipment || []);
        setLocal('mersal_team', parsed.team || []);
        setLocal('mersal_galleries', parsed.galleries || []);
        setLocal('mersal_workflows', parsed.workflows || []);

        return true;
      } catch (err) {
        console.error('Failed to restore backup:', err);
        return false;
      }
    },

    resetDemoData: () => {
      set({
        settings: INITIAL_SETTINGS,
        clients: INITIAL_CLIENTS,
        events: INITIAL_EVENTS,
        payments: INITIAL_PAYMENTS,
        equipment: INITIAL_EQUIPMENT,
        team: INITIAL_TEAM,
        galleries: INITIAL_GALLERIES,
        workflows: buildDefaultWorkflows(INITIAL_EVENTS),
        notifications: INITIAL_NOTIFICATIONS,
      });

      setLocal('mersal_settings', INITIAL_SETTINGS);
      setLocal('mersal_clients', INITIAL_CLIENTS);
      setLocal('mersal_events', INITIAL_EVENTS);
      setLocal('mersal_payments', INITIAL_PAYMENTS);
      setLocal('mersal_equipment', INITIAL_EQUIPMENT);
      setLocal('mersal_team', INITIAL_TEAM);
      setLocal('mersal_galleries', INITIAL_GALLERIES);
      setLocal('mersal_workflows', buildDefaultWorkflows(INITIAL_EVENTS));
      setLocal('mersal_notifications', INITIAL_NOTIFICATIONS);
    },
  };
});

