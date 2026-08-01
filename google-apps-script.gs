/**
 * Google Apps Script - Secure Google Drive Photo Gallery
 * 
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com/ and create a "New Project"
 * 2. Delete the default code and paste this entire file.
 * 3. Click "Deploy" > "New deployment"
 * 4. Select type: "Web app"
 * 5. Execute as: "Me"
 * 6. Who has access: "Anyone"
 * 7. Click Deploy, Authorize the permissions, and copy the "Web app URL"
 * 8. Paste that URL into your React app's configuration (src/config.json).
 */

// GET REQUEST: Fetch images from a folder (Bypasses the need for a Google Cloud API Key & Credit Card)
function doGet(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    const folderId = e.parameter.folderId;
    if (!folderId) {
      return buildResponse(400, { error: "No folderId provided" }, headers);
    }

    const folder = DriveApp.getFolderById(folderId);
    const folderName = folder.getName();
    const files = folder.getFiles();
    const imageList = [];

    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();
      
      // Only return image files
      if (mimeType.indexOf('image/') !== -1) {
        // Apps script gives a standard download URL, but we can construct a display URL
        let url = "https://drive.google.com/uc?export=view&id=" + file.getId();
        
        imageList.push({
          id: file.getId(),
          name: file.getName(),
          url: url
        });
      }
    }

    return buildResponse(200, { 
      folderName: folderName,
      files: imageList 
    }, headers);

  } catch (error) {
    return buildResponse(500, { error: error.toString() }, headers);
  }
}

// POST REQUEST: Move a favorited image
function doPost(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    const data = JSON.parse(e.postData.contents);
    const fileId = data.fileId;
    const action = data.action || 'favorite';
    
    if (!fileId) {
      return buildResponse(400, { error: "No fileId provided" }, headers);
    }

    const file = DriveApp.getFileById(fileId);
    const parents = file.getParents();
    
    if (!parents.hasNext()) {
      return buildResponse(400, { error: "File has no parent folder" }, headers);
    }
    const currentFolder = parents.next();
    
    if (action === 'favorite') {
      let favFolder;
      const folders = currentFolder.getFoldersByName("Favourites");
      if (folders.hasNext()) {
        favFolder = folders.next();
      } else {
        favFolder = currentFolder.createFolder("Favourites");
      }
      file.moveTo(favFolder);
      return buildResponse(200, { success: true, message: "File moved to Favourites successfully!" }, headers);
      
    } else if (action === 'unfavorite') {
      // If unfavoriting, the current folder should be "Favourites"
      if (currentFolder.getName() === "Favourites") {
        const grandParents = currentFolder.getParents();
        if (grandParents.hasNext()) {
          const mainFolder = grandParents.next();
          file.moveTo(mainFolder); // Move back to main folder (e.g. Thozhaa)
          return buildResponse(200, { success: true, message: "File moved back to main folder successfully!" }, headers);
        }
      }
      return buildResponse(200, { success: true, message: "No action needed." }, headers);
    }

  } catch (error) {
    return buildResponse(500, { error: error.toString() }, headers);
  }
}

// Handle CORS Preflight Requests (OPTIONS)
function doOptions(e) {
  return buildResponse(200, {}, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
}

// Helper to return JSON responses
function buildResponse(code, payload, headers) {
  const output = ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
