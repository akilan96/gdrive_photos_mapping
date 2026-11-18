import config from '../config.json';
import { GalleryPhoto } from '../types';

export interface DriveFetchResult {
  success: boolean;
  folderName: string;
  photos: GalleryPhoto[];
  error?: string;
}

/**
 * Real-time fetch of image files from a Google Drive folder
 * via the configured Google Apps Script Web App endpoint.
 */
export async function fetchDrivePhotos(folderId: string): Promise<DriveFetchResult> {
  const scriptUrl = config.APPS_SCRIPT_URL;

  if (!scriptUrl || scriptUrl.includes('YOUR_APPS_SCRIPT')) {
    return {
      success: false,
      folderName: '',
      photos: [],
      error: 'Google Apps Script URL is not configured in config.json.',
    };
  }

  try {
    const response = await fetch(`${scriptUrl}?folderId=${encodeURIComponent(folderId)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Apps Script (HTTP ${response.status})`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const files = data.files || [];
    const photos: GalleryPhoto[] = files.map((file: any) => ({
      id: file.id,
      filename: file.name,
      url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`,
      caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    }));

    return {
      success: true,
      folderName: data.folderName || 'Google Drive Gallery',
      photos,
    };
  } catch (err: any) {
    console.error('Realtime Drive Fetch Error:', err);
    return {
      success: false,
      folderName: '',
      photos: [],
      error: err.message || 'Unknown network error fetching Drive images.',
    };
  }
}

/**
 * Real-time sync of favorite/unfavorite action to Google Drive
 * Moves the file into or out of the "Favourites" subfolder.
 */
export async function syncDriveFavorite(
  fileId: string,
  action: 'favorite' | 'unfavorite'
): Promise<boolean> {
  const scriptUrl = config.APPS_SCRIPT_URL;
  if (!scriptUrl || scriptUrl.includes('YOUR_APPS_SCRIPT')) return false;

  try {
    await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        fileId,
        action,
      }),
    });
    return true;
  } catch (err) {
    console.error('Error syncing favorite to Google Drive:', err);
    return false;
  }
}
