import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  Printer,
  Calendar,
  Users,
  IndianRupee,
  Trash2,
  X,
  FileCheck,
  CheckCircle,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { Payment, PaymentMethod } from '../../types';
import { formatINR, formatIndianDate, exportToCsv } from '../../utils/formatters';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const PaymentsListView: React.FC = () => {
  const payments = useStudioStore((s) => s.payments);
  const events = useStudioStore((s) => s.events);
  const clients = useStudioStore((s) => s.clients);
  const settings = useStudioStore((s) => s.settings);
  const addPayment = useStudioStore((s) => s.addPayment);
  const deletePayment = useStudioStore((s) => s.deletePayment);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [amount, setAmount] = useState<number>(25000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');

  // Calculations
  const totalContract = events.reduce((s, e) => s + e.finalAmount, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = Math.max(0, totalContract - totalCollected);

  const filteredPayments = payments
    .filter((p) => {
      const event = events.find((e) => e.id === p.eventId);
      const client = clients.find((c) => c.id === p.clientId);

      const matchesSearch =
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event && event.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client && client.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.transactionReference &&
          p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMethod = selectedMethod === 'ALL' || p.paymentMethod === selectedMethod;

      return matchesSearch && matchesMethod;
    })
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || amount <= 0) {
      alert('Please select an event and specify a valid amount.');
      return;
    }

    const selectedEvt = events.find((ev) => ev.id === eventId);
    if (!selectedEvt) return;

    addPayment({
      eventId,
      clientId: selectedEvt.clientId,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      transactionReference,
      notes,
      recordedBy: 'Studio Admin',
    });

    setIsAddModalOpen(false);
    setTransactionReference('');
    setNotes('');
  };

  const handleExportCsv = () => {
    const rows = filteredPayments.map((p) => {
      const event = events.find((e) => e.id === p.eventId);
      const client = clients.find((c) => c.id === p.clientId);
      return {
        Receipt_ID: p.id,
        Date: p.paymentDate,
        Event_Title: event?.title || '',
        Client_Name: client?.fullName || '',
        Amount: p.amount,
        Method: p.paymentMethod,
        Reference: p.transactionReference || '',
        Notes: p.notes || '',
        Recorded_By: p.recordedBy,
      };
    });
    exportToCsv(`Mersal_Media_Payments_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50 no-print">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Payments & Accounts
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Track customer advances, milestone settlements, balance dues, and payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#092328] hover:bg-[#103840] text-gray-200 border border-[#27555C] transition-colors"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-lg shadow-[#50E2E5]/20"
          >
            <Plus size={16} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Top Accounts Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="p-5 rounded-2xl bg-[#092328]/80 border border-[#27555C]">
          <p className="text-xs font-bold uppercase text-gray-400">Total Contract Value</p>
          <p className="text-2xl font-black text-white mt-1 font-heading">{formatINR(totalContract)}</p>
          <p className="text-[11px] text-[#AEC5C7] mt-0.5">{events.length} active event shoots</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#092328]/80 border border-emerald-500/30">
          <p className="text-xs font-bold uppercase text-emerald-400">Total Received</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-heading">
            {formatINR(totalCollected)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">{payments.length} transactions recorded</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#092328]/80 border border-rose-500/30">
          <p className="text-xs font-bold uppercase text-rose-400">Total Balance Due</p>
          <p className="text-2xl font-black text-rose-400 mt-1 font-heading">
            {formatINR(totalOutstanding)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Pending client milestone payments</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#092328]/80 border border-[#27555C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs no-print">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by receipt ID, event, client, transaction ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-white placeholder-gray-400 focus:outline-none focus:border-[#50E2E5]"
          />
        </div>

        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-gray-300 focus:outline-none focus:border-[#50E2E5]"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
          <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
          <option value="Cash">Cash</option>
          <option value="Card">Credit / Debit Card</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      {/* Payment Transactions Table */}
      <div className="overflow-x-auto rounded-2xl bg-[#092328]/85 border border-[#27555C] no-print">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#000F13]/80 text-[#AEC5C7] uppercase font-bold border-b border-[#27555C]">
            <tr>
              <th className="py-3 px-4">Receipt ID</th>
              <th className="py-3 px-4">Event & Client</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Receipt</th>
              <th className="py-3 px-4 text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27555C]/40">
            {filteredPayments.map((p) => {
              const event = events.find((e) => e.id === p.eventId);
              const client = clients.find((c) => c.id === p.clientId);

              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#50E2E5]">{p.id}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{event?.title || 'Studio Shoot'}</p>
                    <p className="text-[11px] text-gray-400">{client?.fullName || 'N/A'}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-400">
                    {p.transactionReference || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-gray-300">{formatIndianDate(p.paymentDate)}</td>
                  <td className="py-3.5 px-4 text-gray-400 max-w-xs truncate">{p.notes || '-'}</td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm">
                    {formatINR(p.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setReceiptPayment(p)}
                      title="Print Branded Payment Receipt"
                      className="p-1.5 rounded-lg text-[#50E2E5] hover:bg-[#50E2E5]/10 transition-colors"
                    >
                      <Printer size={15} />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      title="Delete Payment"
                      className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-white font-heading mb-4">
              Record Client Payment
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select Event *</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({formatINR(ev.finalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="500"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white font-mono text-sm focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Transaction / UTR Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-99882211 or NEFT-HDFC-01"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Payment Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Booking Advance or Shoot Day Installment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black rounded-xl shadow-lg shadow-[#50E2E5]/20"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Branded Receipt Modal */}
      {receiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white text-gray-900 rounded-3xl p-8 shadow-2xl overflow-hidden print-card">
            {/* Close button (hidden in print) */}
            <button
              onClick={() => setReceiptPayment(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black no-print"
            >
              <X size={20} />
            </button>

            {/* Receipt Header */}
            <div className="border-b-2 border-gray-900 pb-5 mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-gray-900 font-heading">
                  {settings.studioName}
                </h2>
                <p className="text-xs text-gray-600 font-medium">{settings.tagline}</p>
                <p className="text-xs text-gray-500 mt-1">{settings.address}</p>
                <p className="text-xs text-gray-500">Phone: {settings.phone}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gray-900 text-white font-mono text-xs font-bold rounded-lg uppercase">
                  Receipt
                </span>
                <p className="text-xs font-mono font-bold text-gray-700 mt-2">
                  #{receiptPayment.id}
                </p>
                <p className="text-xs text-gray-500">
                  Date: {formatIndianDate(receiptPayment.paymentDate)}
                </p>
              </div>
            </div>

            {/* Receipt Details */}
            {(() => {
              const event = events.find((e) => e.id === receiptPayment.eventId);
              const client = clients.find((c) => c.id === receiptPayment.clientId);
              return (
                <div className="space-y-4 text-xs text-gray-700">
                  <div className="p-3.5 bg-gray-50 rounded-xl space-y-1.5 border border-gray-200">
                    <p>
                      <strong className="text-gray-900">Received With Thanks From:</strong>{' '}
                      {client?.fullName}
                    </p>
                    <p>
                      <strong className="text-gray-900">Shoot / Event:</strong> {event?.title}
                    </p>
                    <p>
                      <strong className="text-gray-900">Payment Mode:</strong>{' '}
                      {receiptPayment.paymentMethod}{' '}
                      {receiptPayment.transactionReference
                        ? `(Ref: ${receiptPayment.transactionReference})`
                        : ''}
                    </p>
                    <p>
                      <strong className="text-gray-900">Description:</strong>{' '}
                      {receiptPayment.notes || 'Professional Photography Services'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center py-4 border-y-2 border-gray-900">
                    <span className="text-sm font-bold uppercase text-gray-900">
                      Amount Received:
                    </span>
                    <span className="text-2xl font-black text-gray-900">
                      {formatINR(receiptPayment.amount)}
                    </span>
                  </div>

                  <div className="pt-6 flex items-center justify-between text-xs text-gray-500">
                    <div>
                      <p>Recorded by: {receiptPayment.recordedBy}</p>
                      <p className="text-[10px]">Official Digital Receipt • Mersal Media</p>
                    </div>
                    <div className="text-center">
                      <div className="h-10 w-28 border-b border-gray-400 mb-1" />
                      <p className="text-[10px] uppercase font-bold text-gray-700">
                        Authorized Signature
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Print Action Button (hidden in print) */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 font-bold text-xs bg-gray-900 text-white hover:bg-gray-800 rounded-xl flex items-center gap-2"
              >
                <Printer size={15} />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Payment Entry"
        message="Are you sure you want to delete this payment record? This will adjust the event's outstanding balance."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirmId) {
            deletePayment(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

