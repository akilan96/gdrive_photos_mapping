export interface UserSession {
  username: string;
  name: string;
  role: string;
  isAuthenticated: boolean;
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
  createdAt: string;
}

export type EventType =
  | 'Wedding'
  | 'Reception'
  | 'Engagement'
  | 'Pre-Wedding Shoot'
  | 'Baby Shower'
  | 'Birthday'
  | 'Maternity Shoot'
  | 'Corporate Event'
  | 'Fashion Shoot'
  | 'Product Shoot'
  | 'Portrait Photography'
  | 'Other';

export type EventStatus =
  | 'Enquiry'
  | 'Quotation Sent'
  | 'Booked'
  | 'Confirmed'
  | 'Shoot Scheduled'
  | 'Shoot In Progress'
  | 'Shoot Completed'
  | 'Editing'
  | 'Client Selection Pending'
  | 'Album Designing'
  | 'Printing'
  | 'Delivered'
  | 'Cancelled';

export type EventPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface EventServices {
  candidPhoto?: boolean;
  traditionalPhoto?: boolean;
  cinematicVideo?: boolean;
  traditionalVideo?: boolean;
  drone?: boolean;
  album?: boolean;
  albumCount?: number;
}

export interface TeamAssignment {
  memberId: string;
  role: string;
  notes?: string;
}

export interface EventItem {
  id: string;
  title: string;
  eventType: EventType;
  clientId: string;
  brideName?: string;
  groomName?: string;
  description?: string;
  status: EventStatus;
  priority: EventPriority;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  additionalDates?: string[];
  venueName: string;
  address: string;
  city: string;
  googleMapsUrl?: string;
  guestCount?: number;
  package: string;
  services: EventServices;
  deliverables?: string;
  specialInstructions?: string;
  equipmentIds: string[];
  teamAssignments: TeamAssignment[];
  totalContract: number;
  discount: number;
  finalAmount: number;
  paymentDueDate?: string;
  internalNotes?: string;
  createdAt: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';

export interface Payment {
  id: string;
  eventId: string;
  clientId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export type EquipmentCategory =
  | 'DSLR Camera'
  | 'Mirrorless Camera'
  | 'Cinema Camera'
  | 'Lens'
  | 'Drone'
  | 'Gimbal'
  | 'Tripod'
  | 'Lighting'
  | 'Audio Equipment'
  | 'Memory Cards'
  | 'Accessories';

export type EquipmentCondition = 'New' | 'Good' | 'Needs Service' | 'Damaged';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  quantity: number;
  condition: EquipmentCondition;
  notes?: string;
  assignedEventIds: string[];
}

export type TeamRole =
  | 'Photographer'
  | 'Candid Photographer'
  | 'Videographer'
  | 'Cinematographer'
  | 'Drone Operator'
  | 'Editor'
  | 'Album Designer'
  | 'Assistant';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  phone: string;
  email: string;
  availability: 'Available' | 'On Shoot' | 'On Leave';
  notes?: string;
}

export const WORKFLOW_STAGES = [
  { id: 1, name: 'Booking Confirmed' },
  { id: 2, name: 'Pre-Shoot Preparation' },
  { id: 3, name: 'Equipment Assigned' },
  { id: 4, name: 'Team Assigned' },
  { id: 5, name: 'Shoot Completed' },
  { id: 6, name: 'Raw Photos Uploaded' },
  { id: 7, name: 'Gallery Shared with Client' },
  { id: 8, name: 'Client Selection In Progress' },
  { id: 9, name: 'Client Selection Completed' },
  { id: 10, name: 'Photo Editing' },
  { id: 11, name: 'Album Designing' },
  { id: 12, name: 'Client Approval' },
  { id: 13, name: 'Album Printing' },
  { id: 14, name: 'Final Delivery' },
] as const;

export type WorkflowStageId = (typeof WORKFLOW_STAGES)[number]['id'];

export interface WorkflowItem {
  id: string;
  eventId: string;
  stageId: WorkflowStageId;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  assignedMemberId?: string;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface GalleryPhoto {
  id: string;
  filename: string;
  url: string;
  caption?: string;
  aspectRatio?: string;
}

export type GalleryStatus =
  | 'Draft'
  | 'Published'
  | 'Selection In Progress'
  | 'Submitted'
  | 'Archived';

export interface Gallery {
  id: string;
  shareId: string;
  title: string;
  eventId: string;
  clientId: string;
  googleDriveUrl?: string;
  folderId?: string;
  description?: string;
  coverPhotoUrl?: string;
  photos: GalleryPhoto[];
  maxFavourites: number;
  allowDownload: boolean;
  allowUnfavorite: boolean;
  showFilenames: boolean;
  welcomeMessage: string;
  status: GalleryStatus;
  createdAt: string;
  submittedAt?: string;
  selectedPhotoIds?: string[];
  selectionNotes?: string;
}

export interface StudioSettings {
  studioName: string;
  tagline: string;
  logoUrl?: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  theme: 'dark' | 'light';
  demoPin: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'payment' | 'workflow' | 'gallery';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ClientSelectionReport {
  galleryId: string;
  shareId: string;
  galleryTitle: string;
  clientName: string;
  eventName: string;
  submittedAt: string;
  selectedCount: number;
  selectedPhotos: {
    id: string;
    filename: string;
    url: string;
  }[];
  notes?: string;
}

