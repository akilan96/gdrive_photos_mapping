import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  Images,
  ArrowLeft,
  ExternalLink,
  CreditCard,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { Badge } from '../../components/common/Badge';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const ClientProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const clients = useStudioStore((s) => s.clients);
  const events = useStudioStore((s) => s.events);
  const payments = useStudioStore((s) => s.payments);
  const galleries = useStudioStore((s) => s.galleries);

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <div className="p-8 text-center text-white space-y-4">
        <h2 className="text-xl font-bold">Client Not Found</h2>
        <button
          onClick={() => navigate('/clients')}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#50E2E5] text-black"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const clientEvents = events.filter((e) => e.clientId === client.id);
  const totalContract = clientEvents.reduce((s, e) => s + e.finalAmount, 0);
  const clientPayments = payments.filter((p) => p.clientId === client.id);
  const totalPaid = clientPayments.reduce((s, p) => s + p.amount, 0);
  const balanceDue = Math.max(0, totalContract - totalPaid);
  const clientGalleries = galleries.filter((g) => g.clientId === client.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#27555C]/50">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-xl bg-[#092328] hover:bg-white/5 text-gray-300 hover:text-white border border-[#27555C] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-xs text-[#50E2E5] font-bold uppercase">Client Profile</span>
          <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            {client.fullName}
          </h1>
        </div>
      </div>

      {/* Client Overview Card */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase text-xs">Contact Details</h3>
          <div className="flex items-center gap-2 text-gray-300">
            <Phone size={14} className="text-[#50E2E5]" />
            <a href={`tel:${client.phone}`} className="hover:underline font-mono text-white">
              {client.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MessageSquare size={14} className="text-emerald-400" />
            <a
              href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-emerald-400 font-mono font-semibold"
            >
              WhatsApp Direct Chat
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Mail size={14} className="text-purple-400" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={14} className="text-rose-400" />
            <span>
              {client.address}, {client.city}
            </span>
          </div>
        </div>

        {/* Commercial Summary */}
        <div className="space-y-2 p-4 rounded-2xl bg-[#000F13] border border-[#27555C]">
          <h3 className="font-bold text-white uppercase text-xs mb-2">Billing Summary</h3>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Bookings:</span>
            <span className="font-bold text-white">{formatINR(totalContract)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Paid:</span>
            <span className="font-bold text-emerald-400">{formatINR(totalPaid)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#27555C]">
            <span className="text-gray-400">Balance Due:</span>
            <span className={`font-black ${balanceDue === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatINR(balanceDue)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2 p-4 rounded-2xl bg-[#000F13] border border-[#27555C]">
          <h3 className="font-bold text-white uppercase text-xs">Client Preferences & Notes</h3>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {client.notes || 'No notes added for this client.'}
          </p>
        </div>
      </div>

      {/* Linked Events Timeline */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] space-y-4">
        <h3 className="text-sm font-bold text-white font-heading">
          Linked Bookings & Event Shoots ({clientEvents.length})
        </h3>
        <div className="space-y-3">
          {clientEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => navigate(`/events/${evt.id}`)}
              className="p-4 rounded-2xl bg-[#000F13] border border-[#27555C] hover:border-[#50E2E5]/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <p className="font-bold text-white text-sm hover:text-[#50E2E5] transition-colors">
                  {evt.title}
                </p>
                <p className="text-gray-400 mt-1">
                  {formatIndianDate(evt.eventDate)} • {evt.venueName}, {evt.city} • {evt.package}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={evt.status === 'Delivered' ? 'green' : 'cyan'}>{evt.status}</Badge>
                <p className="font-bold text-white mt-1.5">{formatINR(evt.finalAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Proofing Galleries */}
      {clientGalleries.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] space-y-4">
          <h3 className="text-sm font-bold text-white font-heading">
            Client Proofing Galleries ({clientGalleries.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clientGalleries.map((gal) => (
              <div
                key={gal.id}
                className="p-4 rounded-2xl bg-[#000F13] border border-[#27555C] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white">{gal.title}</p>
                  <p className="text-gray-400 mt-0.5">
                    {gal.photos.length} Photos • Status: {gal.status}
                  </p>
                </div>
                <button
                  onClick={() => window.open(`/gallery/${gal.shareId}`, '_blank')}
                  className="flex items-center gap-1 text-[#50E2E5] hover:underline font-semibold"
                >
                  <span>Open Portal</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] space-y-4">
        <h3 className="text-sm font-bold text-white font-heading">
          Payment Transactions ({clientPayments.length})
        </h3>
        <div className="overflow-x-auto rounded-xl border border-[#27555C]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#000F13] text-[#AEC5C7] uppercase font-bold border-b border-[#27555C]">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27555C]/40">
              {clientPayments.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 px-3 font-mono text-[#50E2E5]">{p.id}</td>
                  <td className="py-3 px-3 text-gray-300">{formatIndianDate(p.paymentDate)}</td>
                  <td className="py-3 px-3 text-gray-300">{p.paymentMethod}</td>
                  <td className="py-3 px-3 font-mono text-gray-400">{p.transactionReference || '-'}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">
                    {formatINR(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

