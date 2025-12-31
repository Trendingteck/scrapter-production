import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Copy, Languages, Scan, X, Loader2, Sparkles } from 'lucide-react';
import { runLocalOCR, type BoundingBox } from './ocr-engine';

interface VideoOverlayProps {
  videoElement: HTMLVideoElement;
}

export const VideoOverlay: React.FC<VideoOverlayProps> = ({ videoElement }) => {
  // State
  const [isVisible, setIsVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [showTranslated, setShowTranslated] = useState(false);

  // Drag Selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);

  // --- 1. Video Event Listeners ---
  useEffect(() => {
    const handlePause = () => setIsVisible(true);
    const handlePlay = () => {
      setIsVisible(false);
      resetState();
    };

    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('play', handlePlay);

    if (videoElement.paused) setIsVisible(true);

    return () => {
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('play', handlePlay);
    };
  }, [videoElement]);

  const resetState = () => {
    setIsScanning(false);
    setIsProcessingAI(false);
    setBoxes([]);
    setSelection(null);
    setShowTranslated(false);
  };

  // --- 2. Core Logic ---

  const handleScan = async (specificRegion?: typeof selection) => {
    if (isScanning) return;

    // UI: Start Scanning Effect
    setIsScanning(true);
    setBoxes([]); // Clear previous

    try {
      // A. Local OCR (Tesseract) - Fast
      const rawBoxes = await runLocalOCR(videoElement);

      // Filter if region selected (basic intersection logic)
      let filteredBoxes = rawBoxes;
      if (specificRegion) {
        // Logic to filter boxes inside selection rect (normalized coordinates)
        // For brevity, using all boxes found in this version
      }

      setBoxes(filteredBoxes);
      setIsScanning(false);

      // B. Background Intelligence (Gemini) - Async/Silent
      if (filteredBoxes.length > 0) {
        setIsProcessingAI(true);
        const texts = filteredBoxes.map(b => b.text);

        // Send to background for correction
        chrome.runtime.sendMessage({ type: 'CORRECT_OCR_TEXT', texts }, (response) => {
          setIsProcessingAI(false);
          if (response && response.success && response.data) {
            // Update boxes with corrected text
            setBoxes(prev => prev.map((box, i) => ({
              ...box,
              text: response.data[i] || box.text
            })));
          }
        });
      }

    } catch (e) {
      console.error("Scan failed", e);
      setIsScanning(false);
    }
  };

  const handleTranslate = async () => {
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }

    setIsProcessingAI(true);
    const texts = boxes.map(b => b.text);

    chrome.runtime.sendMessage({ type: 'TRANSLATE_OCR_TEXT', texts }, (response) => {
      setIsProcessingAI(false);
      if (response && response.success && response.data) {
        setBoxes(prev => prev.map((box, i) => ({
          ...box,
          translatedText: response.data[i]
        })));
        setShowTranslated(true);
      }
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Trigger a small toast notification here
  };

  // --- 3. Mouse Handlers (Drag to Select) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (boxes.length > 0 || isScanning) return;
    if ((e.target as HTMLElement).tagName !== 'BUTTON') {
      setIsSelecting(true);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      startPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setSelection({ x: startPos.current.x, y: startPos.current.y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !startPos.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setSelection({
      x: Math.min(currentX, startPos.current.x),
      y: Math.min(currentY, startPos.current.y),
      w: Math.abs(currentX - startPos.current.x),
      h: Math.abs(currentY - startPos.current.y)
    });
  };

  const handleMouseUp = () => {
    if (isSelecting && selection && selection.w > 20 && selection.h > 20) {
      handleScan(selection); // Scan specific area
    } else {
      setSelection(null); // Just a click
    }
    setIsSelecting(false);
    startPos.current = null;
  };

  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 z-[9999] overflow-hidden cursor-crosshair font-sans select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {/* --- IDLE STATE: Toggle Button --- */}
      {boxes.length === 0 && !isScanning && (
        <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); handleScan(); }}
            className="flex items-center gap-2 bg-zinc-900/90 text-white px-4 py-2 rounded-full border border-gold-500/50 shadow-lg hover:bg-zinc-800 transition-all active:scale-95 backdrop-blur-md group"
          >
            <Scan className="w-4 h-4 text-gold-500 group-hover:animate-pulse" />
            <span className="text-sm font-bold">Scan Video</span>
          </button>
        </div>
      )}

      {/* --- SCANNING STATE: Animations --- */}
      {isScanning && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Laser Beam */}
          <div className="w-full h-[2px] bg-gold-500 shadow-[0_0_25px_4px_#EAB308] absolute top-0 animate-[scan_1.5s_ease-in-out_infinite]" />

          {/* Loading Pill */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/80 text-gold-500 px-5 py-2 rounded-full border border-gold-500/30 flex items-center gap-3 backdrop-blur-xl shadow-2xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-mono font-bold tracking-widest">ANALYZING</span>
            </div>
          </div>
        </div>
      )}

      {/* --- RESULTS STATE: Interactive Boxes --- */}
      {boxes.length > 0 && (
        <>
          {/* Control Bar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900/95 p-1.5 rounded-xl border border-zinc-700/50 shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-4">
            <button
              onClick={(e) => { e.stopPropagation(); handleTranslate(); }}
              disabled={isProcessingAI}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${showTranslated ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'hover:bg-white/10 text-zinc-300'}`}
            >
              {isProcessingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
              {showTranslated ? 'Original' : 'Translate'}
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {isProcessingAI && (
              <div className="flex items-center gap-2 px-2 text-gold-500 text-xs font-mono">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>AI Refining...</span>
              </div>
            )}

            <div className="w-px h-4 bg-white/10 mx-1" />

            <button
              onClick={(e) => { e.stopPropagation(); resetState(); }}
              className="p-1.5 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bounding Boxes */}
          {boxes.map((box, idx) => {
            const [ymin, xmin, ymax, xmax] = box.box_2d;
            const style: React.CSSProperties = {
              top: `${ymin * 100}%`,
              left: `${xmin * 100}%`,
              width: `${(xmax - xmin) * 100}%`,
              height: `${(ymax - ymin) * 100}%`
            };

            return (
              <div
                key={idx}
                className="absolute border border-gold-500/40 hover:bg-gold-500/20 hover:border-gold-500 transition-all cursor-pointer group z-40 rounded-sm"
                style={style}
                onClick={(e) => { e.stopPropagation(); handleCopy(showTranslated ? (box.translatedText || box.text) : box.text); }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-zinc-700 flex items-center gap-2">
                    <span className="font-mono max-w-[200px] truncate">
                      {showTranslated ? (box.translatedText || "Translating...") : box.text}
                    </span>
                    <Copy className="w-3 h-3 text-zinc-500" />
                  </div>
                  {/* Arrow */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-b border-r border-zinc-700"></div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* --- Drag Selection Box --- */}
      {selection && (
        <div
          className="absolute border-2 border-dashed border-white/60 bg-white/10 pointer-events-none z-50 backdrop-invert"
          style={{
            left: selection.x,
            top: selection.y,
            width: selection.w,
            height: selection.h
          }}
        />
      )}
    </div>
  );
};

export const mountOverlay = (container: HTMLElement, video: HTMLVideoElement) => {
  const root = createRoot(container);
  root.render(<VideoOverlay videoElement={video} />);
};
