import React, { useState, useEffect } from 'react';
import { Download, MousePointer2, CheckSquare, Square, FileArchive, Loader2 } from 'lucide-react';
import { Button } from '@extension/ui';
import { convertImage } from '../../lib/image-converter';
import { createZipFromImages } from '../../lib/zip-handler';

interface ImageItem {
  src: string;
  width: number;
  height: number;
  name: string;
  dataUrl?: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [pickerActive, setPickerActive] = useState(false);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'IMAGES_EXTRACTED') {
        setImages(prev => [...prev, ...message.images]);
      }
      if (message.type === 'IMAGE_PICKED') {
        setImages(prev => [message.image, ...prev]);
        setPickerActive(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const togglePicker = () => {
    const newState = !pickerActive;
    setPickerActive(newState);
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: newState ? 'ENABLE_PICKER' : 'DISABLE_PICKER' 
        });
      }
    });
  };

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedIndices(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === images.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(images.map((_, i) => i)));
    }
  };

  const handleDownload = async (asZip: boolean) => {
    if (selectedIndices.size === 0) return;
    setIsProcessing(true);
    setProcessingStatus('Fetching images via proxy...');

    const targets = images.filter((_, i) => selectedIndices.has(i));
    const processedImages: Array<{ name: string; blob: Blob }> = [];

    const port = chrome.runtime.connect({ name: 'side-panel-connection' });

    for (const [idx, img] of targets.entries()) {
      try {
        setProcessingStatus(`Processing ${idx + 1}/${targets.length}...`);
        
        const base64Data = await new Promise<string>((resolve, reject) => {
          const listener = (msg: any) => {
            if (msg.type === 'IMAGE_BLOB_READY' && msg.url === img.src) {
              port.onMessage.removeListener(listener);
              if (msg.success) resolve(msg.data);
              else reject('Fetch failed');
            }
          };
          port.onMessage.addListener(listener);
          port.postMessage({ type: 'FETCH_IMAGE_BLOB', url: img.src });
        });

        const blob = await convertImage(base64Data, 'image/jpeg');
        
        processedImages.push({ 
          name: `${img.name || 'image'}-${idx}.jpg`, 
          blob 
        });

      } catch (e) {
        console.error(`Failed to process ${img.src}`, e);
      }
    }

    if (asZip) {
      setProcessingStatus('Zipping...');
      const zipBlob = await createZipFromImages(processedImages);
      const url = URL.createObjectURL(zipBlob);
      chrome.downloads.download({ url, filename: `scrapter-images-${Date.now()}.zip` });
    } else {
      processedImages.forEach((img) => {
        const url = URL.createObjectURL(img.blob);
        chrome.downloads.download({ url, filename: img.name });
      });
    }

    setProcessingStatus('');
    setIsProcessing(false);
    port.disconnect();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between sticky top-0 z-10">
        <div className="flex gap-2">
           <Button 
             variant={pickerActive ? "default" : "outline"}
             size="sm" 
             onClick={togglePicker}
             className={pickerActive ? "bg-orange-500 text-black hover:bg-orange-600" : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"}
           >
             <MousePointer2 className="w-4 h-4 mr-2" />
             {pickerActive ? 'Picking...' : 'Pick'}
           </Button>
           <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="text-zinc-400">
             {selectedIndices.size === images.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
           </Button>
        </div>
        
        <div className="flex gap-2">
           <Button 
             variant="outline" 
             size="sm" 
             disabled={selectedIndices.size === 0 || isProcessing}
             onClick={() => handleDownload(false)}
             className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
             title="Download Individual"
           >
             <Download className="w-4 h-4" />
           </Button>
           <Button 
             variant="default" 
             size="sm" 
             disabled={selectedIndices.size === 0 || isProcessing}
             onClick={() => handleDownload(true)}
             className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
             title="Download ZIP"
           >
             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
           </Button>
        </div>
      </div>

      {processingStatus && (
        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs px-4 py-1 border-b border-orange-200 dark:border-orange-800 text-center font-mono">
            {processingStatus}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600 gap-2">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                <Download className="w-6 h-6 opacity-30" />
            </div>
            <p className="text-xs">No images extracted yet.</p>
            <Button variant="link" className="text-orange-600 dark:text-orange-500" onClick={() => chrome.tabs.query({active:true}, t=>chrome.tabs.sendMessage(t[0].id!, {type: 'EXTRACT_IMAGES'}))}>
                Run Bulk Extraction
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => {
              const isSelected = selectedIndices.has(idx);
              return (
                <div 
                  key={idx} 
                  onClick={() => toggleSelection(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer group ${isSelected ? 'border-orange-500 ring-1 ring-orange-500' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                >
                  <img src={img.src} className="w-full h-full object-cover" />
                  
                  <div className={`absolute inset-0 bg-black/40 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="absolute top-1 right-1">
                        {isSelected && <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center"><CheckSquare className="w-3 h-3 text-white" /></div>}
                    </div>
                    <div className="absolute bottom-1 left-1 text-[9px] text-white font-mono bg-black/60 px-1 rounded">
                        {img.width}x{img.height}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}