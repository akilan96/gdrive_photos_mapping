import React, { useState } from 'react';
import { Users, Plus, Phone, Mail, Edit, Trash2, X, CheckCircle, Clock } from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { TeamMember, TeamRole } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const ROLES: TeamRole[] = [
  'Photographer',
  'Candid Photographer',
  'Videographer',
  'Cinematographer',
  'Drone Operator',
  'Editor',
  'Album Designer',
  'Assistant',
];

export const TeamListView: React.FC = () => {
  const team = useStudioStore((s) => s.team);
  const events = useStudioStore((s) => s.events);
  const addTeamMember = useStudioStore((s) => s.addTeamMember);
  const updateTeamMember = useStudioStore((s) => s.updateTeamMember);
  const deleteTeamMember = useStudioStore((s) => s.deleteTeamMember);

  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<TeamRole>('Photographer');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [availability, setAvailability] = useState<'Available' | 'On Shoot' | 'On Leave'>(
    'Available'
  );
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setRole('Photographer');
    setPhone('');
    setEmail('');
    setAvailability('Available');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (tm: TeamMember) => {
    setEditingMember(tm);
    setName(tm.name);
    setRole(tm.role);
    setPhone(tm.phone);
    setEmail(tm.email);
    setAvailability(tm.availability);
    setNotes(tm.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please fill out Name and Phone.');
      return;
    }

    if (editingMember) {
      updateTeamMember(editingMember.id, {
        name,
        role,
        phone,
        email,
        availability,
        notes,
      });
    } else {
      addTeamMember({
        name,
        role,
        phone,
        email,
        availability,
        notes,
      });
    }

    setIsModalOpen(false);
  };

  const filteredTeam = team.filter((tm) => (selectedRole === 'ALL' ? true : tm.role === selectedRole));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Studio Crew & Artists
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Directory of lead photographers, candid specialists, cinematographers, drone pilots, and retouchers.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-lg shadow-[#50E2E5]/20"
        >
          <Plus size={16} />
          <span>Add Crew Member</span>
        </button>
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setSelectedRole('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
            selectedRole === 'ALL'
              ? 'bg-[#50E2E5] text-black'
              : 'bg-[#092328] text-gray-300 hover:text-white border border-[#27555C]'
          }`}
        >
          All Crew ({team.length})
        </button>
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              selectedRole === r
                ? 'bg-[#50E2E5] text-black'
                : 'bg-[#092328] text-gray-300 hover:text-white border border-[#27555C]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeam.map((member) => {
          const assignedShoots = events.filter((e) =>
            e.teamAssignments.some((ta) => ta.memberId === member.id)
          );

          return (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-[#092328]/85 border border-[#27555C] hover:border-[#50E2E5]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#006A70] to-[#50E2E5] text-black flex items-center justify-center font-black text-sm">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <Badge
                    variant={
                      member.availability === 'Available'
                        ? 'green'
                        : member.availability === 'On Shoot'
                        ? 'cyan'
                        : 'gray'
                    }
                  >
                    {member.availability}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-white mb-0.5">{member.name}</h3>
                <p className="text-xs text-[#50E2E5] font-semibold">{member.role}</p>

                <div className="mt-3.5 space-y-1.5 text-xs text-gray-300 pt-3 border-t border-[#27555C]/40">
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-[#50E2E5]" />
                    <a href={`tel:${member.phone}`} className="hover:underline font-mono text-white">
                      {member.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-purple-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>

                {member.notes && (
                  <p className="text-xs text-gray-400 mt-2.5 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                    {member.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#27555C]/50 flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  <strong className="text-white">{assignedShoots.length}</strong> assigned shoots
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(member.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Crew Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-white font-heading mb-4">
              {editingMember ? 'Edit Crew Profile' : 'Add Crew Member'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senthil Nathan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Primary Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as TeamRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) =>
                      setAvailability(e.target.value as 'Available' | 'On Shoot' | 'On Leave')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  >
                    <option value="Available">Available</option>
                    <option value="On Shoot">On Shoot</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 97890 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="crew@mersalmedia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Specialization Notes</label>
                <textarea
                  rows={2}
                  placeholder="Camera gear familiarity, lighting expertise..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black rounded-xl shadow-lg shadow-[#50E2E5]/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Remove Crew Member"
        message="Are you sure you want to remove this team member from the studio directory?"
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteTeamMember(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

