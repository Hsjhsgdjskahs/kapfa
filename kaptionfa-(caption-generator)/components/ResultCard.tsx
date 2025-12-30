import React, { useState } from 'react';
import { GeneratedCaption } from '../types';
import { Copy, Hash, Check, Volume2, Loader2, Share2, FileText, AlignLeft, Eye, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { playAudioBuffer } from '../utils';

interface ResultCardProps {
  result: GeneratedCaption;
  ttsSpeed: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, ttsSpeed }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [voice, setVoice] = useState<'Kore' | 'Puck'>('Kore'); 
  const [viewMode, setViewMode] = useState<'text' | 'preview'>('text');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const textToShare = `${result.caption_fa}\n\n${result.caption_en}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KaptionFa Result',
          text: textToShare,
        });
      } catch (err) { console.log("Share canceled"); }
    } else {
      handleCopy(textToShare);
    }
  };

  const handleSpeak = async (text: string, lang: 'fa' | 'en') => {
    if (isPlaying) return;
    setIsPlaying(lang);
    try {
      const audioBuffer = await generateSpeech(text, voice);
      await playAudioBuffer(audioBuffer, ttsSpeed);
    } catch (e) {
      console.error(e);
      alert("خطا در پخش صدا");
    } finally {
      setIsPlaying(null);
    }
  };

  const countWords = (str: string) => str.trim().split(/\s+/).length;

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 animate-fade-in-up mt-8 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all duration-300">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
            <h3 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-l from-indigo-400 to-cyan-400 flex items-center gap-2">
            <SparklesIcon /> نتیجه هوش مصنوعی
            </h3>
            <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/5">
                <button onClick={()=>setViewMode('text')} className={`px-3 py-1 text-xs rounded-md transition-all hover:scale-105 active:scale-95 ${viewMode==='text' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>متن</button>
                <button onClick={()=>setViewMode('preview')} className={`px-3 py-1 text-xs rounded-md transition-all hover:scale-105 active:scale-95 ${viewMode==='preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>اینستاگرام</button>
            </div>
        </div>
        
        <div className="flex gap-2 items-center">
            <select 
                value={voice} 
                onChange={(e) => setVoice(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-300 outline-none hover:border-indigo-500 transition-colors cursor-pointer"
            >
                <option value="Kore">👩 زن (Kore)</option>
                <option value="Puck">👨 مرد (Puck)</option>
            </select>
            <button onClick={handleShare} className="p-2 bg-slate-700/50 text-indigo-300 rounded-lg hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm">
                <Share2 size={16} />
            </button>
            <button
            onClick={() => handleCopy(`${result.caption_fa}\n\n${result.hashtags.join(' ')}`)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40 transform hover:-translate-y-0.5 hover:shadow-indigo-500/50 active:translate-y-0 active:scale-95"
            >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>کپی همه</span>
            </button>
        </div>
      </div>

      {viewMode === 'text' ? (
        <>
        {/* OCR Section */}
        {result.extracted_text && (
            <div className="bg-amber-900/10 rounded-xl p-4 mb-4 border border-amber-500/20">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                        <FileText size={14} />
                        <span>متن استخراج شده (OCR)</span>
                    </div>
                    <button onClick={() => handleCopy(result.extracted_text!)} className="text-amber-500 hover:text-white transition-transform hover:scale-110 active:scale-95"><Copy size={12}/></button>
                </div>
                <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{result.extracted_text}</p>
            </div>
        )}

        {/* Persian Caption */}
        <div className="bg-slate-900/40 rounded-2xl p-5 mb-4 border border-white/5 relative group transition-all hover:bg-slate-900/60 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <p className="text-lg leading-loose text-slate-100 whitespace-pre-wrap text-right font-medium" dir="rtl">
                    {result.caption_fa}
                    </p>
                    <div className="mt-3 flex gap-4 text-[10px] text-slate-500">
                        <span>{countWords(result.caption_fa)} کلمه</span>
                        <span>{result.caption_fa.length} کاراکتر</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => handleSpeak(result.caption_fa, 'fa')}
                        className="p-2 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-full transition-all bg-slate-800 hover:scale-110 active:scale-95 shadow-md"
                        title="شنیدن متن"
                    >
                        {isPlaying === 'fa' ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                    </button>
                    <button 
                        onClick={() => handleCopy(result.caption_fa)}
                        className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-full transition-all hover:scale-110 active:scale-95"
                        title="کپی متن فارسی"
                    >
                    <Copy size={18}/>
                    </button>
                </div>
            </div>
        </div>

        {/* English Caption */}
        <div className="bg-slate-900/40 rounded-2xl p-5 mb-4 border border-white/5 relative group transition-all hover:bg-slate-900/60 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <p className="text-lg leading-loose text-slate-200 whitespace-pre-wrap text-left font-sans" dir="ltr">
                    {result.caption_en}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => handleSpeak(result.caption_en, 'en')}
                        className="p-2 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-full transition-all bg-slate-800 hover:scale-110 active:scale-95 shadow-md"
                        title="Listen"
                    >
                        {isPlaying === 'en' ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                    </button>
                    <button 
                        onClick={() => handleCopy(result.caption_en)}
                        className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-full transition-all hover:scale-110 active:scale-95"
                        title="Copy English"
                    >
                    <Copy size={18}/>
                    </button>
                </div>
            </div>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
            {result.hashtags.map((tag, index) => (
            <span 
                key={index} 
                className="group flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/30 rounded-full border border-cyan-900/50 cursor-pointer hover:bg-cyan-600 hover:text-white transition-all hover:scale-105 active:scale-95 hover:shadow-cyan-500/20 shadow-sm"
                onClick={() => handleCopy(`#${tag.replace('#', '')}`)}
            >
                <Hash size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                {tag.replace('#', '')}
            </span>
            ))}
            <button 
                onClick={() => handleCopy(result.hashtags.map(t => `#${t.replace('#', '')}`).join(' '))}
                className="px-3 py-1.5 text-xs bg-slate-700 rounded-full hover:bg-slate-600 transition-all hover:scale-105 active:scale-95 text-slate-200 hover:text-white"
            >
                کپی هشتگ‌ها
            </button>
        </div>
        </>
      ) : (
          /* Instagram Mockup */
          <div className="max-w-sm mx-auto bg-black text-white rounded-xl border border-slate-800 overflow-hidden shadow-2xl transition-transform hover:scale-[1.01]">
              <div className="p-3 flex items-center gap-2 border-b border-slate-900">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-500"></div>
                  <span className="text-xs font-bold">kaptionfa_user</span>
              </div>
              <div className="h-64 bg-slate-900 flex items-center justify-center text-slate-700">Media Preview</div>
              <div className="p-3">
                  <div className="flex justify-between mb-3">
                      <div className="flex gap-4"><Heart size={20} className="cursor-pointer hover:text-red-500 transition-colors"/> <MessageCircle size={20} className="cursor-pointer hover:text-slate-300"/> <Share2 size={20} className="cursor-pointer hover:text-slate-300"/></div>
                      <Bookmark size={20} className="cursor-pointer hover:text-slate-300"/>
                  </div>
                  <div className="text-xs mb-2 font-bold">1,234 likes</div>
                  <div className="text-xs space-y-1">
                      <p><span className="font-bold mr-1">kaptionfa_user</span>{result.caption_fa}</p>
                      <p className="text-blue-400">{result.hashtags.map(t=>`#${t.replace('#','')}`).join(' ')}</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
);

export default ResultCard;