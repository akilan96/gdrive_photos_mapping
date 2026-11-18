import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, IndianRupee, Users, Camera, ShieldCheck } from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { EventItem, EventType, EventStatus, EventPriority } from '../../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventItem | null;
}

const EVENT_TYPES: EventType[] = [
  'Wedding',
  'Reception',
  'Engagement',
  'Pre-Wedding Shoot',
  'Baby Shower',
  'Birthday',
  'Maternity Shoot',
  'Corporate Event',
  'Fashion Shoot',
  'Product Shoot',
  'Portrait Photography',
  'Other',
];

const EVENT_STATUSES: EventStatus[] = [
  'Enquiry',
  'Quotation Sent',
  'Booked',
  'Confirmed',
  'Shoot Scheduled',
  'Shoot In Progress',
  'Shoot Completed',
  'Editing',
  'Client Selection Pending',
  'Album Designing',
  'Printing',
  'Delivered',
  'Cancelled',
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
}) => {
  const clients = useStudioStore((s) => s.clients);
  const equipmentList = useStudioStore((s) => s.equipment);
  const teamList = useStudioStore((s) => s.team);
  const addEvent = useStudioStore((s) => s.addEvent);
  const updateEvent = useStudioStore((s) => s.updateEvent);

  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [eventType, setEventType] = useState<EventType>(eventToEdit?.eventType || 'Wedding');
  const [clientId, setClientId] = useState(eventToEdit?.clientId || clients[0]?.id || '');
  const [brideName, setBrideName] = useState(eventToEdit?.brideName || '');
  const [groomName, setGroomName] = useState(eventToEdit?.groomName || '');
  const [status, setStatus] = useState<EventStatus>(eventToEdit?.status || 'Booked');
  const [priority, setPriority] = useState<EventPriority>(eventToEdit?.priority || 'Medium');
  const [eventDate, setEventDate] = useState(
    eventToEdit?.eventDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(eventToEdit?.startTime || '07:00');
  const [endTime, setEndTime] = useState(eventToEdit?.endTime || '22:00');
  const [venueName, setVenueName] = useState(eventToEdit?.venueName || '');
  const [address, setAddress] = useState(eventToEdit?.address || '');
  const [city, setCity] = useState(eventToEdit?.city || 'Chennai');
  const [guestCount, setGuestCount] = useState(eventToEdit?.guestCount || 500);

  // Photography package & services
  const [pkg, setPkg] = useState(eventToEdit?.package || 'Royal Cinematic Elite');
  const [candidPhoto, setCandidPhoto] = useState(eventToEdit?.services.candidPhoto ?? true);
  const [traditionalPhoto, setTraditionalPhoto] = useState(
    eventToEdit?.services.traditionalPhoto ?? true
  );
  const [cinematicVideo, setCinematicVideo] = useState(
    eventToEdit?.services.cinematicVideo ?? true
  );
  const [drone, setDrone] = useState(eventToEdit?.services.drone ?? true);
  const [album, setAlbum] = useState(eventToEdit?.services.album ?? true);
  const [albumCount, setAlbumCount] = useState(eventToEdit?.services.albumCount || 1);
  const [deliverables, setDeliverables] = useState(
    eventToEdit?.deliverables || '1 Teaser, 1 Main Film, 1 Velvet Heirloom Album, All Edited Photos'
  );

  // Equipment & Team
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    eventToEdit?.equipmentIds || ['eq-01', 'eq-04']
  );
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>(
    eventToEdit?.teamAssignments.map((t) => t.memberId) || ['tm-01', 'tm-03']
  );

  // Financials
  const [totalContract, setTotalContract] = useState(eventToEdit?.totalContract || 150000);
  const [discount, setDiscount] = useState(eventToEdit?.discount || 0);
  const finalAmount = Math.max(0, totalContract - discount);

  const [paymentDueDate, setPaymentDueDate] = useState(
    eventToEdit?.paymentDueDate || new Date().toISOString().split('T')[0]
  );
  const [internalNotes, setInternalNotes] = useState(eventToEdit?.internalNotes || '');

  if (!isOpen) return null;

  const toggleEquipment = (id: string) => {
    setSelectedEquipmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTeam = (id: string) => {
    setSelectedTeamMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId || !venueName.trim()) {
      alert('Please fill out Event Title, Client, and Venue.');
      return;
    }

    const teamAssignments = selectedTeamMemberIds.map((mId) => {
      const mem = teamList.find((t) => t.id === mId);
      return { memberId: mId, role: mem?.role || 'Photographer' };
    });

    const eventPayload: Omit<EventItem, 'id' | 'createdAt'> = {
      title,
      eventType,
      clientId,
      brideName,
      groomName,
      status,
      priority,
      eventDate,
      startTime,
      endTime,
      venueName,
      address,
      city,
      guestCount: Number(guestCount),
      package: pkg,
      services: {
        candidPhoto,
        traditionalPhoto,
        cinematicVideo,
        drone,
        album,
        albumCount: Number(albumCount),
      },
      deliverables,
      equipmentIds: selectedEquipmentIds,
      teamAssignments,
      totalContract: Number(totalContract),
      discount: Number(discount),
      finalAmount,
      paymentDueDate,
      internalNotes,
    };

    if (eventToEdit) {
      updateEvent(eventToEdit.id, eventPayload);
    } else {
      addEvent(eventPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#27555C] flex items-center justify-between bg-[#000F13]/50">
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              {eventToEdit ? 'Edit Event Shoot' : 'Schedule New Event Shoot'}
            </h3>
            <p className="text-xs text-[#AEC5C7]">
              Configure ceremony details, photography deliverables, team crew, and financials.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Basic Information */}
          <div>
            <h4 className="text-xs font-bold text-[#50E2E5] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={14} /> Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-gray-300 font-semibold mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul & Priya — Royal Wedding & Reception"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Event Type *</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Bride Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Nair"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Groom Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Workflow Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                >
                  {EVENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as EventPriority)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Scheduling & Venue */}
          <div className="pt-4 border-t border-[#27555C]/50">
            <h4 className="text-xs font-bold text-[#50E2E5] uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} /> Date, Time & Venue
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-300 font-semibold mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mayor Ramanathan Chettiar Hall (MRC)"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Package & Deliverables */}
          <div className="pt-4 border-t border-[#27555C]/50">
            <h4 className="text-xs font-bold text-[#50E2E5] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Camera size={14} /> Photography Package & Services
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Cinematic Elite"
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#000F13]/60 border border-[#27555C]">
                <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                  <input
                    type="checkbox"
                    checked={candidPhoto}
                    onChange={(e) => setCandidPhoto(e.target.checked)}
                    className="rounded text-[#50E2E5]"
                  />
                  <span>Candid Photography</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                  <input
                    type="checkbox"
                    checked={traditionalPhoto}
                    onChange={(e) => setTraditionalPhoto(e.target.checked)}
                    className="rounded text-[#50E2E5]"
                  />
                  <span>Traditional Photo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                  <input
                    type="checkbox"
                    checked={cinematicVideo}
                    onChange={(e) => setCinematicVideo(e.target.checked)}
                    className="rounded text-[#50E2E5]"
                  />
                  <span>Cinematic Video</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                  <input
                    type="checkbox"
                    checked={drone}
                    onChange={(e) => setDrone(e.target.checked)}
                    className="rounded text-[#50E2E5]"
                  />
                  <span>Drone Included</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                  <input
                    type="checkbox"
                    checked={album}
                    onChange={(e) => setAlbum(e.target.checked)}
                    className="rounded text-[#50E2E5]"
                  />
                  <span>Printed Album</span>
                </label>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Deliverables</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Teaser, 1 4K Main Film, 2 Velvet Albums"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Equipment & Team Assignment */}
          <div className="pt-4 border-t border-[#27555C]/50">
            <h4 className="text-xs font-bold text-[#50E2E5] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users size={14} /> Equipment & Studio Crew Allocation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Assign Crew Members</label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-[#000F13] border border-[#27555C]">
                  {teamList.map((tm) => (
                    <label
                      key={tm.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer text-gray-300"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTeamMemberIds.includes(tm.id)}
                          onChange={() => toggleTeam(tm.id)}
                          className="rounded text-[#50E2E5]"
                        />
                        <span className="font-semibold text-white">{tm.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{tm.role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Allocate Equipment</label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-[#000F13] border border-[#27555C]">
                  {equipmentList.map((eq) => (
                    <label
                      key={eq.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer text-gray-300"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedEquipmentIds.includes(eq.id)}
                          onChange={() => toggleEquipment(eq.id)}
                          className="rounded text-[#50E2E5]"
                        />
                        <span className="truncate">{eq.name}</span>
                      </div>
                      <span className="text-[10px] text-[#50E2E5] shrink-0 font-mono">
                        {eq.category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Financials & Auto Balance */}
          <div className="pt-4 border-t border-[#27555C]/50">
            <h4 className="text-xs font-bold text-[#50E2E5] uppercase tracking-wider mb-3 flex items-center gap-2">
              <IndianRupee size={14} /> Commercial & Contract Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Contract Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={totalContract}
                  onChange={(e) => setTotalContract(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white font-mono focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white font-mono focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Final Amount (₹)</label>
                <input
                  type="text"
                  readOnly
                  value={`₹${finalAmount.toLocaleString('en-IN')}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-bold font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#27555C] bg-[#000F13]/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-lg shadow-[#50E2E5]/20"
          >
            {eventToEdit ? 'Save Changes' : 'Confirm & Schedule Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

