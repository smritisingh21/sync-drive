import React, { useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaDownload } from 'react-icons/fa';

export default function ImagePreview({ 
  images, 
  currentIndex, 
  setCurrentIndex, 
  onClose, 
  BASE_URL 
}) {
  const currentImage = images[currentIndex];

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length, setCurrentIndex]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length, setCurrentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  if (!currentImage) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in duration-300"
      onClick={() =>onClose()}
    >
      {/* Top Toolbar */}
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white px-2">
          <p className="font-medium truncate max-w-xs md:max-w-xl">{currentImage.name}</p>
          <p className="text-xs text-slate-300">{currentIndex + 1} of {images.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href={`${BASE_URL}/file/${currentImage.id}?action=download`}
            className="p-2 text-white/80 hover:text-white transition-colors"
            title="Download"
            onClick={(e) => e.stopPropagation()}
          >
            <FaDownload size={20} />
          </a>
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 z-[210] p-4 text-black/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <FaChevronLeft size={32} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 z-[210] p-4 text-black/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <FaChevronRight size={32} />
          </button>
        </>
      )}

      {/* The Image */}
      <div className="relative max-w-[90vw] max-h-[85vh] select-none" onClick={(e) => e.stopPropagation()}>
        <img 
          key={currentImage.id} // Key forces re-render/animation on nav
          src={`${BASE_URL}/file/${currentImage.id}`}
          alt={currentImage.name}
          className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm animate-in zoom-in-95 duration-300"
        />
      </div>
    </div>
  );
}