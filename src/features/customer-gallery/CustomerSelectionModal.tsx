import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  X,
  Heart,
  Download,
  MessageSquare,
  Sparkles,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCustomerGalleryStore } from '../../stores/useCustomerGalleryStore';
import { downloadJson, exportToCsv } from '../../utils/formatters';

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  eventName: string;
}

export const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  clientName,
  eventName,
}) => {
  const navigate = useNavigate();
  const {
    gallery,
    favourites,
    generateSelectionReport,
    markAsSubmitted,
  } = useCustomerGalleryStore();

  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !gallery) return null;

  const selectedPhotos = gallery.photos.filter((p) => favourites.has(p.id));

  const handleFinalSubmit = () => {
    if (selectedPhotos.length === 0) {
      alert('Please select at least one favourite photo before submitting.');
      return;
    }

    // Trigger celebration confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#50E2E5', '#ff4757', '#ffffff', '#38bdf8'],
    });

    markAsSubmitted();
    setSubmitted(true);
  };

  const handleDownloadJsonReport = () => {
    const report = generateSelectionReport(clientName, eventName, notes);
    downloadJson(`Selection_Report_${gallery.shareId}.json`, report);
  };

  const handleDownloadCsvReport = () => {
    const rows = selectedPhotos.map((p, idx) => ({
      Index: idx + 1,
      Filename: p.filename,
      Photo_ID: p.id,
      Caption: p.caption || '',
      Selected_For_Album: 'YES',
    }));
    exportToCsv(`Selection_Filenames_${gallery.shareId}.csv`, rows);
  };

  const whatsappMessage = `Hello Mersal Media! We have finalized our album photo selections for ${eventName}.\n\nTotal Photos Selected: ${selectedPhotos.length}\nClient: ${clientName}\nNotes: ${notes || 'None'}\n\nLooking forward to the album design!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs text-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-[#27555C] flex items-center justify-between bg-[#000F13]/50">
          <div>
            <span className="text-[10px] text-[#50E2E5] font-bold uppercase tracking-wider">
              Photo Proofing Submission
            </span>
            <h3 className="text-lg font-bold text-white font-heading mt-0.5">
              Review Selected Favourites
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!submitted ? (
            <>
              {/* Summary Stats */}
              <div className="p-4 rounded-2xl bg-[#000F13] border border-[#27555C] flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Total Shortlisted Photos:</p>
                  <p className="text-xl font-black text-[#50E2E5]">
                    {selectedPhotos.length} / {gallery.maxFavourites} Selected
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Client / Couple:</p>
                  <p className="font-bold text-white">{clientName}</p>
                </div>
              </div>

              {/* Thumbnails of Selected Photos */}
              <div>
                <p className="font-bold text-white mb-2">Shortlisted Photos Preview:</p>
                {selectedPhotos.length === 0 ? (
                  <p className="text-gray-400 italic">No photos selected yet.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-2 bg-[#000F13] rounded-xl border border-[#27555C]">
                    {selectedPhotos.map((p) => (
                      <div
                        key={p.id}
                        className="relative aspect-square rounded-lg overflow-hidden border border-white/10"
                      >
                        <img
                          src={p.url}
                          alt={p.filename}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Special Instructions & Album Cover Notes */}
              <div>
                <label className="block font-bold text-white mb-1">
                  Album Notes & Cover Photo Choice:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please use DSC_4012 as the velvet album cover photo. Ensure family portrait is printed on spread 10."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              {/* Submission Action */}
              <button
                onClick={handleFinalSubmit}
                disabled={selectedPhotos.length === 0}
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#50E2E5] to-[#3bc8cb] hover:from-[#65e8eb] hover:to-[#50E2E5] disabled:bg-gray-700 disabled:text-gray-500 text-black shadow-xl shadow-[#50E2E5]/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle size={18} />
                <span>Submit Final Selection ({selectedPhotos.length} Photos)</span>
              </button>
            </>
          ) : (
            /* Celebration Success State */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle size={36} />
              </div>

              <div>
                <h4 className="text-xl font-black text-white font-heading">
                  Selection Submitted Successfully!
                </h4>
                <p className="text-xs text-[#AEC5C7] max-w-md mx-auto mt-1 leading-relaxed">
                  Thank you! Your shortlist of {selectedPhotos.length} favourite photos has been
                  recorded for {eventName}.
                </p>
              </div>

              {/* Download Reports Actions */}
              <div className="p-4 rounded-2xl bg-[#000F13] border border-[#27555C] space-y-3 text-left">
                <p className="font-bold text-white text-xs">Share or Save Your Selection Report:</p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleDownloadJsonReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold bg-[#50E2E5] text-black hover:bg-[#3bc8cb] transition-colors"
                  >
                    <Download size={14} />
                    <span>Download JSON Report</span>
                  </button>
                  <button
                    onClick={handleDownloadCsvReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <FileText size={14} />
                    <span>Download CSV Filenames</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  You can send this JSON report directly to Mersal Media to sync into the studio dashboard.
                </p>
              </div>

              {/* WhatsApp Share Button */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-[#25D366] hover:bg-[#22bf5b] text-black flex items-center justify-center gap-2 transition-colors text-xs"
              >
                <MessageSquare size={16} />
                <span>Notify Mersal Media on WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-white underline pt-2"
              >
                Return to Gallery
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

