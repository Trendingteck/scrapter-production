import React from 'react';
import { Download, MousePointer2, CheckSquare, Square, FileArchive, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@extension/ui'; 

interface ImageToolbarProps {
  totalImages: number;
  selectedCount: number;
  isPicking: boolean;
  isProcessing: boolean;
  onTogglePicker: () => void;
  onSelectAll: () => void;
  onDownload: (asZip: boolean) => void;
  onRefresh: () => void;
}

export const ImageToolbar: React.FC<ImageToolbarProps> = ({
  totalImages,
  selectedCount,
  isPicking,
  isProcessing,
  onTogglePicker,
  onSelectAll,
  onDownload,
  onRefresh
}) => {
  return (
    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      
      <div className="flex gap-2 items-center">
         <Button 
           variant={isPicking ? "default" : "outline"}
           size="sm" 
           onClick={onTogglePicker}
           className={`h-8 text-xs font-bold transition-all ${
               isPicking 
               ? "bg-orange-500 text-white hover:bg-orange-600 border-transparent shadow-md shadow-orange-500/20" 
               : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
           }`}
           title="Click elements on page to select"
         >
           <MousePointer2 className={`w-3.5 h-3.5 mr-2 ${isPicking ? "animate-pulse" : ""}`} />
           {isPicking ? 'Picking...' : 'Pick'}
         </Button>

         <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

         <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 font-medium">
           {selectedCount > 0 && selectedCount === totalImages ? (
             <CheckSquare className="w-4 h-4 text-orange-500" />
           ) : (
             <Square className="w-4 h-4" />
           )}
           <span className="ml-2 text-xs">{selectedCount} / {totalImages}</span>
         </Button>
      </div>
      
      <div className="flex gap-2">
         <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Rescan Page"
         >
            <RefreshCw className="w-3.5 h-3.5" />
         </Button>

         <Button 
           variant="outline" 
           size="icon" 
           disabled={selectedCount === 0 || isProcessing}
           onClick={() => onDownload(false)}
           className="h-8 w-8 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
           title="Download Files"
         >
           <Download className="w-3.5 h-3.5" />
         </Button>
         
         <Button 
           variant="default" 
           size="icon" 
           disabled={selectedCount === 0 || isProcessing}
           onClick={() => onDownload(true)}
           className="h-8 w-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:bg-black dark:hover:bg-white border-transparent shadow-sm"
           title="Download as ZIP"
         >
           {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileArchive className="w-3.5 h-3.5" />}
         </Button>
      </div>
    </div>
  );
};