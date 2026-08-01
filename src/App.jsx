import React, { useState, useEffect } from 'react';
import { Heart, X, Sun, Moon, Info } from 'lucide-react';
import config from './config.json';
import './index.css';

// Using a custom masonry hook or simplified math for random heights
function App() {
  const [clientName, setClientName] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Keep track of liked images
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('gallery_favorites');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch(e) {
        return new Set();
      }
    }
    return new Set();
  });

  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 1;

  // Save theme to local storage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.add('theme-light');
    }
  }, [isDarkMode]);

  // Save favorites to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('gallery_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    // Parse URL parameter e.g., ?link=https://drive.google... OR ?folder=1abc2xyz
    const params = new URLSearchParams(window.location.search);
    const rawLink = params.get('link');
    let folderId = params.get('folder');
    const nameParam = params.get('name');

    // If they provided a full Google Drive link, extract the ID from it automatically!
    if (rawLink) {
      const match = rawLink.match(/\/folders\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        folderId = match[1];
      }
    }

    // NEW: Support clean URLs like http://localhost:5173/1nxOO2LEc58lnZNhhikFebMnZHiVjddLr
    if (!folderId) {
      const pathSegment = window.location.pathname.replace(/^\/+|\/+$/g, '');
      // Google Drive folder IDs are typically long strings (e.g., 33 characters)
      if (pathSegment && pathSegment.length > 15) {
        folderId = pathSegment;
      }
    }

    if (!folderId) {
      setError('Missing Google Drive Folder ID. Use format: http://localhost:5173/YOUR_FOLDER_ID');
      setLoading(false);
      return;
    }
    
    // Fetch images from Google Drive API
    fetchGoogleDriveImages(folderId, nameParam);
  }, []);

  const fetchGoogleDriveImages = async (folderId, fallbackName) => {
    try {
      const scriptUrl = config.APPS_SCRIPT_URL;
      if (scriptUrl === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
        throw new Error("Apps Script URL is not configured.");
      }

      const response = await fetch(`${scriptUrl}?folderId=${folderId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Apps Script`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Automatically set the Client Name to the actual Google Drive Folder Name!
      setClientName(data.folderName || fallbackName || "Client Gallery");

      const formattedImages = (data.files || []).map(file => {
        return {
          id: file.id,
          name: file.name,
          url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`,
          span: 1 
        };
      });

      setImages(formattedImages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (e, img) => {
    e.stopPropagation(); // Prevent opening lightbox
    
    // Optimistic UI update
    const newFavs = new Set(favorites);
    const isFavoriting = !newFavs.has(img.id);
    
    if (isFavoriting) {
      newFavs.add(img.id);
    } else {
      newFavs.delete(img.id);
    }
    setFavorites(newFavs);

    if (config.APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
      try {
        await fetch(config.APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          // Send the action ('favorite' or 'unfavorite') to the backend
          body: JSON.stringify({ 
            fileId: img.id,
            action: isFavoriting ? 'favorite' : 'unfavorite' 
          })
        });
        console.log(`Successfully processed ${isFavoriting ? 'favorite' : 'unfavorite'} action`);
      } catch (err) {
        console.error("Failed to process favorite action via Apps Script", err);
      }
    }
  };

  // Pagination Logic
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const getPaginationGroup = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage, '...', totalPages];
  };

  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset image loader when page changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentPage]);

  if (loading) {
    return (
      <div className="gallery-container">
        <header>
          <h1>{clientName || "Client Gallery"}</h1>
          <p>Curated Client Gallery</p>
        </header>
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">Fetching Gallery Data...</div>
        </div>
      </div>
    );
  }
  
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="gallery-container">
      <header>
        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <div className="stats-group" style={{ display: 'flex', gap: '10px' }}>
            <div className="total-counter">
              <span>{images.length} Photos</span>
            </div>
            <div className="favorites-counter">
              <Heart size={20} className="counter-icon" />
              <span>{favorites.size}</span>
            </div>
          </div>
        </div>
        <h1>{clientName}</h1>
        <p>Curated Client Gallery</p>
      </header>
      
      <div className="alert-info">
        <Info size={20} className="alert-icon" />
        <p>High-resolution photos load dynamically based on your internet connection speed.</p>
      </div>

      <div className="single-image-view">
        {currentImages.map(img => (
          <div 
            key={img.id} 
            className="single-image-card"
            onClick={() => setSelectedImage(img)}
          >
            {!imageLoaded && (
              <div className="image-loader">
                <div className="spinner"></div>
              </div>
            )}
            <img 
              src={img.url} 
              alt={img.name} 
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
            />
            <div className="overlay" style={{ opacity: imageLoaded ? '' : 0 }}>
              <button 
                className={`heart-btn ${favorites.has(img.id) ? 'favorited' : ''}`}
                onClick={(e) => handleFavorite(e, img)}
              >
                <Heart size={32} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="page-btn nav-btn nav-btn-prev"
          >
            Prev
          </button>
          
          {getPaginationGroup().map((item, index) => (
            <button
              key={index}
              onClick={() => item !== '...' && setCurrentPage(item)}
              className={`page-btn page-num ${item === currentPage ? 'active' : ''} ${item === '...' ? 'dots' : ''}`}
              disabled={item === '...'}
            >
              {item}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="page-btn nav-btn nav-btn-next"
          >
            Next
          </button>
        </div>
      )}

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
            <X size={36} />
          </button>
          <img 
            src={selectedImage.url} 
            alt={selectedImage.name} 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      <footer className="app-footer">
        <p>Mersal Media</p>
      </footer>
    </div>
  );
}

export default App;
