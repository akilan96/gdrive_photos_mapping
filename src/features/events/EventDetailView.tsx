import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Camera,
  IndianRupee,
  CreditCard,
  Printer,
  Edit,
  Trash2,
  ArrowLeft,
  Images,
  FolderKanban,
  CheckCircle,
  ExternalLink,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EventFormModal } from './EventFormModal';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const EventDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const events = useStudioStore((s) => s.events);
  const clients = useStudioStore((s) => s.clients);
  const payments = useStudioStore((s) => s.payments);
  const equipmentList = useStudioStore((s) => s.equipment);
  const teamList = useStudioStore((s) => s.team);
  const galleries = useStudioStore((s) => s.galleries);
  const workflows = useStudioStore((s) => s.workflows);
  const deleteEvent = useStudioStore((s) => s.deleteEvent);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'payments' | 'equipment' | 'team' | 'gallery' | 'workflow' | 'notes'
  >('overview');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const event = events.find((e) => e.id === id);
  if (!event) {
    return (
      <div className="p-8 text-center text-white space-y-4">
        <h2 className="text-xl font-bold">Event Not Found</h2>
        <button
          onClick={() => navigate('/events')}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#50E2E5] text-black"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const client = clients.find((c) => c.id === event.clientId);
  const eventPayments = payments.filter((p) => p.eventId === event.id);
  const totalReceived = eventPayments.reduce((s, p) => s + p.amount, 0);
  const balanceDue = Math.max(0, event.finalAmount - totalReceived);
  const eventGallery = galleries.find((g) => g.eventId === event.id);
  const eventWorkflows = workflows.filter((w) => w.eventId === event.id);

  const allocatedEquipment = equipmentList.filter((eq) => event.equipmentIds.includes(eq.id));

  const handleDelete = () => {
    deleteEvent(event.id);
    navigate('/events');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-xl bg-[#092328] hover:bg-white/5 text-gray-300 hover:text-white border border-[#27555C] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#50E2E5] font-bold uppercase">{event.eventType}</span>
              <span className="text-xs text-gray-400">• ID: {event.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#092328] hover:bg-[#103840] text-gray-200 border border-[#27555C] transition-colors"
          >
            <Printer size={15} />
            <span>Print Summary</span>
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#092328] hover:bg-[#103840] text-[#50E2E5] border border-[#27555C] transition-colors"
          >
            <Edit size={15} />
            <span>Edit Event</span>
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Printable Event Summary Sheet (Visible in Print or Screen) */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] print-card">
        {/* Header Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#27555C]/60 text-xs">
          <div>
            <p className="text-gray-400 uppercase font-semibold">Client</p>
            <p className="text-sm font-bold text-white mt-0.5">{client?.fullName || 'N/A'}</p>
            <p className="text-[11px] text-[#AEC5C7]">{client?.phone}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase font-semibold">Date & Time</p>
            <p className="text-sm font-bold text-[#50E2E5] mt-0.5">
              {formatIndianDate(event.eventDate)}
            </p>
            <p className="text-[11px] text-gray-300">
              {event.startTime} - {event.endTime}
            </p>
          </div>
          <div>
            <p className="text-gray-400 uppercase font-semibold">Venue & City</p>
            <p className="text-sm font-bold text-white mt-0.5">{event.venueName}</p>
            <p className="text-[11px] text-[#AEC5C7]">{event.city}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase font-semibold">Contract / Balance</p>
            <p className="text-sm font-bold text-white mt-0.5">{formatINR(event.finalAmount)}</p>
            <p
              className={`text-xs font-bold ${
                balanceDue === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {balanceDue === 0 ? 'Fully Paid' : `Balance: ${formatINR(balanceDue)}`}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#27555C]/60 py-3 no-print text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'payments', label: `Payments (${eventPayments.length})` },
            { id: 'equipment', label: `Equipment (${allocatedEquipment.length})` },
            { id: 'team', label: `Crew (${event.teamAssignments.length})` },
            { id: 'gallery', label: 'Client Gallery' },
            { id: 'workflow', label: 'Workflow' },
            { id: 'notes', label: 'Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#50E2E5] text-black shadow-md shadow-[#50E2E5]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="pt-6 space-y-6 text-xs text-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Couple & Ceremony Details */}
              <div className="p-4 rounded-2xl bg-[#000F13]/60 border border-[#27555C] space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                  <Users size={14} className="text-[#50E2E5]" /> Couple & Ceremony Info
                </h4>
                {event.brideName && (
                  <div className="flex justify-between py-1.5 border-b border-[#27555C]/40">
                    <span className="text-gray-400">Bride:</span>
                    <span className="font-bold text-white">{event.brideName}</span>
                  </div>
                )}
                {event.groomName && (
                  <div className="flex justify-between py-1.5 border-b border-[#27555C]/40">
                    <span className="text-gray-400">Groom:</span>
                    <span className="font-bold text-white">{event.groomName}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-[#27555C]/40">
                  <span className="text-gray-400">Expected Guests:</span>
                  <span className="font-bold text-white">{event.guestCount || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Full Address:</span>
                  <span className="text-right text-gray-300 max-w-xs">{event.address || event.venueName}</span>
                </div>
              </div>

              {/* Package & Deliverables */}
              <div className="p-4 rounded-2xl bg-[#000F13]/60 border border-[#27555C] space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                  <Camera size={14} className="text-purple-400" /> Package & Deliverables
                </h4>
                <div className="flex justify-between py-1.5 border-b border-[#27555C]/40">
                  <span className="text-gray-400">Package:</span>
                  <span className="font-bold text-[#50E2E5]">{event.package}</span>
                </div>
                <div className="py-1.5 border-b border-[#27555C]/40">
                  <span className="text-gray-400 block mb-1">Included Services:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {event.services.candidPhoto && <Badge variant="cyan">Candid Photo</Badge>}
                    {event.services.traditionalPhoto && <Badge variant="blue">Traditional Photo</Badge>}
                    {event.services.cinematicVideo && <Badge variant="purple">Cinematic Film</Badge>}
                    {event.services.drone && <Badge variant="green">Aerial Drone</Badge>}
                    {event.services.album && (
                      <Badge variant="amber">{event.services.albumCount || 1} Printed Albums</Badge>
                    )}
                  </div>
                </div>
                <div className="py-1.5">
                  <span className="text-gray-400 block mb-1">Deliverables:</span>
                  <p className="text-white font-medium leading-relaxed">{event.deliverables}</p>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Card */}
            <div className="p-4 rounded-2xl bg-[#000F13]/60 border border-[#27555C]">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <IndianRupee size={14} className="text-emerald-400" /> Commercial Financials
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-400">Contract Total</p>
                  <p className="font-bold text-white text-sm">{formatINR(event.totalContract)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Discount</p>
                  <p className="font-bold text-amber-400 text-sm">{formatINR(event.discount)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Final Agreed</p>
                  <p className="font-bold text-[#50E2E5] text-sm">{formatINR(event.finalAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Received</p>
                  <p className="font-bold text-emerald-400 text-sm">{formatINR(totalReceived)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Payments */}
        {activeTab === 'payments' && (
          <div className="pt-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">Payment Ledger for this Event</h4>
              <button
                onClick={() => navigate('/payments')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black"
              >
                <Plus size={14} /> Record Payment
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#27555C]">
              <table className="w-full text-left">
                <thead className="bg-[#000F13] text-[#AEC5C7] uppercase font-bold border-b border-[#27555C]">
                  <tr>
                    <th className="py-2.5 px-3">Receipt ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27555C]/40">
                  {eventPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="py-3 px-3 font-mono text-[#50E2E5]">{p.id}</td>
                      <td className="py-3 px-3 text-gray-300">{formatIndianDate(p.paymentDate)}</td>
                      <td className="py-3 px-3 text-gray-300">{p.paymentMethod}</td>
                      <td className="py-3 px-3 text-gray-400 font-mono">
                        {p.transactionReference || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-gray-400">{p.notes || '-'}</td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400 text-sm">
                        {formatINR(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Equipment */}
        {activeTab === 'equipment' && (
          <div className="pt-6 space-y-4 text-xs">
            <h4 className="font-bold text-white">Allocated Cameras & Gear</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allocatedEquipment.map((eq) => (
                <div key={eq.id} className="p-3.5 rounded-xl bg-[#000F13] border border-[#27555C]">
                  <p className="font-bold text-white">{eq.name}</p>
                  <p className="text-[11px] text-[#50E2E5] font-mono mt-0.5">{eq.category}</p>
                  <p className="text-gray-400 text-[11px] mt-1">Brand: {eq.brand} ({eq.model})</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Team */}
        {activeTab === 'team' && (
          <div className="pt-6 space-y-4 text-xs">
            <h4 className="font-bold text-white">Assigned Production Crew</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.teamAssignments.map((ta) => {
                const member = teamList.find((t) => t.id === ta.memberId);
                return (
                  <div
                    key={ta.memberId}
                    className="p-3.5 rounded-xl bg-[#000F13] border border-[#27555C] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white">{member?.name || 'Crew Member'}</p>
                      <p className="text-[11px] text-[#50E2E5]">{ta.role}</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">{member?.phone}</p>
                    </div>
                    <Badge variant="green">Assigned</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Gallery */}
        {activeTab === 'gallery' && (
          <div className="pt-6 space-y-4 text-xs">
            {eventGallery ? (
              <div className="p-6 rounded-2xl bg-[#000F13] border border-[#27555C] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{eventGallery.title}</h4>
                    <p className="text-xs text-[#AEC5C7] mt-0.5">
                      {eventGallery.photos.length} Photos • Status: {eventGallery.status}
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(`/gallery/${eventGallery.shareId}`, '_blank')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-[#50E2E5] text-black"
                  >
                    <span>Open Customer Portal</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="font-mono text-gray-300">
                    {window.location.origin}/gallery/{eventGallery.shareId}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/gallery/${eventGallery.shareId}`
                      );
                      alert('Gallery link copied to clipboard!');
                    }}
                    className="text-[#50E2E5] hover:underline font-semibold"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[#000F13] border border-[#27555C]">
                <Images size={36} className="mx-auto text-gray-500 mb-2" />
                <h4 className="font-bold text-white mb-1">No Client Gallery Created Yet</h4>
                <p className="text-gray-400 mb-4">
                  Create a client proofing gallery so the client can select their favourite photos.
                </p>
                <button
                  onClick={() => navigate('/galleries')}
                  className="px-4 py-2 rounded-xl font-bold bg-[#50E2E5] text-black"
                >
                  Create Gallery
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Workflow */}
        {activeTab === 'workflow' && (
          <div className="pt-6 space-y-3 text-xs">
            <h4 className="font-bold text-white mb-3">14-Stage Production Milestone Progress</h4>
            <div className="space-y-2">
              {eventWorkflows.map((w, index) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl bg-[#000F13] border border-[#27555C] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#27555C] text-white flex items-center justify-center font-bold text-[10px]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white">{w.notes}</p>
                      <p className="text-[10px] text-gray-400">Due: {formatIndianDate(w.dueDate)}</p>
                    </div>
                  </div>
                  <Badge variant={w.status === 'Completed' ? 'green' : w.status === 'In Progress' ? 'amber' : 'gray'}>
                    {w.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Notes */}
        {activeTab === 'notes' && (
          <div className="pt-6 text-xs text-gray-300 leading-relaxed">
            <h4 className="font-bold text-white mb-2">Studio Internal Notes</h4>
            <div className="p-4 rounded-xl bg-[#000F13] border border-[#27555C] min-h-[120px] whitespace-pre-wrap">
              {event.internalNotes || 'No internal notes recorded yet for this shoot.'}
            </div>
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      <EventFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        eventToEdit={event}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Event"
        message={`Are you sure you want to permanently delete "${event.title}"?`}
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};

