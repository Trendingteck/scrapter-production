import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, Paperclip, X, ChevronDown, Cpu, 
  AlertTriangle, Image as ImageIcon, FileText, Sparkles, Loader2 
} from 'lucide-react';
import {
  agentModelStore,
  llmProviderStore,
  AgentNameEnum,
  MANAGED_MODELS,
  MANAGED_MODEL_IDS,
  PROVIDER_DEFAULT_MODELS
} from '@extension/storage';

interface Attachment {
  name: string;
  type: string;
  data: string; // Base64
}

interface ChatInputProps {
  onSend: (text: string, attachment?: Attachment) => void;
  onStopTask: () => void;
  disabled: boolean;
  showStopButton: boolean;
  placeholder?: string;
  draftText?: string;
}

interface ModelOptionUI {
  id: string;
  label: string;
  type: 'managed' | 'custom';
  provider?: string;
}

export default function ChatInput({
  onSend,
  onStopTask,
  disabled,
  showStopButton,
  placeholder = "Ask anything...",
  draftText,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelOptionUI[]>([]);
  const [currentModelId, setCurrentModelId] = useState<string>(MANAGED_MODEL_IDS.AUTO);
  const [loadingModel, setLoadingModel] = useState(true);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- 1. Sync Draft Text ---
  useEffect(() => {
    if (draftText !== undefined) {
      setText(draftText);
    }
  }, [draftText]);

  // --- 2. Auto Resize Textarea ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // --- 3. Click Outside Handler (Model Menu) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 4. Load Models from Storage ---
  useEffect(() => {
    const loadConfig = async () => {
      setLoadingModel(true);
      try {
        const activeConfig = await agentModelStore.getAgentModel(AgentNameEnum.Agent);
        const activeId = activeConfig?.modelName || MANAGED_MODEL_IDS.AUTO;
        setCurrentModelId(activeId);

        const options: ModelOptionUI[] = [];

        // Add Managed Models
        MANAGED_MODELS.forEach((m: any) => options.push({
          id: m.id,
          label: m.label,
          type: 'managed'
        }));

        // Add Custom Provider Models
        const providers = await llmProviderStore.getAllProviders();
        Object.entries(providers).forEach(([providerKey, config]) => {
          // @ts-ignore
          if (config && config.apiKey) {
            const defaults = PROVIDER_DEFAULT_MODELS[providerKey] || [];
            defaults.forEach((modelName: string) => {
              options.push({ id: modelName, label: modelName, type: 'custom', provider: providerKey });
            });
          }
        });
        setAvailableModels(options);
      } catch (e) { console.error(e); }
      finally { setLoadingModel(false); }
    };
    loadConfig();
  }, []);

  // --- 5. Model Selection Logic ---
  const handleModelSelect = async (modelId: string) => {
    setCurrentModelId(modelId);
    setIsModelMenuOpen(false);

    const isManaged = MANAGED_MODELS.some((m: any) => m.id === modelId);
    let providerId = 'scrapter';

    if (!isManaged) {
      const found = availableModels.find(m => m.id === modelId);
      if (found && found.provider) providerId = found.provider;
      else providerId = 'gemini'; 
    }

    await agentModelStore.setAgentModel(AgentNameEnum.Agent, {
      provider: providerId as any,
      modelName: modelId
    });
  };

  // --- 6. File Handling ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const readFile = (file: File): Promise<Attachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      reader.onload = () => {
        let data = reader.result as string;
        if (isImage) data = data.split(',')[1];
        resolve({ name: file.name, type: file.type || 'text/plain', data: data });
      };
      reader.onerror = reject;
      if (isImage) reader.readAsDataURL(file); else reader.readAsText(file);
    });
  };

  // --- 7. Send Logic ---
  const handleSend = async () => {
    if ((text.trim() || file) && !disabled && !isReading) {
      let attachment: Attachment | undefined;
      if (file) {
        setIsReading(true);
        try { attachment = await readFile(file); } catch (e) { console.error(e); }
        setIsReading(false);
      }
      onSend(text.trim(), attachment);
      setText('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeModelUI = availableModels.find(m => m.id === currentModelId) || availableModels[0];

  return (
    <div className="w-full px-4 pb-6 bg-white dark:bg-zinc-950">
      <div className="relative bg-white dark:bg-zinc-900 shadow-[0_4px_20px_rgb(0,0,0,0.08)] dark:shadow-none rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-2 transition-all focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/50">
        
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

        {/* File Preview Chip */}
        {file && (
          <div className="mx-2 mt-1 mb-1 inline-flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 pl-2 pr-2 py-1.5 rounded-xl text-xs max-w-full border border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-bottom-1">
            <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-500">
              {file.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
            </div>
            <span className="font-medium truncate max-w-[150px]">{file.name}</span>
            <button onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value=''; }} className="ml-1 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                <X size={12} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={disabled || isReading}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 px-4 py-2 text-sm outline-none resize-none overflow-hidden min-h-[40px] max-h-[120px]"
          style={{ lineHeight: '1.5' }}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <div className="flex items-center gap-2">
            
            {/* Model Selector */}
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    disabled={disabled} 
                    className="flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                >
                  {loadingModel ? <Loader2 className="animate-spin w-3 h-3" /> : (
                    <>
                      {activeModelUI?.type === 'managed' ? <Sparkles size={12} className="text-orange-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      <span className="truncate max-w-[80px]">{activeModelUI?.label || 'Model'}</span>
                      <ChevronDown size={12} className="opacity-50" />
                    </>
                  )}
                </button>

                {isModelMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 animate-in zoom-in-95 duration-100 p-1">
                        <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Managed</div>
                        {availableModels.filter(m => m.type === 'managed').map(m => (
                            <button key={m.id} onClick={() => handleModelSelect(m.id)} className="w-full text-left px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center justify-between">
                                {m.label}
                                <AlertTriangle size={12} className="text-orange-500 opacity-50" />
                            </button>
                        ))}
                        {availableModels.some(m => m.type === 'custom') && (
                            <>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                                <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">My Keys</div>
                                {availableModels.filter(m => m.type === 'custom').map(m => (
                                    <button key={m.id} onClick={() => handleModelSelect(m.id)} className="w-full text-left px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2">
                                        <Cpu size={12} /> {m.label}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Attachment Button */}
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" 
                disabled={disabled || isReading}
                title="Attach file"
            >
              <Paperclip size={16} />
            </button>
          </div>

          {/* Send / Stop Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={showStopButton ? onStopTask : handleSend}
              disabled={(!text.trim() && !file && !showStopButton) || (disabled && !showStopButton) || isReading}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${showStopButton
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : (text.trim() || file) && !disabled
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
            >
              {isReading ? (
                  <Loader2 className="animate-spin w-4 h-4" /> 
              ) : showStopButton ? (
                  <div className="w-2.5 h-2.5 bg-white rounded-sm" /> 
              ) : (
                  <ArrowUp size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}