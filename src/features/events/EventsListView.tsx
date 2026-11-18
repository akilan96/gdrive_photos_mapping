import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Copy,
  Trash2,
  Edit,
  Eye,
  MapPin,
  Clock,
  IndianRupee,
  Users,
  Camera,
  CheckCircle,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { EventItem, EventStatus, EventType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EventFormModal } from './EventFormModal';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const EventsListView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const events = useStudioStore((s) => s.events);
  const clients = useStudioStore((s) => s.clients);
  const payments = useStudioStore((s) => s.payments);
  const deleteEvent = useStudioStore((s) => s.deleteEvent);
  const duplicateEvent = useStudioStore((s) => s.duplicateEvent);

  const initialSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        const client = clients.find((c) => c.id === evt.clientId);
        const matchesSearch =
          evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evt.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evt.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client && client.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = selectedType === 'ALL' || evt.eventType === selectedType;
        const matchesStatus = selectedStatus === 'ALL' || evt.status === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
        } else if (sortBy === 'date-asc') {
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        } else if (sortBy === 'amount-desc') {
          return b.finalAmount - a.finalAmount;
        }
        return 0;
      });
  }, [events, clients, searchTerm, selectedType, selectedStatus, sortBy]);

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = duplicateEvent(id);
    alert(`Duplicated event as "${dup.title}".`);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteEvent(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Events & Photography Shoots
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Manage client bookings, ceremony packages, crew assignments, and deliverables.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-lg shadow-[#50E2E5]/20 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#092328]/80 border border-[#27555C] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by event title, client, venue, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-white placeholder-gray-400 focus:outline-none focus:border-[#50E2E5]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-gray-300 focus:outline-none focus:border-[#50E2E5]"
          >
            <option value="ALL">All Event Types</option>
            <option value="Wedding">Wedding</option>
            <option value="Reception">Reception</option>
            <option value="Engagement">Engagement</option>
            <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
            <option value="Baby Shower">Baby Shower</option>
            <option value="Birthday">Birthday</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Fashion Shoot">Fashion Shoot</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-gray-300 focus:outline-none focus:border-[#50E2E5]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Booked">Booked</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shoot Scheduled">Shoot Scheduled</option>
            <option value="Shoot In Progress">Shoot In Progress</option>
            <option value="Editing">Editing</option>
            <option value="Client Selection Pending">Client Selection Pending</option>
            <option value="Album Designing">Album Designing</option>
            <option value="Delivered">Delivered</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-gray-300 focus:outline-none focus:border-[#50E2E5]"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="amount-desc">Contract Value (High to Low)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#000F13] p-1 rounded-xl border border-[#27555C]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#50E2E5] text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Grid Cards View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#50E2E5] text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Events Results Summary */}
      <div className="flex items-center justify-between text-xs text-[#AEC5C7]">
        <span>
          Showing <b className="text-white">{filteredEvents.length}</b> events
        </span>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#092328]/40 border border-[#27555C]/50">
          <CalendarDays size={40} className="mx-auto text-gray-500 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No matching events found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            Try adjusting your search criteria or schedule a new event shoot.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-xs text-[#50E2E5] hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Grid Cards View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => {
            const client = clients.find((c) => c.id === evt.clientId);
            const eventPayments = payments.filter((p) => p.eventId === evt.id);
            const totalReceived = eventPayments.reduce((s, p) => s + p.amount, 0);
            const balanceDue = Math.max(0, evt.finalAmount - totalReceived);

            return (
              <div
                key={evt.id}
                onClick={() => navigate(`/events/${evt.id}`)}
                className="group relative rounded-2xl bg-[#092328]/85 border border-[#27555C] hover:border-[#50E2E5]/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#50E2E5]/10 text-[#50E2E5] border border-[#50E2E5]/20 uppercase">
                      {evt.eventType}
                    </span>
                    <Badge
                      variant={
                        evt.status === 'Delivered'
                          ? 'green'
                          : evt.status === 'Editing'
                          ? 'purple'
                          : evt.priority === 'Urgent'
                          ? 'red'
                          : 'cyan'
                      }
                    >
                      {evt.status}
                    </Badge>
                  </div>

                  {/* Title & Client */}
                  <h3 className="text-sm font-bold text-white group-hover:text-[#50E2E5] transition-colors line-clamp-2 mb-1">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#AEC5C7] mb-3">
                    Client: <span className="text-white font-medium">{client?.fullName || 'N/A'}</span>
                  </p>

                  {/* Date, Time & Venue */}
                  <div className="space-y-1.5 text-xs text-gray-300 pt-2 border-t border-[#27555C]/40">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={13} className="text-[#50E2E5] shrink-0" />
                      <span>{formatIndianDate(evt.eventDate)} ({evt.startTime})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-rose-400 shrink-0" />
                      <span className="truncate">{evt.venueName}, {evt.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera size={13} className="text-purple-400 shrink-0" />
                      <span className="truncate">{evt.package}</span>
                    </div>
                  </div>
                </div>

                {/* Financials & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#27555C]/50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Contract / Balance</p>
                    <p className="text-xs font-bold text-white">
                      {formatINR(evt.finalAmount)}{' '}
                      <span className={balanceDue === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        ({balanceDue === 0 ? 'Paid' : `Due ${formatINR(balanceDue)}`})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(evt);
                        setIsModalOpen(true);
                      }}
                      title="Edit Event"
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(evt.id, e)}
                      title="Duplicate Event"
                      className="p-1.5 text-gray-400 hover:text-[#50E2E5] rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(evt.id);
                      }}
                      title="Delete Event"
                      className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-2xl bg-[#092328]/85 border border-[#27555C]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#000F13]/80 text-[#AEC5C7] uppercase font-bold border-b border-[#27555C]">
              <tr>
                <th className="py-3 px-4">Event & Client</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Contract</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27555C]/40">
              {filteredEvents.map((evt) => {
                const client = clients.find((c) => c.id === evt.clientId);
                const eventPayments = payments.filter((p) => p.eventId === evt.id);
                const totalReceived = eventPayments.reduce((s, p) => s + p.amount, 0);
                const balanceDue = Math.max(0, evt.finalAmount - totalReceived);

                return (
                  <tr
                    key={evt.id}
                    onClick={() => navigate(`/events/${evt.id}`)}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <p className="hover:text-[#50E2E5] transition-colors">{evt.title}</p>
                      <p className="text-[11px] text-[#AEC5C7] font-normal">{client?.fullName}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{evt.eventType}</td>
                    <td className="py-3.5 px-4 text-gray-300">
                      <p>{formatIndianDate(evt.eventDate)}</p>
                      <p className="text-[11px] text-gray-500">{evt.startTime}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      <p className="truncate max-w-xs">{evt.venueName}</p>
                      <p className="text-[11px] text-gray-500">{evt.city}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={evt.status === 'Delivered' ? 'green' : 'cyan'}>
                        {evt.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {formatINR(evt.finalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span className={balanceDue === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatINR(balanceDue)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingEvent(evt);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(evt.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal & Confirm Dialog */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        eventToEdit={editingEvent}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Event Shoot"
        message="Are you sure you want to delete this event? This will also remove associated payments, galleries, and workflow records."
        confirmLabel="Delete Permanently"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

