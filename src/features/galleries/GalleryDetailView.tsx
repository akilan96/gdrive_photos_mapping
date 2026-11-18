import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Images,
  ArrowLeft,
  ExternalLink,
  Plus,
  Heart,
  Upload,
  Download,
  Printer,
  FileCheck,
  CheckCircle2,
  Trash2,
  Copy,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { Badge } from '../../components/common/Badge';
import { formatIndianDate, exportToCsv } from '../../utils/formatters';

export const GalleryDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const galleries = useStudioStore((s) => s.galleries);
  const events = useStudioStore((s) => s.events);
  const clients = useStudioStore((s) => s.clients);
  const addPhotosToGallery = useStudioStore((s) => s.addPhotosToGallery);
  const importSelectionReport = useStudioStore((s) => s.importSelectionReport);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'photos' | 'selections'>('selections');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoFilename, setNewPhotoFilename] = useState('');
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const gallery = galleries.find((g) => g.id === id);

  if (!gallery) {
    return (
      <div className="p-8 text-center text-white space-y-4">
        <h2 className="text-xl font-bold">Gallery Not Found</h2>
        <button
          onClick={() => navigate('/galleries')}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#50E2E5] text-black"
        >
          Back to Galleries
        </button>
      </div>
    );
  }

  const client = clients.find((c) => c.id === gallery.clientId);
  const event = events.find((e) => e.id === gallery.eventId);

  const selectedPhotos = gallery.photos.filter((p) =>
    (gallery.selectedPhotoIds || []).includes(p.id)
  );

  const handleAddSinglePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    addPhotosToGallery(gallery.id, [
      {
        id: `p-${Date.now()}`,
        filename: newPhotoFilename.trim() || `IMG_${Date.now().toString().slice(-4)}.jpg`,
        url: newPhotoUrl.trim(),
      },
    ]);

    setNewPhotoUrl('');
    setNewPhotoFilename('');
    setIsAddPhotoOpen(false);
  };

  // Import JSON Selection file from customer
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = importSelectionReport(json);
        setImportMessage(res.message);
      } catch (err) {
        alert('Failed to parse selection JSON file. Please ensure it is a valid report.');
      }
    };
    reader.readAsText(file);
  };

  // Export selected filenames to CSV
  const handleExportSelectedFilenames = () => {
    if (selectedPhotos.length === 0) {
      alert('No selected photos to export.');
      return;
    }

    const rows = selectedPhotos.map((p, index) => ({
      Index: index + 1,
      Filename: p.filename,
      Photo_ID: p.id,
      Caption: p.caption || '',
      Selected_For_Album: 'YES',
    }));

    exportToCsv(
      `Selections_${gallery.shareId}_${new Date().toISOString().split('T')[0]}.csv`,
      rows
    );
  };

  const shareUrl = `${window.location.origin}/gallery/${gallery.shareId}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/galleries')}
            className="p-2 rounded-xl bg-[#092328] hover:bg-white/5 text-gray-300 hover:text-white border border-[#27555C] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#50E2E5] font-bold uppercase">Proofing Portal</span>
              <span className="text-xs text-gray-400">• Slug: /{gallery.shareId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              {gallery.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(shareUrl, '_blank')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#50E2E5] text-black shadow-lg shadow-[#50E2E5]/20"
          >
            <span>Customer Portal</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Import Feedback Banner */}
      {importMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            {importMessage}
          </span>
          <button
            onClick={() => setImportMessage(null)}
            className="text-gray-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Gallery Metadata Header Card */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <p className="text-gray-400 uppercase font-semibold">Client</p>
          <p className="text-sm font-bold text-white mt-0.5">{client?.fullName || 'N/A'}</p>
          <p className="text-[11px] text-[#AEC5C7]">{client?.phone}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase font-semibold">Event Ceremony</p>
          <p className="text-sm font-bold text-[#50E2E5] mt-0.5">{event?.title}</p>
          <p className="text-[11px] text-gray-300">{event?.venueName}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase font-semibold">Photo Proofing Stats</p>
          <p className="text-sm font-bold text-white mt-0.5">
            {selectedPhotos.length} / {gallery.photos.length} Selected
          </p>
          <p className="text-[11px] text-gray-400">Limit: Max {gallery.maxFavourites} photos</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase font-semibold">Proofing Status</p>
          <div className="mt-1">
            <Badge variant={gallery.status === 'Submitted' ? 'green' : 'amber'}>
              {gallery.status}
            </Badge>
          </div>
          {gallery.submittedAt && (
            <p className="text-[11px] text-gray-400 mt-1">
              Submitted: {formatIndianDate(gallery.submittedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#27555C]/60 pb-3 no-print text-xs">
        <button
          onClick={() => setActiveTab('selections')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'selections'
              ? 'bg-[#50E2E5] text-black shadow-md shadow-[#50E2E5]/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Customer Favourites Review ({selectedPhotos.length})
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'photos'
              ? 'bg-[#50E2E5] text-black shadow-md shadow-[#50E2E5]/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All Gallery Photos ({gallery.photos.length})
        </button>
      </div>

      {/* Tab Content: Customer Favourites Review */}
      {activeTab === 'selections' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="p-4 rounded-2xl bg-[#000F13] border border-[#27555C] flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Client Selection Management:</span>
              <span className="text-gray-400">
                {selectedPhotos.length} photos shortlisted by customer
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-[#50E2E5]/15 hover:bg-[#50E2E5]/25 text-[#50E2E5] border border-[#50E2E5]/30 transition-colors"
                title="Upload client's exported Selection_Report.json file"
              >
                <Upload size={14} />
                <span>Import Selection JSON</span>
              </button>

              <button
                onClick={handleExportSelectedFilenames}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                <Download size={14} />
                <span>Export Filenames (CSV)</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                <Printer size={14} />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Client Notes if any */}
          {gallery.selectionNotes && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs">
              <p className="font-bold text-purple-300 uppercase mb-1">Client Note / Album Cover Request:</p>
              <p className="text-white italic">"{gallery.selectionNotes}"</p>
            </div>
          )}

          {/* Selected Photos Grid */}
          {selectedPhotos.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#092328]/40 border border-[#27555C]/40 text-xs">
              <Heart size={36} className="mx-auto text-gray-500 mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">No Selections Received Yet</h4>
              <p className="text-gray-400 max-w-sm mx-auto mb-4">
                The client has not submitted their final selections yet. You can share the gallery
                link or import a Selection JSON file if sent via WhatsApp.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 font-bold bg-[#50E2E5] text-black rounded-xl"
              >
                Import Client JSON File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden bg-[#000F13] border border-[#27555C] hover:border-[#50E2E5]/50 transition-all shadow-lg"
                >
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-black text-[#50E2E5] backdrop-blur-sm">
                    #{index + 1}
                  </div>
                  <div className="p-3 bg-[#092328]/90">
                    <p className="text-xs font-mono font-bold text-white truncate">
                      {photo.filename}
                    </p>
                    {photo.caption && (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{photo.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: All Photos & Add Photo */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <p className="text-xs text-gray-400">
              Showing all {gallery.photos.length} proofing photos in this collection.
            </p>
            <button
              onClick={() => setIsAddPhotoOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#50E2E5] text-black"
            >
              <Plus size={14} /> Add Photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.photos.map((photo) => {
              const isFav = (gallery.selectedPhotoIds || []).includes(photo.id);
              return (
                <div
                  key={photo.id}
                  className={`group relative rounded-2xl overflow-hidden bg-[#000F13] border transition-all ${
                    isFav ? 'border-[#50E2E5] ring-2 ring-[#50E2E5]/30' : 'border-[#27555C]'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-44 object-cover"
                  />
                  {isFav && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-[#50E2E5] text-black shadow-lg">
                      <Heart size={14} className="fill-black" />
                    </div>
                  )}
                  <div className="p-2.5 bg-[#092328]">
                    <p className="text-xs font-mono font-bold text-white truncate">
                      {photo.filename}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Single Photo Modal */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white font-heading mb-4">Add Photo URL</h3>
            <form onSubmit={handleAddSinglePhoto} className="space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/... or Google Drive URL"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Original Filename</label>
                <input
                  type="text"
                  placeholder="e.g. DSC_8992_Stage.jpg"
                  value={newPhotoFilename}
                  onChange={(e) => setNewPhotoFilename(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="px-4 py-2 font-medium text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#50E2E5] text-black rounded-xl"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

