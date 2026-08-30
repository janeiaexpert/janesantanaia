import { useState, useRef, useEffect } from "react";

interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  src?: string | null;
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-28 h-28",
  lg: "w-36 h-36",
};

const ProfileAvatar = ({ size = "lg", onClick, className = "", src }: ProfileAvatarProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastTouch = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const getPinchDist = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getPinchDist(e.touches);
      if (lastPinchDist.current > 0) {
        const scale = dist / lastPinchDist.current;
        setZoom((prev) => Math.min(Math.max(prev * scale, 1), 5));
      }
      lastPinchDist.current = dist;
    } else if (e.touches.length === 1 && zoom > 1) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinchDist.current = getPinchDist(e.touches);
    } else if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(prev * delta, 1), 5));
  };

  const handleDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <>
      <div
        className={`cursor-pointer ${sizes[size]} shrink-0 flex items-center justify-center overflow-hidden rounded-full ${className}`}
        onClick={() => src && setModalOpen(true)}
      >
        {src ? (
          <img
            src={src}
            alt="Avatar"
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>

      {modalOpen && src && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            onClick={() => setModalOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
            <img
              ref={imgRef}
              src={src}
              alt="Avatar"
              className="max-w-full max-h-full select-none"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: dragging ? "none" : "transform 0.2s ease",
                cursor: zoom > 1 ? "grab" : "zoom-in",
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
              draggable={false}
            />
          </div>

          <div className="flex items-center gap-4 py-4">
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => { setZoom((prev) => Math.max(prev - 0.5, 1)); if (zoom <= 1.5) setPosition({ x: 0, y: 0 }); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <span className="text-white/60 text-sm min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>

            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => setZoom((prev) => Math.min(prev + 0.5, 5))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            {zoom > 1 && (
              <button
                className="ml-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                onClick={resetZoom}
              >
                Resetar
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileAvatar;
