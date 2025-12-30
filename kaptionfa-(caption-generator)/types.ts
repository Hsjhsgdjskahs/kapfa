export enum Tone {
  FUNNY = 'خنده‌دار (Funny)',
  PROFESSIONAL = 'رسمی (Professional)',
  POETIC = 'ادبی و شاعرانه (Poetic)',
  INSTAGRAM = 'اینستاگرامی (Instagram Style)',
  MOTIVATIONAL = 'انگیزشی (Motivational)',
  MINIMAL = 'کوتاه و مینیمال (Minimal)',
  SALES = 'فروش و تبلیغاتی (Sales)',
  STORY = 'داستانی (Storytelling)',
  CRITICAL = 'نقد و بررسی (Critical)',
  FRIENDLY = 'دوستانه (Friendly)',
  DRAMATIC = 'دراماتیک (Dramatic)',
  URGENT = 'فوری/خبری (Urgent)'
}

export enum Platform {
  INSTAGRAM = 'اینستاگرام',
  TWITTER = 'توییتر / ایکس',
  LINKEDIN = 'لینکدین',
  TELEGRAM = 'تلگرام',
  YOUTUBE = 'یوتیوب',
  TIKTOK = 'تیک‌تاک',
  WEBSITE = 'وب‌سایت / بلاگ',
  THREADS = 'تردز (Threads)',
  PINTEREST = 'پینترست'
}

export enum TargetLanguage {
  PERSIAN = 'فارسی',
  ENGLISH = 'English',
  ARABIC = 'العربية',
  TURKISH = 'Türkçe',
  GERMAN = 'Deutsch',
  FRENCH = 'Français',
  SPANISH = 'Español',
  CHINESE = '中文'
}

export enum TextLength {
  SHORT = 'کوتاه (۱-۲ خط)',
  MEDIUM = 'متوسط (۱ پاراگراف)',
  LONG = 'طولانی (بلاگ پست)',
  VERY_LONG = 'خیلی طولانی (مقاله)',
  TWITTER_THREAD = 'رشته توییت'
}

export enum EmojiDensity {
  NONE = 'بدون ایموجی',
  MINIMAL = 'کم (پایان جملات)',
  STANDARD = 'استاندارد',
  HIGH = 'زیاد (جذاب و رنگی)',
  OVERLOAD = 'بمباران ایموجی 🔥'
}

export enum CallToAction {
  NONE = 'هیچ',
  LIKE_COMMENT = 'لایک و کامنت',
  SAVE_SHARE = 'ذخیره و اشتراک',
  LINK_BIO = 'لینک در بیو',
  BUY_NOW = 'خرید محصول',
  SIGN_UP = 'ثبت نام کنید',
  DM_ME = 'دایرکت دهید',
  SUBSCRIBE = 'سابسکرایب کنید'
}

export enum ImageStyle {
  NONE = 'بدون استایل',
  CINEMATIC = 'سینمایی (Cinematic)',
  ANIME = 'انیمه (Anime)',
  PHOTOREALISTIC = 'واقع‌گرایانه (Photorealistic)',
  CYBERPUNK = 'سایبرپانک (Cyberpunk)',
  WATERCOLOR = 'آبرنگ (Watercolor)',
  SKETCH = 'طراحی مداد (Sketch)',
  PIXEL_ART = 'پیکسل آرت (Pixel Art)',
  NEON_PUNK = 'نئون (Neon)',
  ISOMETRIC = 'ایزومتریک (Isometric)',
  OIL_PAINTING = 'رنگ روغن (Oil Painting)',
  RENDER_3D = 'رندر سه بعدی (3D Render)',
  VINTAGE = 'وینتیج/قدیمی (Vintage)',
  LOW_POLY = 'لو پلی (Low Poly)',
  CLAYMATION = 'خمیری (Claymation)',
  MINIMALIST = 'مینیمالیست (Minimalist)',
  SURREAL = 'سورئال (Surreal)'
}

export enum ChatPersona {
  ASSISTANT = 'دستیار هوشمند',
  CODER = 'برنامه‌نویس حرفه‌ای',
  STORYTELLER = 'داستان‌نویس',
  TEACHER = 'معلم دلسوز',
  PSYCHOLOGIST = 'مشاور روانشناس',
  MARKETER = 'مشاور بازاریابی',
  POET = 'شاعر کلاسیک',
  COMEDIAN = 'طنزپرداز',
  FILM_DIRECTOR = 'کارگردان سینما',
  FITNESS_COACH = 'مربی بدنسازی',
  CRITIC = 'منتقد فیلم و هنر',
  COPYWRITER = 'کپی‌رایتر تبلیغاتی'
}

export enum AppTheme {
  INDIGO = 'indigo',
  ROSE = 'rose',
  EMERALD = 'emerald',
  AMBER = 'amber',
  VIOLET = 'violet',
  SLATE = 'slate',
  SKY = 'sky',
  LIME = 'lime',
  FUCHSIA = 'fuchsia'
}

export enum ToolType {
  BIO = 'بیوگرافی',
  EMAIL = 'ایمیل',
  IDEA = 'ایده‌پردازی',
  SCRIPT = 'سناریو ویدیو',
  TRANSLATE = 'مترجم',
  GRAMMAR = 'اصلاح گرامر',
  SUMMARIZE = 'خلاصه‌سازی',
  HASHTAG = 'تولید هشتگ',
  REPLY = 'پاسخ به کامنت',
  LYRICS = 'ترانه نویسی',
  NAME_GENERATOR = 'انتخاب نام برند',
  SEO_KEYWORDS = 'کلمات کلیدی سئو',
  COLOR_PALETTE = 'پالت رنگ'
}

export enum AudioType {
  SPEECH = 'گفتار (TTS)',
  SOUND_EFFECT = 'افکت صوتی (SFX)',
  TRANSCRIPTION = 'تبدیل صدا به متن (STT)'
}

export interface GeneratedCaption {
  caption_fa: string;
  caption_en: string;
  hashtags: string[];
  extracted_text?: string;
  sentiment?: string;
  suggested_music?: string;
}

export interface StoryboardFrame {
    id: string;
    description: string;
    camera_angle: string;
    prompt: string;
    imageUrl?: string;
}

export interface VideoAnalysis {
  summary: string;
  virality_score: number; // 0-100
  cuts: { start: string; end: string; reason: string; duration: number }[];
  music_mood: string;
  narration_script: string;
  thumbnail_prompt: string;
  ffmpeg_command: string;
  storyboard?: StoryboardFrame[];
  characters?: string[];
}

export interface DirectorProject {
    analysis: VideoAnalysis | null;
    narrationAudio: ArrayBuffer | null;
    musicAudio: ArrayBuffer | null;
    thumbnailUrl: string | null;
    scriptText?: string;
}

export interface MediaData {
  file: File;
  previewUrl: string;
  type: 'image' | 'video' | 'audio';
  base64Parts?: string[]; 
  mimeType?: string;
  duration?: number;
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  LANDSCAPE_16_9 = '16:9',
  PORTRAIT_9_16 = '9:16',
  WIDE_21_9 = '21:9',
  STANDARD_3_2 = '3:2',
  STANDARD_2_3 = '2:3'
}

export enum ImageSize {
  R_1K = '1K',
  R_2K = '2K',
  R_4K = '4K'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isPinned?: boolean;
}

export interface HistoryItem {
  id: string;
  type: 'caption' | 'image' | 'video' | 'tool' | 'chat' | 'audio';
  thumbnail?: string;
  content: string; 
  timestamp: number;
  metadata?: any; 
  isFavorite?: boolean;
}

export interface SavedPrompt {
  id: string;
  title: string;
  text: string;
  category: 'image' | 'text' | 'video' | 'audio';
  timestamp: number;
}

export interface UserSettings {
  theme: AppTheme;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  fontSize: 'sm' | 'base' | 'lg';
  apiKey?: string;
  ttsSpeed: number;
  creativity: number; // 0 to 2
  customBg?: string; // base64
  zenMode: boolean;
  targetLanguage: TargetLanguage;
  safetyFilter: 'block_none' | 'block_few' | 'block_some' | 'block_most';
  batterySaver: boolean;
}

export interface ImageFilter {
  brightness: number; // 100 base
  contrast: number; // 100 base
  grayscale: number; // 0-100
  sepia: number; // 0-100
  blur: number; // 0-10
  rotation: number; // 0-360
  scaleX: number; // 1 or -1
  scaleY: number; // 1 or -1
  hue: number; // 0-360
  saturate: number; // 100 base
}
