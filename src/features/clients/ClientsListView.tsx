import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  Edit,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { Client } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatINR } from '../../utils/formatters';

export const ClientsListView: React.FC = () => {
  const navigate = useNavigate();
  const clients = useStudioStore((s) => s.clients);
  const events = useStudioStore((s) => s.events);
  const payments = useStudioStore((s) => s.payments);
  const addClient = useStudioStore((s) => s.addClient);
  const updateClient = useStudioStore((s) => s.updateClient);
  const deleteClient = useStudioStore((s) => s.deleteClient);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingClient(null);
    setFullName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
    setCity('Chennai');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setFullName(c.fullName);
    setPhone(c.phone);
    setWhatsapp(c.whatsapp);
    setEmail(c.email);
    setAddress(c.address);
    setCity(c.city);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Please fill out Full Name and Phone Number.');
      return;
    }

    if (editingClient) {
      updateClient(editingClient.id, {
        fullName,
        phone,
        whatsapp: whatsapp || phone,
        email,
        address,
        city,
        notes,
      });
    } else {
      addClient({
        fullName,
        phone,
        whatsapp: whatsapp || phone,
        email,
        address,
        city,
        notes,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      const res = deleteClient(deleteConfirmId);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to delete client');
      }
      setDeleteConfirmId(null);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Client Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Manage photography couples, corporate accounts, contact details, and booking histories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-lg shadow-[#50E2E5]/20"
        >
          <Plus size={16} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by client name, city, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#092328] border border-[#27555C] text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#50E2E5]"
        />
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientEvents = events.filter((e) => e.clientId === client.id);
          const totalBookingValue = clientEvents.reduce((s, e) => s + e.finalAmount, 0);
          const clientPayments = payments.filter((p) => p.clientId === client.id);
          const totalPaid = clientPayments.reduce((s, p) => s + p.amount, 0);
          const outstanding = Math.max(0, totalBookingValue - totalPaid);

          return (
            <div
              key={client.id}
              className="rounded-2xl bg-[#092328]/85 border border-[#27555C] hover:border-[#50E2E5]/60 p-5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#50E2E5]/15 border border-[#50E2E5]/30 flex items-center justify-center font-bold text-[#50E2E5] text-sm">
                    {client.fullName.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(client)}
                      title="Edit Client"
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(client.id)}
                      title="Delete Client"
                      className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="text-sm font-bold text-white hover:text-[#50E2E5] cursor-pointer transition-colors"
                >
                  {client.fullName}
                </h3>
                <p className="text-xs text-[#AEC5C7] flex items-center gap-1.5 mt-1">
                  <MapPin size={12} className="text-rose-400" /> {client.city}
                </p>

                {/* Contact Links */}
                <div className="mt-3.5 space-y-1.5 text-xs text-gray-300 pt-3 border-t border-[#27555C]/40">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Phone size={12} className="text-[#50E2E5]" /> Phone:
                    </span>
                    <a href={`tel:${client.phone}`} className="hover:underline text-white font-mono">
                      {client.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <MessageSquare size={12} className="text-emerald-400" /> WhatsApp:
                    </span>
                    <a
                      href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-emerald-400 font-mono"
                    >
                      Chat Direct
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Mail size={12} className="text-purple-400" /> Email:
                    </span>
                    <span className="truncate max-w-[170px] text-gray-300">{client.email}</span>
                  </div>
                </div>
              </div>

              {/* Booking Summary Footnote */}
              <div className="mt-4 pt-3 border-t border-[#27555C]/50 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">
                    {clientEvents.length} Shoots Booked
                  </p>
                  <p className="font-bold text-white">
                    {formatINR(totalBookingValue)}{' '}
                    <span className={outstanding === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      ({outstanding === 0 ? 'Clear' : `Due ${formatINR(outstanding)}`})
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="text-xs text-[#50E2E5] hover:underline font-semibold"
                >
                  Profile →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg p-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-white font-heading mb-4">
              {editingClient ? 'Edit Client Profile' : 'Add New Client'}
            </h3>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name / Couple *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma & Priya Nair"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98402 11223"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="+91 98402 11223"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street / Flat details"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Client preferences, package interests, etc."
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
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Client Record"
        message="Are you sure you want to delete this client? Clients with active event bookings cannot be deleted."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

