import { ImageFilter, VideoAnalysis } from "./types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};

export const extractFramesFromVideo = async (videoFile: File, frameCount: number = 6): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    const url = URL.createObjectURL(videoFile);

    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";

    video.onloadeddata = async () => {
      canvas.width = 480; 
      canvas.height = video.videoHeight * (480 / video.videoWidth);
      
      const duration = video.duration;
      const interval = duration / (frameCount + 1);

      try {
        for (let i = 1; i <= frameCount; i++) {
          const time = interval * i;
          await seekToTime(video, time);
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
            frames.push(dataUrl.split(',')[1]);
          }
        }
        URL.revokeObjectURL(url);
        resolve(frames);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
  });
};

const seekToTime = (video: HTMLVideoElement, time: number): Promise<void> => {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
};

// Returns AudioContext for visualization usage if needed, or simple playback
export const playAudioBuffer = async (arrayBuffer: ArrayBuffer, speed: number = 1.0): Promise<AudioContext> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0)); // Clone buffer to prevent detaching if reused
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = speed;
  source.connect(audioContext.destination);
  source.start(0);
  return audioContext;
};

export const playSound = (type: 'click' | 'success' | 'error' | 'delete', enabled: boolean) => {
  if (!enabled) return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'click') {
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'success') {
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }
};

export const triggerHaptic = (enabled: boolean) => {
    if (enabled && navigator.vibrate) {
        navigator.vibrate(15);
    }
};

export const parseMarkdown = (text: string) => {
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950 p-3 rounded-lg my-2 overflow-x-auto text-xs font-mono text-green-400 border border-slate-700 shadow-inner"><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-pink-300 font-mono text-xs border border-slate-700">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="text-slate-300 italic">$1</em>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-indigo-300 mt-3 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-indigo-200 mt-4 mb-2 border-b border-slate-700 pb-2">$1</h2>');
    html = html.replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>');
    html = html.replace(/\n\n/g, '<br/><br/>');
    return html;
};

export const downloadText = (filename: string, text: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

export const applyImageFilters = (canvas: HTMLCanvasElement, img: HTMLImageElement, filters: ImageFilter) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const filterString = `
        brightness(${filters.brightness}%) 
        contrast(${filters.contrast}%) 
        grayscale(${filters.grayscale}%) 
        sepia(${filters.sepia}%) 
        blur(${filters.blur}px)
        hue-rotate(${filters.hue}deg)
        saturate(${filters.saturate}%)
    `;
    ctx.filter = filterString;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((filters.rotation * Math.PI) / 180);
    ctx.scale(filters.scaleX, filters.scaleY);
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();
};

export const generateQRCodeURL = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
};

// Generate EDL (Edit Decision List) for Premiere/DaVinci
export const generateEDL = (analysis: VideoAnalysis): string => {
    let edl = `TITLE: AI_DIRECTOR_EDIT\nFCM: NON-DROP FRAME\n\n`;
    analysis.cuts.forEach((cut, index) => {
        // Mock timestamps conversion for demo purposes
        // In real app, we need exact frames. Here we assume 30fps and convert percent or string time to frames.
        const startFrame = (index * 100).toString().padStart(5, '0'); // Dummy calc
        const endFrame = ((index * 100) + 90).toString().padStart(5, '0');
        edl += `${(index + 1).toString().padStart(3, '0')}  AX       V     C        00:00:${startFrame.slice(0,2)}:00 00:00:${endFrame.slice(0,2)}:00 00:00:${startFrame.slice(0,2)}:00 00:00:${endFrame.slice(0,2)}:00\n`;
        edl += `* FROM CLIP NAME: RAW_VIDEO\n`;
        edl += `* COMMENT: ${cut.reason}\n\n`;
    });
    return edl;
};

// Simple Color Extractor (Mock logic using canvas)
export const extractColors = async (imgSrc: string): Promise<string[]> => {
    return new Promise(resolve => {
        const img = new Image();
        img.src = imgSrc;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const cvs = document.createElement('canvas');
            const ctx = cvs.getContext('2d');
            cvs.width = 50; cvs.height = 50; // Downscale
            if(ctx){
                ctx.drawImage(img, 0, 0, 50, 50);
                // Return dummy prominent colors for UI demo (Real implementation needs quantization)
                resolve(['#1e293b', '#6366f1', '#f43f5e', '#10b981']); 
            } else resolve([]);
        }
        img.onerror = () => resolve([]);
    })
};
