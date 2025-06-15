
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Wallpaper } from 'lucide-react';

const wallpapers = [
  {
    id: 1,
    title: "Mountain Summit",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=3840&h=2160&fit=crop&crop=center",
    thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 2, 
    title: "Forest Lights",
    url: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=3840&h=2160&fit=crop&crop=center",
    thumbnail: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "Lake Reflection", 
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=3840&h=2160&fit=crop&crop=center",
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "Digital Matrix",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=3840&h=2160&fit=crop&crop=center", 
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 5,
    title: "Code Monitor",
    url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=3840&h=2160&fit=crop&crop=center",
    thumbnail: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=300&fit=crop&crop=center"
  },
  {
    id: 6,
    title: "Modern Interior",
    url: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=3840&h=2160&fit=crop&crop=center",
    thumbnail: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=300&fit=crop&crop=center"
  }
];

const WallpaperGallery: React.FC = () => {
  const [selectedWallpaper, setSelectedWallpaper] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedWallpaper(index);
  };

  const closeLightbox = () => {
    setSelectedWallpaper(null);
  };

  const nextWallpaper = () => {
    if (selectedWallpaper !== null) {
      setSelectedWallpaper((selectedWallpaper + 1) % wallpapers.length);
    }
  };

  const prevWallpaper = () => {
    if (selectedWallpaper !== null) {
      setSelectedWallpaper(selectedWallpaper === 0 ? wallpapers.length - 1 : selectedWallpaper - 1);
    }
  };

  const downloadWallpaper = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-4k-wallpaper.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" data-section="wallpaper-gallery">
      <div className="flex items-center gap-3">
        <Wallpaper className="w-8 h-8 text-primary" />
        <h3 className="text-2xl font-bold text-foreground">4K Wallpaper Gallery</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallpapers.map((wallpaper, index) => (
          <div
            key={wallpaper.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden bg-card"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={wallpaper.thumbnail}
                alt={wallpaper.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onClick={() => openLightbox(index)}
              />
            </div>
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h4 className="text-white font-semibold text-lg">{wallpaper.title}</h4>
              <p className="text-white/80 text-sm">4K Resolution</p>
            </div>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadWallpaper(wallpaper.url, wallpaper.title);
                }}
                className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedWallpaper !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-10"
          >
            <X size={32} />
          </button>
          
          <button
            onClick={prevWallpaper}
            className="absolute left-4 text-white hover:text-primary transition-colors z-10"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button
            onClick={nextWallpaper}
            className="absolute right-4 text-white hover:text-primary transition-colors z-10"
          >
            <ChevronRight size={32} />
          </button>

          <div className="max-w-full max-h-full p-8">
            <img
              src={wallpapers[selectedWallpaper].url}
              alt={wallpapers[selectedWallpaper].title}
              className="max-w-full max-h-full object-contain"
            />
            
            <div className="absolute bottom-8 left-8 right-8 text-center">
              <h3 className="text-white text-xl font-bold mb-2">
                {wallpapers[selectedWallpaper].title}
              </h3>
              <button
                onClick={() => downloadWallpaper(
                  wallpapers[selectedWallpaper].url, 
                  wallpapers[selectedWallpaper].title
                )}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Download 4K Wallpaper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallpaperGallery;
