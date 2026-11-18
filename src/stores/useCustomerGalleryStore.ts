import { create } from 'zustand';
import { ClientSelectionReport, Gallery, GalleryPhoto } from '../types';
import { syncDriveFavorite } from '../services/googleDriveService';

interface CustomerGalleryState {
  gallery: Gallery | null;
  favourites: Set<string>;
  viewMode: 'grid' | 'focus';
  filterFavouritesOnly: boolean;
  focusedIndex: number;
  lightboxPhoto: { id: string; url: string; filename: string } | null;
  isSubmitted: boolean;
  isLoadingDrive: boolean;

  setGallery: (gallery: Gallery) => void;
  updateGalleryPhotos: (photos: GalleryPhoto[], folderName?: string) => void;
  toggleFavourite: (photoId: string) => void;
  setViewMode: (mode: 'grid' | 'focus') => void;
  setFilterFavouritesOnly: (val: boolean) => void;
  setFocusedIndex: (idx: number) => void;
  setLightboxPhoto: (photo: { id: string; url: string; filename: string } | null) => void;
  setIsLoadingDrive: (loading: boolean) => void;
  generateSelectionReport: (clientName: string, eventName: string, notes?: string) => ClientSelectionReport;
  markAsSubmitted: () => void;
}

export const useCustomerGalleryStore = create<CustomerGalleryState>((set, get) => ({
  gallery: null,
  favourites: new Set<string>(),
  viewMode: 'grid',
  filterFavouritesOnly: false,
  focusedIndex: 0,
  lightboxPhoto: null,
  isSubmitted: false,
  isLoadingDrive: false,

  setGallery: (gallery) => {
    // Load existing selections from localStorage for this gallery
    const saved = localStorage.getItem(`mersal_gallery_favs_${gallery.id}`);
    let initialFavs = new Set<string>(gallery.selectedPhotoIds || []);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        initialFavs = new Set(parsed);
      } catch (e) {
        console.error(e);
      }
    }

    set({
      gallery,
      favourites: initialFavs,
      isSubmitted: gallery.status === 'Submitted',
      focusedIndex: 0,
      filterFavouritesOnly: false,
    });
  },

  updateGalleryPhotos: (photos, folderName) => {
    const { gallery } = get();
    if (!gallery) return;

    const updatedGallery: Gallery = {
      ...gallery,
      title: folderName && (!gallery.title || gallery.title.includes('Testing') || gallery.title.includes('Gallery')) ? folderName : gallery.title,
      photos,
    };

    set({ gallery: updatedGallery });
  },

  toggleFavourite: (photoId) => {
    const { gallery, favourites } = get();
    if (!gallery) return;

    const next = new Set(favourites);
    const isFavoriting = !next.has(photoId);

    if (!isFavoriting) {
      if (gallery.allowUnfavorite) {
        next.delete(photoId);
      }
    } else {
      if (gallery.maxFavourites && next.size >= gallery.maxFavourites) {
        alert(`You have reached the maximum selection limit of ${gallery.maxFavourites} photos.`);
        return;
      }
      next.add(photoId);
    }

    // Persist to gallery-specific localStorage
    localStorage.setItem(
      `mersal_gallery_favs_${gallery.id}`,
      JSON.stringify(Array.from(next))
    );

    set({ favourites: next });

    // Sync in real time to Google Drive via Apps Script
    syncDriveFavorite(photoId, isFavoriting ? 'favorite' : 'unfavorite');
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setFilterFavouritesOnly: (val) => set({ filterFavouritesOnly: val }),
  setFocusedIndex: (idx) => set({ focusedIndex: idx }),
  setLightboxPhoto: (photo) => set({ lightboxPhoto: photo }),
  setIsLoadingDrive: (loading) => set({ isLoadingDrive: loading }),

  generateSelectionReport: (clientName, eventName, notes) => {
    const { gallery, favourites } = get();
    if (!gallery) throw new Error('No gallery loaded');

    const selectedPhotos = gallery.photos
      .filter((p) => favourites.has(p.id))
      .map((p) => ({
        id: p.id,
        filename: p.filename,
        url: p.url,
      }));

    return {
      galleryId: gallery.id,
      shareId: gallery.shareId,
      galleryTitle: gallery.title,
      clientName,
      eventName,
      submittedAt: new Date().toISOString(),
      selectedCount: selectedPhotos.length,
      selectedPhotos,
      notes,
    };
  },

  markAsSubmitted: () => {
    const { gallery } = get();
    if (gallery) {
      set({ isSubmitted: true });
    }
  },
}));
