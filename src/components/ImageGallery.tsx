
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: {
    jpg: {
      image_url: string;
      large_image_url?: string;
    };
  }[];
  title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Gallery</h3>
        <p className="text-muted-foreground">No images available for this {title.toLowerCase()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground">Gallery</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.slice(0, 12).map((image, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.jpg.image_url}
              alt={`${title} image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
          >
            <X size={32} />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-primary transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-primary transition-colors"
          >
            <ChevronRight size={32} />
          </button>

          <img
            src={images[selectedImage].jpg.large_image_url || images[selectedImage].jpg.image_url}
            alt={`${title} image ${selectedImage + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
