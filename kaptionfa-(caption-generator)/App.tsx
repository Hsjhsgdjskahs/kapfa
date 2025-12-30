// ... (imports remain the same, ensuring all used components are imported)
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Wand2, Image as ImageIcon, Video as VideoIcon, MessageSquare, Mic, Download, History, Trash2, Menu, RefreshCw, Settings, FileText, Briefcase, Mail, Lightbulb, Clapperboard, MonitorPlay, WifiOff, Maximize, Minimize, Palette, Volume2, Key, Search, Copy, Check, Info, Loader2, Languages, Command, Bookmark, Share2, Sun, Moon, Sliders, Play, RotateCcw, Crop, Type, Upload, Grid, LayoutTemplate, PenTool, Eye, EyeOff, Save, MoreHorizontal, ArrowUp, QrCode, Music, Scissors, Film, Layers, Brush, Speaker, Radio, User, Shield, Zap, Keyboard, BarChart2, Activity, Film as FilmIcon, Edit3, Camera, Frame, Users, FileJson, ThumbsUp, ThumbsDown, LogOut } from 'lucide-react';
import { Tone, Platform, TextLength, ImageStyle, ChatPersona, MediaData, GeneratedCaption, AspectRatio, ImageSize, ChatMessage, HistoryItem, EmojiDensity, CallToAction, ToolType, AppTheme, UserSettings, SavedPrompt, TargetLanguage, ImageFilter, VideoAnalysis, AudioType, DirectorProject, StoryboardFrame } from './types';
import { fileToBase64, extractFramesFromVideo, playSound, triggerHaptic, parseMarkdown, downloadText, readFileAsText, applyImageFilters, generateQRCodeURL, playAudioBuffer, generateEDL, extractColors } from './utils';
import { generateCaption, generateImage, editImage, generateVideo, sendChatMessage, generateToolContent, enhancePrompt, analyzeVideoForEditing, generateAudio, transcribeAudio } from './services/geminiService';
import UploadArea from './components/UploadArea';
import ResultCard from './components/ResultCard';

type Tab = 'caption' | 'image' | 'video' | 'audio' | 'chat' | 'tools';

// --- Visualizer Component ---
const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
    return (
        <div className="flex items-center justify-center gap-1 h-12 w-full max-w-xs mx-auto bg-slate-900/50 rounded-xl px-4 overflow-hidden backdrop-blur-sm border border-white/5">
            {[...Array(12)].map((_, i) => (
                <div key={i} className={`w-1.5 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full transition-all duration-100 ${isPlaying ? 'animate-[bounce_1s_infinite]' : 'h-1.5'}`} style={{ height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%', animationDelay: `${i * 0.05}s` }}></div>
            ))}
        </div>
    );
};

// --- Helper Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
    useEffect(() => { const timer = setTimeout(onClose, 5000); return () => clearTimeout(timer); }, []);
    return (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] flex items-center gap-3 animate-fade-in-up border backdrop-blur-2xl max-w-md w-full justify-between ${type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-100' : type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' : 'bg-slate-900/90 border-indigo-500/50 text-indigo-100'}`}>
            <div className="flex items-center gap-3">
                {type === 'success' && <Check size={18} className="shrink-0"/>}
                {type === 'error' && <X size={18} className="shrink-0"/>}
                {type === 'info' && <Info size={18} className="shrink-0"/>}
                <span className="text-sm font-medium break-words text-right" dir="auto">{message}</span>
            </div>
            <button onClick={onClose}><X size={14} className="opacity-50 hover:opacity-100"/></button>
        </div>
    );
};

// ... (ShortcutsModal, SettingsModal, PromptLibraryModal, CommandPalette remain unchanged, omitted for brevity but logic assumed present)
// Re-implementing them briefly to ensure file integrity if copy-pasted.

const ShortcutsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 w-full max-w-sm animate-scale-in shadow-2xl" onClick={e=>e.stopPropagation()}>
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-white"><Keyboard size={24} className="text-indigo-400"/> میانبرهای صفحه کلید</h3>
                <div className="space-y-4 text-sm text-slate-300">
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>باز کردن فرمان‌ها</span><kbd className="bg-slate-800 border border-white/10 px-2 py-1 rounded-lg font-mono text-xs">Ctrl + K</kbd></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>بستن پنجره‌ها</span><kbd className="bg-slate-800 border border-white/10 px-2 py-1 rounded-lg font-mono text-xs">Esc</kbd></div>
                </div>
            </div>
        </div>
    );
}

const SettingsModal = ({ isOpen, onClose, settings, setSettings }: { isOpen: boolean, onClose: () => void, settings: UserSettings, setSettings: React.Dispatch<React.SetStateAction<UserSettings>> }) => {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md animate-scale-in shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e=>e.stopPropagation()}>
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-950">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Settings size={20} className="text-indigo-400"/> تنظیمات</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white"/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                     <div>
                         <label className="text-xs font-bold text-slate-400 mb-3 block">ظاهر برنامه</label>
                         <div className="grid grid-cols-5 gap-2">
                             {Object.values(AppTheme).map(t => (
                                 <button key={t} onClick={()=>setSettings({...settings, theme: t})} className={`h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.theme === t ? 'border-white scale-110' : 'border-transparent'}`} style={{backgroundColor: `var(--color-${t})`, background: t==='indigo' ? '#4f46e5' : t==='rose' ? '#e11d48' : t==='emerald' ? '#059669' : t==='amber' ? '#d97706' : t==='violet' ? '#7c3aed' : t==='slate' ? '#475569' : t==='sky' ? '#0284c7' : t==='lime' ? '#65a30d' : '#c026d3'}}></button>
                             ))}
                         </div>
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-400 mb-3 block">زبان هدف خروجی</label>
                         <select value={settings.targetLanguage} onChange={e=>setSettings({...settings, targetLanguage: e.target.value as any})} className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-indigo-500">
                             {Object.values(TargetLanguage).map(l => <option key={l} value={l}>{l}</option>)}
                         </select>
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-400 mb-3 block flex items-center gap-2"><Key size={14}/> کلید API جمنای (اختیاری)</label>
                         <input type="password" value={settings.apiKey || ''} onChange={e=>setSettings({...settings, apiKey: e.target.value})} placeholder="کلید را اینجا وارد کنید" className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 font-mono"/>
                     </div>
                </div>
            </div>
        </div>
    )
}

const PromptLibraryModal = ({ isOpen, onClose, onLoadPrompt, savedPrompts }: { isOpen: boolean, onClose: () => void, onLoadPrompt: (p: SavedPrompt) => void, savedPrompts: SavedPrompt[] }) => {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[75] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
             <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 w-full max-w-2xl animate-scale-in shadow-2xl h-[70vh] flex flex-col" onClick={e=>e.stopPropagation()}>
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Bookmark className="text-pink-400"/> کتابخانه پرامپت‌ها</h3>
                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                    {savedPrompts.length === 0 ? <div className="col-span-2 text-center text-slate-500 py-10">خالی!</div> : savedPrompts.map(p => (
                        <div key={p.id} onClick={()=>{onLoadPrompt(p); onClose();}} className="bg-slate-800/50 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-700/50 transition">{p.title}</div>
                    ))}
                </div>
             </div>
        </div>
    )
}

const CommandPalette = ({ isOpen, onClose, onAction }: { isOpen: boolean, onClose: () => void, onAction: (t: Tab) => void }) => {
    if(!isOpen) return null;
    const commands = [{ id: 'caption', label: 'تولید کپشن', icon: Sparkles }, { id: 'image', label: 'ساخت تصویر', icon: ImageIcon }, { id: 'video', label: 'ساخت ویدیو', icon: VideoIcon }, { id: 'audio', label: 'استودیو صدا', icon: Music }, { id: 'chat', label: 'چت هوشمند', icon: MessageSquare }, { id: 'tools', label: 'ابزارها', icon: Briefcase }];
    return (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20" onClick={onClose}>
            <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scale-in" onClick={e=>e.stopPropagation()}>
                <div className="p-4 border-b border-white/5 flex items-center gap-3"><Search className="text-slate-500"/><input autoFocus placeholder="جستجو..." className="bg-transparent text-white w-full outline-none" /></div>
                <div className="p-2">{commands.map(cmd => (<button key={cmd.id} onClick={()=>{onAction(cmd.id as Tab); onClose();}} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-600/20 text-slate-400"><cmd.icon size={18} /><span>{cmd.label}</span></button>))}</div>
            </div>
        </div>
    )
};

// --- Main App ---

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({ theme: AppTheme.INDIGO, soundEnabled: true, hapticEnabled: true, fontSize: 'base', ttsSpeed: 1, creativity: 1, zenMode: false, targetLanguage: TargetLanguage.PERSIAN, customBg: undefined, safetyFilter: 'block_some', batterySaver: false });
  const [activeTab, setActiveTab] = useState<Tab>('caption');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isPromptLibOpen, setIsPromptLibOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'|'info'} | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConfetti, setShowConfetti] = useState(false);
  const btnClass = "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/40 active:translate-y-0 active:scale-95";

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  
  const [media, setMedia] = useState<MediaData | null>(null);
  const [capTone, setCapTone] = useState<Tone>(Tone.INSTAGRAM);
  const [capPlatform, setCapPlatform] = useState<Platform>(Platform.INSTAGRAM);
  const [capLength, setCapLength] = useState<TextLength>(TextLength.MEDIUM);
  const [capDensity, setCapDensity] = useState<EmojiDensity>(EmojiDensity.STANDARD);
  const [capCTA, setCapCTA] = useState<CallToAction>(CallToAction.NONE);
  const [extractText, setExtractText] = useState(false);
  const [capPrompt, setCapPrompt] = useState('');
  const [captionResult, setCaptionResult] = useState<GeneratedCaption | null>(null);

  const [imgMode, setImgMode] = useState<'generate' | 'edit'>('generate');
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgNegPrompt, setImgNegPrompt] = useState('');
  const [imgStyle, setImgStyle] = useState<ImageStyle>(ImageStyle.NONE);
  const [imgBase, setImgBase] = useState<string | null>(null);
  const [genImgUrl, setGenImgUrl] = useState<string | null>(null);
  const [imgAspect, setImgAspect] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [imgSize, setImgSize] = useState<ImageSize>(ImageSize.R_1K);
  const [showCanvas, setShowCanvas] = useState(false);
  const [imgFilters, setImgFilters] = useState<ImageFilter>({ brightness: 100, contrast: 100, grayscale: 0, sepia: 0, blur: 0, rotation: 0, scaleX: 1, scaleY: 1, hue: 0, saturate: 100 });
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [vidMode, setVidMode] = useState<'generate' | 'director'>('generate');
  const [vidPrompt, setVidPrompt] = useState('');
  const [vidBase, setVidBase] = useState<string | null>(null);
  const [vidAspect, setVidAspect] = useState<'16:9' | '9:16'>('16:9');
  const [vidRes, setVidRes] = useState<'720p' | '1080p'>('720p');
  const [genVidUrl, setGenVidUrl] = useState<string | null>(null);
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [directorProject, setDirectorProject] = useState<DirectorProject>({ analysis: null, narrationAudio: null, musicAudio: null, thumbnailUrl: null });
  const [directorTab, setDirectorTab] = useState<'dashboard' | 'storyboard' | 'script'>('dashboard');

  const [audioPrompt, setAudioPrompt] = useState('');
  const [audioType, setAudioType] = useState<AudioType>(AudioType.SPEECH);
  const [audioVoice, setAudioVoice] = useState('Kore');
  const [genAudioBuffer, setGenAudioBuffer] = useState<ArrayBuffer | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatPersona, setChatPersona] = useState<ChatPersona>(ChatPersona.ASSISTANT);
  const [chatFile, setChatFile] = useState<{name: string, data: string, type: string} | null>(null);

  const [toolType, setToolType] = useState<ToolType>(ToolType.BIO);
  const [toolInput, setToolInput] = useState('');
  const [toolResult, setToolResult] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = (setter: (s:string)=>void) => {
      if (!('webkitSpeechRecognition' in window)) return showToast("مرورگر شما پشتیبانی نمی‌کند", "error");
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = "fa-IR";
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event: any) => { setter(event.results[0][0].transcript); setIsListening(false); };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
  };
  const toggleFullscreen = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch((err) => {}); } else { if (document.exitFullscreen) document.exitFullscreen(); } };
  const themeColors: Record<string, string> = { indigo: '#4f46e5', rose: '#e11d48', emerald: '#059669', amber: '#d97706', violet: '#7c3aed', slate: '#475569', sky: '#0284c7', lime: '#65a30d', fuchsia: '#c026d3' };
  const themeStyle = { backgroundColor: themeColors[settings.theme] || themeColors.indigo };

  useEffect(() => {
    const savedHist = localStorage.getItem('kaptionfa_history');
    const savedSet = localStorage.getItem('kaptionfa_settings');
    const savedPromptsLocal = localStorage.getItem('kaptionfa_prompts');
    const savedProj = sessionStorage.getItem('kaptionfa_director');
    if (savedHist) setHistoryItems(JSON.parse(savedHist));
    if (savedSet) setSettings(JSON.parse(savedSet));
    if (savedPromptsLocal) setSavedPrompts(JSON.parse(savedPromptsLocal));
    if (savedProj) setDirectorProject(JSON.parse(savedProj));

    const handleKey = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setIsCmdOpen(prev => !prev); }
        if (e.key === 'Escape') { setIsCmdOpen(false); setSettingsOpen(false); setIsPromptLibOpen(false); setShowCanvas(false); setIsShortcutsOpen(false); }
        if (e.key === '?') { setIsShortcutsOpen(true); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => { localStorage.setItem('kaptionfa_settings', JSON.stringify(settings)); localStorage.setItem('kaptionfa_prompts', JSON.stringify(savedPrompts)); }, [settings, savedPrompts]);
  useEffect(() => { if(showCanvas && canvasRef.current && (genImgUrl || imgBase)) { const img = new Image(); img.src = genImgUrl || `data:image/jpeg;base64,${imgBase}`; img.crossOrigin = "anonymous"; img.onload = () => { applyImageFilters(canvasRef.current!, img, imgFilters); if(!extractedColors.length) extractColors(img.src).then(setExtractedColors); }; } }, [showCanvas, imgFilters, genImgUrl, imgBase]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => { setToast({msg, type}); if(type === 'success') { playSound('success', settings.soundEnabled); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); } if(type === 'error') playSound('error', settings.soundEnabled); };
  const addToHistory = (type: HistoryItem['type'], content: string, thumb?: string) => { const newItem: HistoryItem = { id: Date.now().toString(), type, content, thumbnail: thumb, timestamp: Date.now() }; const updated = [newItem, ...historyItems].slice(0, 100); setHistoryItems(updated); localStorage.setItem('kaptionfa_history', JSON.stringify(updated)); };
  const savePrompt = (text: string, category: SavedPrompt['category']) => { if(!text) return; const newPrompt: SavedPrompt = { id: Date.now().toString(), title: text.slice(0, 20) + '...', text, category, timestamp: Date.now() }; setSavedPrompts([newPrompt, ...savedPrompts]); showToast("پرامپت ذخیره شد", "success"); }
  const handleMagicEnhance = async (setInput: (s: string) => void, input: string) => { if(!input) return showToast("ابتدا متنی بنویسید", "error"); setIsProcessing(true); triggerHaptic(settings.hapticEnabled); try { const enhanced = await enhancePrompt(input, settings.apiKey); setInput(enhanced); showToast("پرامپت جادویی شد! ✨", "success"); } catch(e: any) { showToast(e.message || "خطا در ارتباط", "error"); } setIsProcessing(false); };

  const handleCaption = async () => {
      if(!media) return;
      setIsProcessing(true); setLoadingMsg("در حال تحلیل و نوشتن...");
      try {
          // CRITICAL FIX: Explicitly handle mime types for extracted video frames
          // If media.type is video, we have an array of JPEGs in base64Parts.
          // We must send 'image/jpeg' as the mime type for these parts, regardless of the original file mime type.
          let mime = media.mimeType || 'image/jpeg';
          if (media.type === 'video') {
              mime = 'image/jpeg';
          } else if (media.type === 'audio') {
              mime = 'audio/mp3';
          }

          const res = await generateCaption(
              media.base64Parts!, 
              mime, // Pass the corrected mime type
              capTone, capPlatform, capLength, capDensity, capCTA, extractText, settings.targetLanguage, capPrompt, settings.apiKey, settings.creativity
          );
          setCaptionResult(res);
          addToHistory('caption', res.caption_fa, media.previewUrl);
          showToast("کپشن آماده شد", "success");
      } catch(e: any) { console.error(e); showToast(e.message || "خطا در تولید", "error"); }
      setIsProcessing(false);
  };

  const handleImage = async () => { setIsProcessing(true); setLoadingMsg("در حال نقاشی..."); try { let b64 = ''; if(imgMode === 'generate') { b64 = await generateImage(imgPrompt, imgStyle, imgNegPrompt, imgAspect, imgSize, settings.apiKey); } else { if(!imgBase) throw new Error("تصویر پایه را آپلود کنید"); b64 = await editImage(imgBase, imgPrompt, settings.apiKey); } const url = `data:image/png;base64,${b64}`; setGenImgUrl(url); addToHistory('image', url, url); showToast("تصویر ساخته شد", "success"); } catch(e: any) { showToast(e.message || "خطا در ساخت تصویر", "error"); } setIsProcessing(false); };
  
  const handleDirectorAnalysis = async () => { if (videoFrames.length === 0) return showToast("ابتدا ویدیو آپلود کنید", "error"); setIsProcessing(true); setLoadingMsg("کارگردان در حال آنالیز صحنه‌ها..."); try { const analysis = await analyzeVideoForEditing(videoFrames, vidPrompt, settings.apiKey); setDirectorProject(prev => ({ ...prev, analysis })); showToast("آنالیز انجام شد!", "success"); } catch(e: any) { showToast(e.message || "خطا در آنالیز", "error"); } setIsProcessing(false); };
  const handleGenerateStoryboardImage = async (frame: StoryboardFrame) => { setIsProcessing(true); setLoadingMsg("رسم استوری‌برد..."); try { const b64 = await generateImage(frame.prompt, ImageStyle.SKETCH, "", AspectRatio.LANDSCAPE_16_9, ImageSize.R_1K, settings.apiKey); const newUrl = `data:image/png;base64,${b64}`; setDirectorProject(prev => { if (!prev.analysis?.storyboard) return prev; const newBoard = prev.analysis.storyboard.map(f => f.id === frame.id ? { ...f, imageUrl: newUrl } : f); return { ...prev, analysis: { ...prev.analysis, storyboard: newBoard } }; }); showToast("فریم طراحی شد", "success"); } catch(e: any) { showToast(e.message || "خطا", "error"); } setIsProcessing(false); };
  
  const handleVideo = async () => { if (vidMode === 'director') { handleDirectorAnalysis(); return; } setIsProcessing(true); setLoadingMsg("تولید ویدیو با Veo..."); try { const win = window as any; if (win.aistudio && !settings.apiKey) { const hasKey = await win.aistudio.hasSelectedApiKey(); if (!hasKey) await win.aistudio.openSelectKey(); } const url = await generateVideo(vidPrompt, vidAspect, vidRes, vidBase || undefined, settings.apiKey); setGenVidUrl(url); addToHistory('video', url); showToast("ویدیو آماده شد!", "success"); } catch(e: any) { showToast(e.message || "خطا در ساخت ویدیو", "error"); } setIsProcessing(false); };
  
  const handleAudio = async () => { if(audioType === AudioType.TRANSCRIPTION) { if(!media || media.type !== 'audio') return showToast("فایل صوتی آپلود کنید", "error"); setIsProcessing(true); setLoadingMsg("در حال تبدیل صدا به متن..."); try { const txt = await transcribeAudio(media.base64Parts![0], media.mimeType!, settings.apiKey); setTranscribedText(txt); addToHistory('audio', txt.slice(0, 50) + "..."); showToast("انجام شد", "success"); } catch(e: any) { showToast(e.message || "خطا", "error"); } setIsProcessing(false); return; } if(!audioPrompt) return; setIsProcessing(true); setLoadingMsg("تولید صدا..."); try { const buffer = await generateAudio(audioPrompt, audioType, audioVoice, settings.apiKey); setGenAudioBuffer(buffer); addToHistory('audio', audioPrompt); showToast("صدا تولید شد", "success"); } catch(e: any) { showToast(e.message || "خطا در تولید صدا", "error"); } setIsProcessing(false); };
  
  const handleChat = async () => { if(!chatInput.trim() && !chatFile) return; const msg = { role: 'user', text: chatInput, timestamp: Date.now() } as ChatMessage; setChatHistory(prev => [...prev, msg]); setChatInput(''); setChatFile(null); setIsProcessing(true); try { const historyForApi = chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })); const sys = `You are a ${chatPersona}. Language: ${settings.targetLanguage}.`; const files = chatFile ? [{mimeType: chatFile.type, data: chatFile.data}] : []; const text = await sendChatMessage(historyForApi, msg.text, sys, files, settings.apiKey, settings.creativity); setChatHistory(prev => [...prev, { role: 'model', text, timestamp: Date.now() }]); } catch(e: any) { showToast(e.message || "خطا در ارتباط", "error"); } setIsProcessing(false); };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-row text-${settings.fontSize} relative`} style={{ backgroundImage: settings.customBg ? `url(${settings.customBg})` : undefined, backgroundSize: 'cover' }}>
      {!settings.customBg && !settings.zenMode && ( <> <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none"></div> <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000 pointer-events-none"></div> <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-600/10 rounded-full blur-[130px] mix-blend-screen pointer-events-none"></div> </> )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onAction={setActiveTab} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={()=>setSettingsOpen(false)} settings={settings} setSettings={setSettings} />
      <PromptLibraryModal isOpen={isPromptLibOpen} onClose={()=>setIsPromptLibOpen(false)} savedPrompts={savedPrompts} onLoadPrompt={(p)=>{ if(p.category==='image') setImgPrompt(p.text); else if(p.category==='video') setVidPrompt(p.text); else if(p.category==='audio') setAudioPrompt(p.text); else setCapPrompt(p.text); }} />
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-[100] flex justify-center items-start pt-20"><div className="text-6xl animate-bounce">🎉✨🎬</div></div>}

      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col z-40 hidden md:flex`}>
          <div className="p-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"><Sparkles size={24} className="text-white"/></div>
              {isSidebarOpen && <h1 className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">KaptionFa</h1>}
          </div>
          <div className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
              {[{ id: 'caption', icon: Sparkles, label: 'کپشن هوشمند' }, { id: 'image', icon: ImageIcon, label: 'استودیو تصویر' }, { id: 'video', icon: VideoIcon, label: 'استودیو ویدیو' }, { id: 'audio', icon: Music, label: 'استودیو صدا' }, { id: 'chat', icon: MessageSquare, label: 'چت هوشمند' }, { id: 'tools', icon: Briefcase, label: 'جعبه ابزار' }].map((item) => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id as Tab); playSound('click', settings.soundEnabled); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}`}>
                      <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''}/> {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
                  </button>
              ))}
          </div>
          <div className="p-4 border-t border-white/5 space-y-2">
               <button onClick={()=>setSidebarOpen(!isSidebarOpen)} className="p-2 w-full flex justify-center text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors hover:scale-105 active:scale-95"><Menu size={20}/></button>
               <button onClick={()=>setSettingsOpen(true)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1 ${!isSidebarOpen && 'justify-center'}`}><Settings size={20}/> {isSidebarOpen && <span>تنظیمات</span>}</button>
          </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/30 backdrop-blur-md z-30">
               <div className="flex items-center gap-4 md:hidden"><div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center"><Sparkles size={16}/></div></div>
               <div className="flex-1 max-w-xl mx-auto hidden md:block"><div className="relative group" onClick={()=>setIsCmdOpen(true)}><Search className="absolute right-3 top-2.5 text-slate-500 group-hover:text-indigo-400 transition" size={18}/><input type="text" readOnly placeholder="جستجو یا اجرای دستور (Ctrl+K)..." className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2 pr-10 pl-4 text-sm text-slate-300 focus:outline-none cursor-pointer hover:bg-slate-800/80 transition-colors"/></div></div>
               <div className="flex items-center gap-3"> {!isOnline && <span className="text-xs text-red-400 font-bold flex items-center gap-1 bg-red-900/20 px-2 py-1 rounded-lg border border-red-500/20"><WifiOff size={14}/> آفلاین</span>} <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all hover:scale-110 active:scale-95"><Maximize size={20}/></button> <button onClick={()=>setIsPromptLibOpen(true)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all hover:scale-110 active:scale-95"><Bookmark size={20}/></button> </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
             <div className={`max-w-5xl mx-auto pb-20 ${settings.zenMode ? 'mt-10' : ''}`}>
                 {activeTab === 'caption' && (
                     <div className="animate-fade-in-up space-y-8">
                         {!media ? (
                            <UploadArea onFileSelect={async (f) => { setIsProcessing(true); try { const b64 = await fileToBase64(f); let type: any = 'image'; let parts = [b64]; if(f.type.startsWith('video')) { type='video'; parts = await extractFramesFromVideo(f); } if(f.type.startsWith('audio')) { type='audio'; } setMedia({file: f, previewUrl: URL.createObjectURL(f), type, base64Parts: parts, mimeType: f.type}); } catch(e) { showToast("خطا در فایل", "error"); } setIsProcessing(false); }} isLoading={isProcessing} />
                         ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                     <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-4 relative group backdrop-blur-sm shadow-xl aspect-square flex items-center justify-center">
                                        <button onClick={() => { setMedia(null); setCaptionResult(null); }} className="absolute top-4 right-4 bg-red-500/80 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-red-600 hover:scale-110 hover:rotate-12 active:scale-95"><Trash2 size={18}/></button>
                                        {media.type === 'video' ? <video src={media.previewUrl} controls className="max-h-full rounded-2xl shadow-2xl"/> : media.type === 'audio' ? <div className="text-center"><Mic className="text-indigo-400 mx-auto mb-2 animate-bounce" size={40}/><span className="font-mono text-sm">Audio File</span></div> : <img src={media.previewUrl} className="max-h-full rounded-2xl object-contain shadow-2xl"/>}
                                     </div>
                                     <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                                         <label className="text-xs text-slate-400 mb-2 block font-bold">پرامپت دستی (اختیاری)</label>
                                         <div className="relative">
                                             <input type="text" value={capPrompt} onChange={e=>setCapPrompt(e.target.value)} placeholder="مثلاً: درباره قیمت چیزی نگو..." className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none pr-10 pl-10"/>
                                             <button onClick={()=>startListening(setCapPrompt)} className={`absolute left-2 top-2.5 p-1 rounded-lg transition-transform hover:scale-110 active:scale-95 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-indigo-400'}`}><Mic size={16}/></button>
                                             <button onClick={()=>handleMagicEnhance(setCapPrompt, capPrompt)} className="absolute right-2 top-2.5 text-indigo-400 hover:text-white transition-transform hover:scale-110 active:scale-95"><Wand2 size={16}/></button>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-6">
                                     <h3 className="font-bold text-lg flex items-center gap-2"><Sliders size={20}/> تنظیمات کپشن</h3>
                                     <div className="grid grid-cols-2 gap-4">
                                          {[{ val: capPlatform, set: setCapPlatform, opts: Platform, l: 'پلتفرم' }, { val: capTone, set: setCapTone, opts: Tone, l: 'لحن' }, { val: capLength, set: setCapLength, opts: TextLength, l: 'طول' }, { val: capDensity, set: setCapDensity, opts: EmojiDensity, l: 'ایموجی' }].map((field, i) => (
                                              <div key={i}>
                                                  <label className="text-[10px] text-slate-400 mb-1 block font-bold">{field.l}</label>
                                                  <select className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 transition-colors hover:border-white/20" value={field.val} onChange={(e) => field.set(e.target.value as any)}>
                                                      {Object.values(field.opts).map(o => <option key={o} value={o}>{o.split('(')[0]}</option>)}
                                                  </select>
                                              </div>
                                          ))}
                                     </div>
                                     <select className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 transition-colors hover:border-white/20" value={capCTA} onChange={e => setCapCTA(e.target.value as any)}> <option value="">-- انتخاب دعوت به اقدام (CTA) --</option> {Object.values(CallToAction).map(c => <option key={c} value={c}>{c}</option>)} </select>
                                     <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-white/5"> <span className="text-sm text-slate-300">استخراج متن از تصویر (OCR)</span> <button onClick={() => setExtractText(!extractText)} className={`w-10 h-6 rounded-full transition-colors relative ${extractText ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`}> <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${extractText ? 'left-1' : 'right-1'}`}></div> </button> </div>
                                     <div className="flex gap-2"> <button onClick={handleCaption} disabled={isProcessing} className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${btnClass} disabled:opacity-50`}> {isProcessing ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>} تولید کپشن </button> <button onClick={()=>savePrompt(capPrompt, 'text')} className="p-4 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-all hover:scale-105 active:scale-95" title="ذخیره پرامپت"><Bookmark size={20}/></button> </div>
                                 </div>
                             </div>
                         )}
                         {captionResult && <ResultCard result={captionResult} ttsSpeed={settings.ttsSpeed} />}
                     </div>
                 )}

                 {activeTab === 'video' && (
                     <div className="space-y-6 animate-fade-in-up">
                         <div className="flex justify-center mb-8">
                             <div className="bg-slate-900/50 p-1.5 rounded-2xl flex gap-2 border border-white/10">
                                 <button onClick={() => setVidMode('generate')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${vidMode === 'generate' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}><VideoIcon size={16}/> ساخت ویدیو (Veo)</button>
                                 <button onClick={() => setVidMode('director')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${vidMode === 'director' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}><Clapperboard size={16}/> کارگردان هوشمند</button>
                             </div>
                         </div>
                         {vidMode === 'director' ? (
                             <div className="space-y-6">
                                 {!vidBase ? (
                                     <div className="bg-slate-900/40 p-10 rounded-3xl border border-white/10 backdrop-blur-md text-center">
                                         <h3 className="text-2xl font-black text-white mb-2">استودیوی کارگردانی</h3>
                                         <p className="text-slate-400 mb-8">ویدیو رو آپلود کن تا هوش مصنوعی برات استوری‌برد، سناریو و تحلیل کامل بسازه.</p>
                                         <UploadArea label="ویدیو را اینجا رها کنید" accept="video/*" onFileSelect={async f => { setIsProcessing(true); const frames = await extractFramesFromVideo(f, 6); setVideoFrames(frames); setVidBase(frames[0]); setIsProcessing(false); }} isLoading={isProcessing}/>
                                     </div>
                                 ) : (
                                     <div className="animate-fade-in-up">
                                         <div className="flex border-b border-white/10 mb-6">
                                             <button onClick={()=>setDirectorTab('dashboard')} className={`px-6 py-3 text-sm font-bold border-b-2 transition ${directorTab==='dashboard'?'border-indigo-500 text-white':'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>داشبورد</button>
                                             <button onClick={()=>setDirectorTab('storyboard')} className={`px-6 py-3 text-sm font-bold border-b-2 transition ${directorTab==='storyboard'?'border-indigo-500 text-white':'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>استوری‌برد 🎨</button>
                                             <button onClick={()=>setDirectorTab('script')} className={`px-6 py-3 text-sm font-bold border-b-2 transition ${directorTab==='script'?'border-indigo-500 text-white':'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>فیلم‌نامه 📝</button>
                                         </div>
                                         {!directorProject.analysis && (
                                            <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 text-center space-y-4">
                                                <div className="grid grid-cols-6 gap-2 h-24 mb-4 opacity-50"> {videoFrames.map((f, i) => <img key={i} src={`data:image/jpeg;base64,${f}`} className="w-full h-full object-cover rounded-lg"/>)} </div>
                                                <textarea value={vidPrompt} onChange={e => setVidPrompt(e.target.value)} placeholder="دستور کارگردان..." className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 h-32 focus:border-indigo-500 outline-none text-sm"/>
                                                <button onClick={handleDirectorAnalysis} disabled={isProcessing} className={`px-8 py-3 rounded-xl font-bold ${btnClass} flex items-center gap-2 mx-auto`}>{isProcessing ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>} شروع تحلیل هوشمند</button>
                                            </div>
                                         )}
                                         {directorProject.analysis && (
                                             <div className="animate-scale-in">
                                                 {directorTab === 'dashboard' && (
                                                     <div className="space-y-6">
                                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                             <div className="bg-slate-800/40 p-5 rounded-2xl border border-white/5 flex items-center gap-4 transition-transform hover:scale-[1.02]"> <div className="p-3 bg-green-500/20 text-green-400 rounded-full"><BarChart2 size={24}/></div> <div><div className="text-xs text-slate-400">امتیاز وایرال</div><div className="text-2xl font-black">{directorProject.analysis.virality_score}/100</div></div> </div>
                                                             <div className="bg-slate-800/40 p-5 rounded-2xl border border-white/5 flex items-center gap-4 transition-transform hover:scale-[1.02]"> <div className="p-3 bg-pink-500/20 text-pink-400 rounded-full"><Music size={24}/></div> <div><div className="text-xs text-slate-400">موزیک پیشنهادی</div><div className="text-xs font-bold line-clamp-2">{directorProject.analysis.music_mood}</div></div> </div>
                                                             <div className="bg-slate-800/40 p-5 rounded-2xl border border-white/5 flex items-center gap-4 transition-transform hover:scale-[1.02]"> <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-full"><Users size={24}/></div> <div><div className="text-xs text-slate-400">کاراکترها</div><div className="text-xs font-bold">{directorProject.analysis.characters?.join(', ') || 'شناسایی نشد'}</div></div> </div>
                                                         </div>
                                                         <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10">
                                                             <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><Scissors size={16}/> تایم‌لاین پیشنهادی</h4>
                                                             <div className="flex h-12 w-full bg-slate-950 rounded-lg overflow-hidden relative">
                                                                  {directorProject.analysis.cuts.map((cut, i) => (
                                                                      <div key={i} className="h-full border-r border-slate-900 relative group transition-all hover:brightness-110" style={{ width: `${(cut.duration / directorProject.analysis!.cuts.reduce((a,b)=>a+b.duration,0)) * 100}%`, backgroundColor: `hsl(${i * 50 + 200}, 70%, 60%)` }}>
                                                                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">{cut.reason}</div>
                                                                      </div>
                                                                  ))}
                                                             </div>
                                                         </div>
                                                          <div className="grid grid-cols-2 gap-4">
                                                              <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer" onClick={()=>{downloadText('project.edl', generateEDL(directorProject.analysis!))}}> <div className="flex justify-between items-start mb-2"><FileJson className="text-indigo-400"/><Download size={16} className="text-slate-500"/></div> <h4 className="font-bold text-sm">دانلود EDL</h4> <p className="text-[10px] text-slate-500">مخصوص پریمیر/داوینچی</p> </div>
                                                              <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer" onClick={()=>{downloadText('script.txt', directorProject.analysis!.narration_script)}}> <div className="flex justify-between items-start mb-2"><FileText className="text-pink-400"/><Download size={16} className="text-slate-500"/></div> <h4 className="font-bold text-sm">دانلود سناریو</h4> <p className="text-[10px] text-slate-500">فایل متنی نریشن</p> </div>
                                                          </div>
                                                     </div>
                                                 )}
                                                 {directorTab === 'storyboard' && (
                                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                         {directorProject.analysis.storyboard?.map((frame, i) => (
                                                             <div key={i} className="bg-slate-800/40 rounded-2xl border border-white/5 overflow-hidden group hover:border-indigo-500/50 transition-all hover:scale-[1.01]">
                                                                 <div className="aspect-video bg-black relative flex items-center justify-center">
                                                                     {frame.imageUrl ? <img src={frame.imageUrl} className="w-full h-full object-cover"/> : <div className="text-center p-4"><p className="text-xs text-slate-500 mb-2">{frame.camera_angle}</p><button onClick={()=>handleGenerateStoryboardImage(frame)} className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors hover:scale-105 active:scale-95">رسم فریم</button></div>}
                                                                     <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono">SCENE {i+1}</div>
                                                                 </div>
                                                                 <div className="p-4"> <p className="text-xs text-slate-300 leading-relaxed">{frame.description}</p> <p className="text-[10px] text-slate-500 mt-2 font-mono">Prompt: {frame.prompt.slice(0,30)}...</p> </div>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 )}
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                         ) : (
                             <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 space-y-6 backdrop-blur-md">
                                 <div className="flex gap-4 items-start flex-col md:flex-row">
                                     <div className="flex-1 relative w-full"> <textarea value={vidPrompt} onChange={e => setVidPrompt(e.target.value)} placeholder="صحنه‌ای که می‌خواهید بسازید..." className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 h-40 focus:border-cyan-500 outline-none resize-none text-sm"/> <button onClick={() => handleMagicEnhance(setVidPrompt, vidPrompt)} className="absolute bottom-3 left-3 text-cyan-400 hover:text-white transition-transform hover:scale-110 active:scale-95"><Wand2 size={16}/></button> </div>
                                     <div className="w-full md:w-40 space-y-2"> {vidBase ? <div className="relative group"><img src={`data:image/jpeg;base64,${vidBase}`} className="w-full h-32 object-cover rounded-xl transition-all group-hover:brightness-75"/><button onClick={() => setVidBase(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 transition-transform hover:scale-110 active:scale-95 hover:bg-red-600"><X size={12}/></button></div> : <label className="flex flex-col items-center justify-center h-32 bg-slate-950/80 border border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors group"><ImageIcon size={20} className="text-slate-600 group-hover:text-cyan-500 transition-colors"/><span className="text-[10px] text-slate-500 mt-1 group-hover:text-cyan-400 transition-colors">تصویر مرجع</span><input type="file" className="hidden" accept="image/*" onChange={async e => e.target.files?.[0] && setVidBase(await fileToBase64(e.target.files[0]))}/></label>} </div>
                                 </div>
                                 <div className="flex gap-3 text-xs justify-between items-center">
                                     <div className="flex gap-2"> {['16:9', '9:16'].map(r => <button key={r} onClick={() => setVidAspect(r as any)} className={`px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 ${vidAspect===r ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-950 text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>{r}</button>)} </div>
                                     <button onClick={handleVideo} disabled={isProcessing || !vidPrompt} className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50 bg-cyan-600 hover:bg-cyan-500 hover:-translate-y-1 hover:shadow-cyan-500/40 active:translate-y-0 active:scale-95`}> {isProcessing ? <Loader2 className="animate-spin"/> : <MonitorPlay size={18}/>} رندر ویدیو </button>
                                 </div>
                             </div>
                         )}
                         {genVidUrl && <div className="mt-6 animate-scale-in"><video src={genVidUrl} controls autoPlay loop className="w-full rounded-3xl shadow-2xl border border-white/10"/><a href={genVidUrl} download="video.mp4" className="block text-center mt-3 text-cyan-400 text-sm hover:underline">دانلود ویدیو</a></div>}
                    </div>
                 )}

                 {activeTab === 'audio' && (
                     <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 space-y-6 backdrop-blur-md">
                            <div className="flex gap-2 mb-4 bg-slate-950/50 p-1 rounded-2xl"> {Object.values(AudioType).map((t) => ( <button key={t} onClick={()=>setAudioType(t)} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-xs ${audioType===t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{t.split('(')[0]}</button> ))} </div>
                            {audioType === AudioType.TRANSCRIPTION ? ( <div className="space-y-6"> {!media || media.type !== 'audio' ? ( <UploadArea label="فایل صوتی برای تبدیل به متن" accept="audio/*" onFileSelect={async f => { const b64 = await fileToBase64(f); setMedia({file: f, previewUrl: URL.createObjectURL(f), type: 'audio', base64Parts: [b64], mimeType: f.type}); }} isLoading={isProcessing}/> ) : ( <div className="space-y-4"> <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-4 border border-white/5 hover:border-white/20 transition-colors"> <Music className="text-pink-400"/> <div className="flex-1 text-xs truncate">{media.file.name}</div> <button onClick={()=>setMedia(null)}><X className="text-slate-500 hover:text-red-400 transition-colors hover:scale-110 active:scale-95"/></button> </div> <button onClick={handleAudio} disabled={isProcessing} className={`w-full py-4 rounded-xl font-bold ${btnClass}`}>{isProcessing ? <Loader2 className="animate-spin"/> : <FileText/>} شروع تبدیل</button> </div> )} {transcribedText && ( <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 animate-scale-in"> <div className="flex justify-between mb-4"> <h4 className="font-bold text-sm">متن استخراج شده</h4> <button onClick={()=>{navigator.clipboard.writeText(transcribedText); showToast("کپی شد", "success")}}><Copy size={16} className="text-slate-400 hover:text-white transition-transform hover:scale-110 active:scale-95"/></button> </div> <p className="text-sm leading-loose text-slate-300 whitespace-pre-wrap">{transcribedText}</p> </div> )} </div> ) : ( <> <textarea value={audioPrompt} onChange={e => setAudioPrompt(e.target.value)} placeholder={audioType===AudioType.SPEECH ? "متنی که میخواهید گوینده بگوید..." : "توصیف صدای مورد نظر"} className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 h-40 focus:border-indigo-500 outline-none text-sm"/> <button onClick={handleAudio} disabled={isProcessing || !audioPrompt} className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 text-white disabled:opacity-50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 active:translate-y-0 active:scale-95`} style={themeStyle}> {isProcessing ? <Loader2 className="animate-spin"/> : <Speaker size={20}/>} تولید صدا </button> </> )}
                        </div>
                        {genAudioBuffer && ( <div className="bg-slate-800/80 p-6 rounded-2xl flex items-center justify-between border border-white/10 animate-scale-in"> <div className="flex items-center gap-4 w-full"> <button onClick={()=>{setIsPlayingAudio(true); playAudioBuffer(genAudioBuffer).then(()=>setTimeout(()=>setIsPlayingAudio(false), 3000))}} className="p-3 bg-green-500 rounded-full text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110 active:scale-95 flex-shrink-0"><Play size={20} fill="white"/></button> <AudioVisualizer isPlaying={isPlayingAudio} /> </div> <button className="text-slate-400 hover:text-white ml-4 transition-transform hover:scale-110 active:scale-95"><Download/></button> </div> )}
                     </div>
                 )}
                 {activeTab === 'image' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-md space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4"> <textarea value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)} placeholder="توصیف تصویر مورد نظر..." className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 h-32 focus:border-indigo-500 outline-none text-sm resize-none"/> <div className="flex gap-2"> <button onClick={() => setImgPrompt("A futuristic, minimalist app icon for an AI caption generator named 'KaptionFa'. Use a color palette of Indigo, Cyan, and Fuchsia.")} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-indigo-300 transition-colors"> 🎨 ساخت لوگوی KaptionFa </button> <button onClick={()=>handleMagicEnhance(setImgPrompt, imgPrompt)} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-pink-300 transition-colors flex items-center gap-1"><Wand2 size={12}/> جادوی متن</button> </div> </div>
                                <div className="w-full md:w-64 space-y-4"> <div> <label className="text-[10px] text-slate-400 font-bold mb-1 block">استایل</label> <select value={imgStyle} onChange={(e) => setImgStyle(e.target.value as any)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"> {Object.values(ImageStyle).map(s => <option key={s} value={s}>{s.split('(')[0]}</option>)} </select> </div> <div> <label className="text-[10px] text-slate-400 font-bold mb-1 block">نسبت تصویر</label> <div className="grid grid-cols-3 gap-2"> {[AspectRatio.SQUARE, AspectRatio.LANDSCAPE_16_9, AspectRatio.PORTRAIT_9_16].map(r => ( <button key={r} onClick={() => setImgAspect(r)} className={`px-2 py-2 rounded-lg text-xs transition-colors ${imgAspect === r ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{r}</button> ))} </div> </div> <button onClick={handleImage} disabled={isProcessing} className={`w-full py-3 rounded-xl font-bold text-sm ${btnClass} flex items-center justify-center gap-2`}> {isProcessing ? <Loader2 className="animate-spin"/> : <ImageIcon size={18}/>} ساخت تصویر </button> </div>
                            </div>
                        </div>
                        {genImgUrl && ( <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-md text-center animate-scale-in relative group"> <img src={genImgUrl} className="max-h-[500px] w-full object-contain rounded-2xl shadow-2xl"/> <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"> <a href={genImgUrl} download={`kaptionfa-${Date.now()}.png`} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500"><Download size={20}/></a> <button onClick={()=>setShowCanvas(true)} className="p-3 bg-slate-800 text-white rounded-xl shadow-lg hover:bg-slate-700"><Edit3 size={20}/></button> </div> </div> )}
                        {showCanvas && ( <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col p-4 animate-fade-in"> <div className="flex justify-between items-center mb-4"> <h3 className="text-white font-bold">ویرایشگر تصویر</h3> <button onClick={()=>setShowCanvas(false)}><X className="text-white"/></button> </div> <div className="flex-1 flex items-center justify-center overflow-hidden bg-slate-900/50 rounded-2xl border border-white/10 relative"> <canvas ref={canvasRef} className="max-w-full max-h-full object-contain"/> </div> <div className="h-32 bg-slate-900 border-t border-white/10 mt-4 rounded-xl p-4 flex gap-6 overflow-x-auto"> {Object.entries(imgFilters).map(([key, val]) => ( <div key={key} className="min-w-[100px]"> <label className="text-[10px] text-slate-400 block mb-1 capitalize">{key}</label> <input type="range" min={key.includes('scale') ? -1 : 0} max={key === 'hue' || key === 'rotation' ? 360 : 200} value={val} onChange={(e) => setImgFilters({...imgFilters, [key]: parseFloat(e.target.value)})} className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none"/> </div> ))} </div> </div> )}
                    </div>
                 )}
                 {activeTab === 'chat' && ( <div className="space-y-6 animate-fade-in-up"> <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-md h-[70vh] flex flex-col"> <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar"> {chatHistory.map((m,i)=>( <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}> <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${m.role==='user'?'bg-indigo-600 text-white rounded-tr-none':'bg-slate-800 text-slate-200 rounded-tl-none'}`} dangerouslySetInnerHTML={{__html: parseMarkdown(m.text)}}></div> </div> ))} {isProcessing && <div className="flex justify-start"><div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none"><Loader2 className="animate-spin text-slate-400"/></div></div>} </div> <div className="pt-4 border-t border-white/10 flex gap-2"> <select value={chatPersona} onChange={e=>setChatPersona(e.target.value as any)} className="bg-slate-950 border border-white/10 rounded-xl px-2 text-xs outline-none w-32"><option>پرسونا...</option>{Object.values(ChatPersona).map(p=><option key={p} value={p}>{p}</option>)}</select> <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleChat()} placeholder="پیام خود را بنویسید..." className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 text-sm focus:border-indigo-500 outline-none"/> <button onClick={handleChat} disabled={isProcessing} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500"><MessageSquare size={20}/></button> </div> </div> </div> )}
                 {activeTab === 'tools' && ( <div className="space-y-6 animate-fade-in-up"> <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-md"> <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"> {Object.values(ToolType).map(t=>(<button key={t} onClick={()=>setToolType(t)} className={`p-3 rounded-xl text-xs font-bold transition-all ${toolType===t?'bg-indigo-600 text-white':'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{t}</button>))} </div> <textarea value={toolInput} onChange={e=>setToolInput(e.target.value)} placeholder={`ورودی برای ${toolType}...`} className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 h-32 focus:border-indigo-500 outline-none text-sm mb-4"/> <button onClick={async ()=>{setIsProcessing(true);const res=await generateToolContent(toolType,toolInput,settings.targetLanguage,settings.apiKey);setToolResult(res);setIsProcessing(false);}} disabled={isProcessing} className={`w-full py-3 rounded-xl font-bold text-sm ${btnClass}`}>{isProcessing?<Loader2 className="animate-spin"/>:<Briefcase/>} تولید محتوا</button> {toolResult && <div className="mt-6 bg-slate-800/50 p-6 rounded-2xl border border-white/5 animate-scale-in"><div className="flex justify-between mb-2"><h4 className="font-bold text-indigo-300">نتیجه:</h4><button onClick={()=>navigator.clipboard.writeText(toolResult)}><Copy size={16}/></button></div><p className="whitespace-pre-wrap text-sm text-slate-300 leading-loose">{toolResult}</p></div>} </div> </div> )}
             </div>
          </div>
      </main>
    </div>
  );
};

export default App;