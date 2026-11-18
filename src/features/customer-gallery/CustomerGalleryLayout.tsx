import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Grid,
  Maximize2,
  Filter,
  CheckCircle,
  Share2,
  Sparkles,
  Info,
  X,
  Camera,
  ChevronRight,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { useCustomerGalleryStore } from '../../stores/useCustomerGalleryStore';
import { CustomerGridView } from './CustomerGridView';
import { CustomerFocusView } from './CustomerFocusView';
import { CustomerSelectionModal } from './CustomerSelectionModal';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { fetchDrivePhotos } from '../../services/googleDriveService';
import { extractDriveFolderId } from '../../utils/formatters';
import config from '../../config.json';
import { Gallery } from '../../types';

export const CustomerGalleryLayout: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const galleries = useStudioStore((s) => s.galleries);
  const events = useStudioStore((s) => s.events);
  const clients = useStudioStore((s) => s.clients);

  const {
    gallery,
    favourites,
    viewMode,
    filterFavouritesOnly,
    lightboxPhoto,
    isLoadingDrive,
    setGallery,
    updateGalleryPhotos,
    setViewMode,
    setFilterFavouritesOnly,
    setLightboxPhoto,
    setIsLoadingDrive,
  } = useCustomerGalleryStore();

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [customDriveInput, setCustomDriveInput] = useState('');
  const [syncingNow, setSyncingNow] = useState(false);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);

  // Load and sync gallery
  useEffect(() => {
    // If shareId matches a studio route, redirect there
    const studioRoutes = [
      'login',
      'dashboard',
      'events',
      'clients',
      'calendar',
      'payments',
      'equipment',
      'team',
      'workflow',
      'galleries',
      'settings',
    ];
    if (shareId && studioRoutes.includes(shareId.toLowerCase())) {
      navigate(`/${shareId.toLowerCase()}`, { replace: true });
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const queryLink = searchParams.get('link');
    const queryFolder = searchParams.get('folder');
    const extractedFromQuery = queryLink ? extractDriveFolderId(queryLink) : queryFolder;

    const rawParam =
      extractedFromQuery ||
      shareId ||
      config.DEFAULT_FOLDER_ID ||
      '1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x';

    // Check if matching gallery exists in store
    let targetGallery = galleries.find(
      (g) =>
        g.shareId.toLowerCase() === rawParam?.toLowerCase() ||
        g.id === rawParam ||
        g.folderId === rawParam
    );

    // If no matching gallery exists, create an on-the-fly gallery for the Drive folder
    if (!targetGallery && rawParam) {
      const extractedId = extractDriveFolderId(rawParam) || rawParam;
      targetGallery = {
        id: `gal-drive-${extractedId}`,
        shareId: extractedId,
        title: 'Testing — Live Google Drive Gallery',
        eventId: 'evt-201',
        clientId: 'cli-101',
        folderId: extractedId,
        googleDriveUrl: `https://drive.google.com/drive/folders/${extractedId}`,
        photos: [],
        maxFavourites: 80,
        allowDownload: true,
        allowUnfavorite: true,
        showFilenames: true,
        welcomeMessage:
          'Welcome to your private Google Drive proofing gallery! Review and select your favourite photos in real-time.',
        status: 'Published',
        createdAt: new Date().toISOString().split('T')[0],
      };
    }

    if (targetGallery) {
      // Strip any unsplash demo photos immediately so they never flash on screen
      const cleanTarget = {
        ...targetGallery,
        photos: (targetGallery.photos || []).filter((p) => !p.url.includes('unsplash.com')),
      };
      setGallery(cleanTarget);

      // Extract folder ID
      const folderId =
        extractedFromQuery ||
        targetGallery.folderId ||
        extractDriveFolderId(targetGallery.googleDriveUrl || '') ||
        (rawParam && rawParam.length > 15 ? rawParam : undefined) ||
        config.DEFAULT_FOLDER_ID ||
        '1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x';

      if (folderId) {
        setIsLoadingDrive(true);
        setDriveStatus('Connecting to Google Drive in real-time...');

        fetchDrivePhotos(folderId).then((res) => {
          setIsLoadingDrive(false);
          if (res.success && res.photos.length > 0) {
            updateGalleryPhotos(res.photos, res.folderName);
            setDriveStatus(`✓ Live Sync Active: ${res.photos.length} photos loaded from Google Drive (${res.folderName})`);
          } else if (res.error) {
            setDriveStatus(`Drive Notice: ${res.error}`);
          }
        });
      }
    }
  }, [shareId, galleries, setGallery, updateGalleryPhotos, setIsLoadingDrive, navigate]);

  const handleManualSync = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryLink = searchParams.get('link');
    const queryFolder = searchParams.get('folder');
    const extractedFromQuery = queryLink ? extractDriveFolderId(queryLink) : queryFolder;

    const targetFolderId =
      extractedFromQuery ||
      gallery?.folderId ||
      extractDriveFolderId(gallery?.googleDriveUrl || '') ||
      shareId ||
      config.DEFAULT_FOLDER_ID ||
      '1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x';

    setSyncingNow(true);
    setDriveStatus('Syncing real-time updates from Google Drive...');
    const res = await fetchDrivePhotos(targetFolderId);
    setSyncingNow(false);
    if (res.success && res.photos.length > 0) {
      updateGalleryPhotos(res.photos, res.folderName);
      setDriveStatus(`✓ Live Sync Complete: ${res.photos.length} photos up to date (${res.folderName})`);
    } else if (res.error) {
      setDriveStatus(`Sync error: ${res.error}`);
    }
  };

  const handleConnectCustomFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDriveInput.trim()) return;
    const extractedId = extractDriveFolderId(customDriveInput) || customDriveInput.trim();
    setIsLoadingDrive(true);
    setDriveStatus('Connecting to Drive folder ' + extractedId + '...');
    setIsDriveModalOpen(false);

    const res = await fetchDrivePhotos(extractedId);
    setIsLoadingDrive(false);
    if (res.success && res.photos.length > 0) {
      const dynamicGallery: Gallery = {
        id: `gal-drive-${extractedId}`,
        shareId: extractedId,
        title: res.folderName || 'Live Google Drive Gallery',
        eventId: 'evt-201',
        clientId: 'cli-101',
        folderId: extractedId,
        googleDriveUrl: `https://drive.google.com/drive/folders/${extractedId}`,
        photos: res.photos,
        maxFavourites: 80,
        allowDownload: true,
        allowUnfavorite: true,
        showFilenames: true,
        welcomeMessage: `Welcome to your curated real-time gallery for "${res.folderName}". Review and select your favourite photos.`,
        status: 'Published',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setGallery(dynamicGallery);
      setDriveStatus(`✓ Live Sync Active: ${res.photos.length} photos loaded from "${res.folderName}"`);
    } else {
      setDriveStatus(`Failed to load Drive folder: ${res.error || 'No photos found'}`);
    }
  };

  if (!gallery) {
    return (
      <div className="min-h-screen bg-[#000F13] text-white flex flex-col items-center justify-center p-6 text-center">
        <Camera size={48} className="text-[#50E2E5] mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold font-heading mb-2">Loading Gallery...</h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          Fetching curated photos from Google Drive in real-time.
        </p>
      </div>
    );
  }

  const event = events.find((e) => e.id === gallery.eventId);
  const client = clients.find((c) => c.id === gallery.clientId);

  // Strictly filter out any Unsplash demo photos
  const cleanPhotos = (gallery.photos || []).filter(
    (p) => !p.url.includes('unsplash.com')
  );

  const totalPhotos = cleanPhotos.length;
  const selectedCount = favourites.size;
  const maxFavs = gallery.maxFavourites || 80;
  const progressPercent = Math.min(100, Math.round((selectedCount / maxFavs) * 100));

  const displayedPhotos = filterFavouritesOnly
    ? cleanPhotos.filter((p) => favourites.has(p.id))
    : cleanPhotos;

  return (
    <div className="min-h-screen bg-[#000F13] text-[#F6FAFA] flex flex-col selection:bg-[#50E2E5] selection:text-black">
      {/* Top Floating Client Header Bar */}
      <header className="sticky top-0 z-40 h-16 px-4 sm:px-8 bg-[#000F13]/90 backdrop-blur-md border-b border-[#27555C]/60 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006A70] to-[#50E2E5] flex items-center justify-center text-black font-black shadow-lg shadow-[#50E2E5]/20">
            <Camera size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white font-heading tracking-wide uppercase">
              Mersal Media
            </h1>
            <p className="text-[10px] text-[#50E2E5] font-semibold uppercase tracking-wider">
              Curated Client Proofing
            </p>
          </div>
        </div>

        {/* Center / Right: Live Favourite Badge & View Mode Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Favourites Counter Badge */}
          <button
            onClick={() => setFilterFavouritesOnly(!filterFavouritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterFavouritesOnly
                ? 'bg-[#50E2E5] text-black shadow-lg shadow-[#50E2E5]/25'
                : 'bg-[#50E2E5]/15 text-[#50E2E5] border border-[#50E2E5]/30 hover:bg-[#50E2E5]/25'
            }`}
          >
            <Heart size={15} className={filterFavouritesOnly ? 'fill-black' : 'fill-[#50E2E5]'} />
            <span>
              {selectedCount} / {maxFavs} Selected
            </span>
          </button>

          {/* Live Sync Drive Button */}
          <button
            onClick={handleManualSync}
            disabled={syncingNow || isLoadingDrive}
            title="Refresh real-time photos from Google Drive"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#092328] hover:bg-[#123942] border border-[#27555C] text-[#50E2E5] transition-all"
          >
            <RefreshCw size={14} className={syncingNow || isLoadingDrive ? 'animate-spin' : ''} />
            <span className="hidden md:inline">Sync Drive</span>
          </button>

          {/* Connect Another Drive Folder Button */}
          <button
            onClick={() => {
              setCustomDriveInput(gallery.googleDriveUrl || '');
              setIsDriveModalOpen(true);
            }}
            title="Paste and connect any Google Drive folder"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#092328] hover:bg-[#123942] border border-[#27555C] text-gray-300 hover:text-white transition-all"
          >
            <FolderOpen size={14} className="text-[#50E2E5]" />
            <span>Drive Link</span>
          </button>

          {/* View Mode Toggle: Grid vs Focus (1 per screen) */}
          <div className="hidden sm:flex items-center bg-[#092328] p-1 rounded-xl border border-[#27555C] text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#50E2E5] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid size={14} />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('focus')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-colors ${
                viewMode === 'focus'
                  ? 'bg-[#50E2E5] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Maximize2 size={14} />
              <span>Focus (1 / Screen)</span>
            </button>
          </div>

          {/* Review & Submit Button */}
          <button
            onClick={() => setIsSelectionModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#50E2E5] to-[#3bc8cb] hover:from-[#65e8eb] hover:to-[#50E2E5] text-black shadow-lg shadow-[#50E2E5]/20 transition-all hover:scale-[1.02]"
          >
            <CheckCircle size={15} />
            <span className="hidden sm:inline">Review & Submit</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {/* Studio Portal Shortcut */}
          <button
            onClick={() => navigate('/dashboard')}
            title="Switch to Mersal Media Studio Management"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all"
          >
            <Camera size={13} className="text-[#50E2E5]" />
            <span>Studio</span>
          </button>
        </div>
      </header>

      {/* Real-Time Drive Status Banner */}
      {driveStatus && (
        <div className="bg-[#092328] border-b border-[#27555C] px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full text-[#50E2E5]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">{driveStatus}</span>
            {isLoadingDrive && <RefreshCw size={12} className="animate-spin ml-1 text-gray-400" />}
          </div>
        </div>
      )}

      {/* Hero Cover Banner */}
      <section className="relative h-64 sm:h-80 w-full overflow-hidden flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.7]"
          style={{
            backgroundImage: cleanPhotos[0]?.url
              ? `url("${cleanPhotos[0].url}")`
              : 'linear-gradient(135deg, #000F13 0%, #092328 50%, #001f26 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000F13] via-[#000F13]/50 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#50E2E5] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} /> {event?.eventType || 'Google Drive Realtime Proofing'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight mb-2">
            {gallery.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            {gallery.welcomeMessage}
          </p>

          {/* Progress Bar */}
          <div className="mt-4 max-w-md">
            <div className="flex items-center justify-between text-xs text-gray-300 font-semibold mb-1">
              <span>
                Album Selection Progress ({selectedCount} of {maxFavs} selected):
              </span>
              <span className="text-[#50E2E5] font-black">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#006A70] to-[#50E2E5] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Proofing View (Grid vs Focus View) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {filterFavouritesOnly && (
          <div className="mb-6 p-4 rounded-2xl bg-[#50E2E5]/10 border border-[#50E2E5]/30 flex items-center justify-between text-xs text-[#50E2E5]">
            <span className="font-bold">
              Showing only your {selectedCount} shortlisted favourite photos.
            </span>
            <button
              onClick={() => setFilterFavouritesOnly(false)}
              className="font-bold underline hover:text-white"
            >
              Show All Photos
            </button>
          </div>
        )}

        {isLoadingDrive ? (
          <div className="space-y-6">
            {/* Loading Indicator Banner */}
            <div className="p-8 rounded-3xl bg-[#092328] border border-[#27555C] flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#50E2E5]/15 border border-[#50E2E5]/40 flex items-center justify-center text-[#50E2E5] mb-4 shadow-lg shadow-[#50E2E5]/20">
                <RefreshCw size={32} className="animate-spin text-[#50E2E5]" />
              </div>
              <h3 className="text-lg font-black text-white font-heading tracking-tight mb-1.5">
                Fetching Real-Time Photos from Google Drive...
              </h3>
              <p className="text-xs text-gray-300 max-w-md leading-relaxed">
                Loading client photos directly from your Google Drive folder. Previews will appear as soon as the drive link responds.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#000F13] border border-[#27555C] text-[11px] text-[#50E2E5] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#50E2E5] animate-ping" />
                <span>Live Drive Sync Active</span>
              </div>
            </div>

            {/* Shimmering Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden bg-[#092328]/80 border border-[#27555C]/40 aspect-[4/3] animate-pulse"
                >
                  <div className="w-full h-full bg-gradient-to-tr from-[#092328] via-[#0d2f36] to-[#092328]" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="h-3 w-28 bg-white/10 rounded-full" />
                    <div className="h-7 w-7 bg-white/10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : displayedPhotos.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#092328]/40 border border-[#27555C]/40 text-xs">
            <Camera size={40} className="mx-auto text-gray-500 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No Photos Found</h4>
            <p className="text-gray-400 max-w-sm mx-auto mb-4">
              No photos found in this Google Drive folder yet.
            </p>
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#50E2E5] text-black font-bold text-xs shadow-lg shadow-[#50E2E5]/20"
            >
              Connect Another Drive Link
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <CustomerGridView photos={displayedPhotos} />
        ) : (
          <CustomerFocusView photos={displayedPhotos} />
        )}
      </main>

      {/* Fullscreen Zoom Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full bg-black/50 z-50"
          >
            <X size={26} />
          </button>

          <div
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit>
              <TransformComponent
                wrapperStyle={{ width: '100vw', height: '100vh' }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={lightboxPhoto.url}
                  alt={lightboxPhoto.filename}
                  referrerPolicy="no-referrer"
                  className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}

      {/* Review & Submit Modal */}
      <CustomerSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        clientName={client?.fullName || 'Valued Client'}
        eventName={event?.title || gallery.title}
      />

      {/* Connect Custom Drive Folder Modal */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg p-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl space-y-4 text-xs">
            <button
              onClick={() => setIsDriveModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#50E2E5]/20 text-[#50E2E5]">
                <FolderOpen size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Connect Google Drive Folder
                </h3>
                <p className="text-[11px] text-gray-400">
                  Paste any Google Drive folder link or folder ID to load photos in real-time.
                </p>
              </div>
            </div>

            <form onSubmit={handleConnectCustomFolder} className="space-y-4 pt-2">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Google Drive Folder Link / ID
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x?usp=drive_link"
                  value={customDriveInput}
                  onChange={(e) => setCustomDriveInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5] text-xs font-mono"
                  autoFocus
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Example: <span className="text-[#50E2E5]">https://drive.google.com/drive/folders/1g5O2YDqEHmHQBLpfpeWtg-lHTTLrd_4x</span>
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-black uppercase tracking-wider bg-[#50E2E5] hover:bg-[#3bc8cb] text-black rounded-xl shadow-lg shadow-[#50E2E5]/20 flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  <span>Connect & Load Realtime</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-[#27555C]/50 text-center text-xs text-gray-400">
        <p className="font-heading font-black text-white uppercase tracking-wider text-sm">
          Mersal Media
        </p>
        <p className="font-script text-base text-[#50E2E5] mt-1">Crafted with passion by Ask</p>
        <p className="text-[10px] text-gray-500 mt-2">
          Official Photography Proofing Engine • High Resolution Preview Mode
        </p>
      </footer>
    </div>
  );
};
