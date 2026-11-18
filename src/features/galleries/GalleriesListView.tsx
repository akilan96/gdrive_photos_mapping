import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Images,
  Plus,
  Share2,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  MessageSquare,
  Search,
  Trash2,
  Edit,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { Gallery, GalleryStatus, GalleryPhoto } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { extractDriveFolderId } from '../../utils/formatters';
import { fetchDrivePhotos } from '../../services/googleDriveService';

export const GalleriesListView: React.FC = () => {
  const navigate = useNavigate();
  const galleries = useStudioStore((s) => s.galleries);
  const events = useStudioStore((s) => s.events);
  const clients = useStudioStore((s) => s.clients);
  const addGallery = useStudioStore((s) => s.addGallery);
  const updateGallery = useStudioStore((s) => s.updateGallery);
  const deleteGallery = useStudioStore((s) => s.deleteGallery);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shareModalGallery, setShareModalGallery] = useState<Gallery | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [googleDriveUrl, setGoogleDriveUrl] = useState(
    'https://drive.google.com/drive/folders/1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x?usp=drive_link'
  );
  const [maxFavourites, setMaxFavourites] = useState(60);
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Welcome to your private proofing gallery! Please shortlist your favourite photos for the album.'
  );
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80'
  );

  const [isFetchingDrive, setIsFetchingDrive] = useState(false);
  const [drivePreviewResult, setDrivePreviewResult] = useState<string | null>(null);
  const [fetchedDrivePhotos, setFetchedDrivePhotos] = useState<any[] | null>(null);
  const [syncingGalleryId, setSyncingGalleryId] = useState<string | null>(null);

  const handleTestDriveFetch = async () => {
    const fid = extractDriveFolderId(googleDriveUrl);
    if (!fid) {
      alert('Please enter a valid Google Drive folder link or folder ID.');
      return;
    }
    setIsFetchingDrive(true);
    setDrivePreviewResult('Connecting to Google Drive...');
    const res = await fetchDrivePhotos(fid);
    setIsFetchingDrive(false);
    if (res.success && res.photos.length > 0) {
      setDrivePreviewResult(`✓ Found ${res.photos.length} photos in Drive folder "${res.folderName}"!`);
      setFetchedDrivePhotos(res.photos);
      if (!title || title.trim() === '') {
        setTitle(`${res.folderName} — Client Proofing`);
      }
      if (res.photos[0]?.url) {
        setCoverPhotoUrl(res.photos[0].url);
      }
    } else {
      setDrivePreviewResult(`Notice: ${res.error || 'No photos found'}`);
    }
  };

  const handleSyncGalleryCard = async (gallery: Gallery) => {
    const fid = gallery.folderId || extractDriveFolderId(gallery.googleDriveUrl || '');
    if (!fid) {
      alert('No Google Drive folder associated with this gallery.');
      return;
    }
    setSyncingGalleryId(gallery.id);
    const res = await fetchDrivePhotos(fid);
    setSyncingGalleryId(null);
    if (res.success && res.photos.length > 0) {
      updateGallery(gallery.id, {
        photos: res.photos,
        title: res.folderName || gallery.title,
      });
      alert(`Live Sync Success! Loaded ${res.photos.length} photos from "${res.folderName}".`);
    } else {
      alert(`Sync failed: ${res.error || 'Could not fetch photos.'}`);
    }
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventId) {
      alert('Please fill out Gallery Title and Event.');
      return;
    }

    const event = events.find((ev) => ev.id === eventId);
    if (!event) return;

    const folderId = extractDriveFolderId(googleDriveUrl) || undefined;
    const shareId =
      folderId ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `gallery-${Date.now().toString().slice(-4)}`;

    let galleryPhotos = fetchedDrivePhotos;
    if ((!galleryPhotos || galleryPhotos.length === 0) && folderId) {
      const res = await fetchDrivePhotos(folderId);
      if (res.success && res.photos.length > 0) {
        galleryPhotos = res.photos;
      }
    }

    addGallery({
      shareId,
      title,
      eventId,
      clientId: event.clientId,
      googleDriveUrl,
      folderId,
      description: welcomeMessage,
      coverPhotoUrl: galleryPhotos?.[0]?.url || 'https://drive.google.com/thumbnail?id=1rrMKm4l_Jtc15YIeVJRqcyhm2V5e-a92&sz=w1600',
      photos: galleryPhotos || [],
      maxFavourites: Number(maxFavourites),
      allowDownload: true,
      allowUnfavorite: true,
      showFilenames: true,
      welcomeMessage,
      status: 'Published',
      selectedPhotoIds: [],
    });

    setIsAddModalOpen(false);
  };

  const getShareUrl = (g: Gallery) => `${window.location.origin}/gallery/${g.shareId}`;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredGalleries = galleries.filter(
    (g) =>
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.shareId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Client Proofing Galleries
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Generate luxury client-facing photo portals, share on WhatsApp, and review customer favourite selections.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-lg shadow-[#50E2E5]/20"
        >
          <Plus size={16} />
          <span>Create Client Gallery</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by gallery title, slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#092328] border border-[#27555C] text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#50E2E5]"
        />
      </div>

      {/* Galleries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGalleries.map((gal) => {
          const client = clients.find((c) => c.id === gal.clientId);
          const event = events.find((e) => e.id === gal.eventId);
          const shareUrl = getShareUrl(gal);

          return (
            <div
              key={gal.id}
              className="rounded-3xl bg-[#092328]/85 border border-[#27555C] hover:border-[#50E2E5]/60 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Cover Image & Badges */}
                <div
                  className="relative h-44 bg-cover bg-center cursor-pointer"
                  style={{
                    backgroundImage: `url("${
                      gal.coverPhotoUrl ||
                      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                    }")`,
                  }}
                  onClick={() => navigate(`/galleries/${gal.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#092328] via-black/30 to-black/50" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-black/70 text-white backdrop-blur-md uppercase tracking-wider">
                      {gal.photos.length} Photos
                    </span>
                    <Badge variant={gal.status === 'Submitted' ? 'green' : 'amber'}>
                      {gal.status}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <h3
                    onClick={() => navigate(`/galleries/${gal.id}`)}
                    className="text-base font-bold text-white hover:text-[#50E2E5] cursor-pointer transition-colors"
                  >
                    {gal.title}
                  </h3>
                  <p className="text-xs text-[#AEC5C7]">
                    Client: <strong className="text-white">{client?.fullName || 'N/A'}</strong>
                  </p>
                  <p className="text-xs text-gray-400">
                    Selection Limit: Max <b>{gal.maxFavourites}</b> favourites
                  </p>

                  {gal.selectedPhotoIds && gal.selectedPhotoIds.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold flex items-center justify-between">
                      <span>Client Shortlisted:</span>
                      <span className="font-bold">{gal.selectedPhotoIds.length} photos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-3 border-t border-[#27555C]/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => window.open(shareUrl, '_blank')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#50E2E5] text-black font-bold text-xs hover:bg-[#3bc8cb] transition-colors shadow-md shadow-[#50E2E5]/10"
                    title="Open Customer Photo Selection View"
                  >
                    <span>Open View</span>
                    <ExternalLink size={13} />
                  </button>
                  <button
                    onClick={() => handleSyncGalleryCard(gal)}
                    disabled={syncingGalleryId === gal.id}
                    className="p-1.5 rounded-xl text-gray-300 hover:text-[#50E2E5] bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                    title="Sync Latest Photos from Google Drive"
                  >
                    <RefreshCw size={15} className={syncingGalleryId === gal.id ? 'animate-spin text-[#50E2E5]' : ''} />
                  </button>
                  <button
                    onClick={() => setShareModalGallery(gal)}
                    className="p-1.5 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                    title="Share with Customer"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/galleries/${gal.id}`)}
                    className="text-xs text-[#50E2E5] hover:underline font-semibold"
                  >
                    Manage →
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(gal.id)}
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

      {/* Create Client Gallery Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg p-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-white font-heading mb-4">
              Create Client Proofing Gallery
            </h3>

            <form onSubmit={handleCreateGallery} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Gallery Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul & Priya — Wedding Proofs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select Event *</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Google Drive Folder Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://drive.google.com/drive/folders/YOUR_FOLDER_ID"
                    value={googleDriveUrl}
                    onChange={(e) => setGoogleDriveUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                  <button
                    type="button"
                    onClick={handleTestDriveFetch}
                    disabled={isFetchingDrive}
                    className="px-3.5 py-2 rounded-xl bg-[#50E2E5]/15 hover:bg-[#50E2E5]/25 border border-[#50E2E5]/40 text-[#50E2E5] font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <RefreshCw size={13} className={isFetchingDrive ? 'animate-spin' : ''} />
                    <span>{isFetchingDrive ? 'Fetching...' : 'Fetch Photos'}</span>
                  </button>
                </div>
                {drivePreviewResult ? (
                  <p
                    className={`text-[11px] mt-1.5 font-semibold ${
                      drivePreviewResult.includes('✓') ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {drivePreviewResult}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#AEC5C7] mt-1">
                    Folder ID automatically extracted for seamless real-time proofing.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Maximum Favourites Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={maxFavourites}
                    onChange={(e) => setMaxFavourites(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Cover Photo URL</label>
                  <input
                    type="text"
                    value={coverPhotoUrl}
                    onChange={(e) => setCoverPhotoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Customer Welcome Message
                </label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
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
                  Generate Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal with QR & WhatsApp */}
      {shareModalGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl space-y-5 text-xs">
            <button
              onClick={() => setShareModalGallery(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] text-[#50E2E5] font-bold uppercase">
                Customer Sharing
              </span>
              <h3 className="text-base font-bold text-white font-heading mt-0.5">
                {shareModalGallery.title}
              </h3>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  getShareUrl(shareModalGallery)
                )}`}
                alt="Gallery QR Code"
                className="w-36 h-36"
              />
              <p className="text-[10px] text-gray-700 font-bold mt-2">
                Scan to Open Customer Photo Portal
              </p>
            </div>

            {/* URL Copy Box */}
            <div className="p-3 rounded-xl bg-[#000F13] border border-[#27555C] flex items-center justify-between gap-2">
              <span className="font-mono text-gray-300 truncate text-[11px]">
                {getShareUrl(shareModalGallery)}
              </span>
              <button
                onClick={() => handleCopyLink(getShareUrl(shareModalGallery))}
                className="px-3 py-1.5 rounded-lg bg-[#50E2E5] hover:bg-[#3bc8cb] text-black font-bold shrink-0 flex items-center gap-1"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* WhatsApp Share Button */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hello! Here is your curated photography proofing gallery from Mersal Media: ${getShareUrl(
                  shareModalGallery
                )}\n\nPlease shortlist your favourite ${
                  shareModalGallery.maxFavourites
                } photos for album printing.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl font-bold bg-[#25D366] hover:bg-[#22bf5b] text-black flex items-center justify-center gap-2 transition-colors text-xs"
            >
              <MessageSquare size={16} />
              <span>Share via WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Gallery"
        message="Are you sure you want to remove this client proofing gallery?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteGallery(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

