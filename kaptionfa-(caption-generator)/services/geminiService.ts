import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Tone, Platform, TextLength, GeneratedCaption, AspectRatio, ImageSize, ImageStyle, EmojiDensity, CallToAction, ToolType, TargetLanguage, VideoAnalysis, AudioType } from '../types';

const getAiClient = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error("API Key یافت نشد. لطفاً کلید API را در تنظیمات یا متغیرهای محیطی بررسی کنید.");
  }
  return new GoogleGenAI({ apiKey: key });
};

const cleanJson = (text: string | undefined): string => {
  if (!text) return "{}";
  // Find the first '{' and last '}' to extract valid JSON
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return "{}";
  return text.substring(start, end + 1);
};

// --- Captioning & Transcription ---

export const generateCaption = async (
  base64Data: string[],
  mimeType: string,
  tone: Tone,
  platform: Platform,
  length: TextLength,
  density: EmojiDensity,
  cta: CallToAction,
  extractText: boolean,
  targetLang: TargetLanguage,
  customPrompt?: string,
  userApiKey?: string,
  creativity: number = 1
): Promise<GeneratedCaption> => {
  const ai = getAiClient(userApiKey);
  const model = 'gemini-3-flash-preview'; 

  const tonePrompt = `
    Role: Expert Social Media Manager.
    Task: Write a caption.
    Target Language: ${targetLang} (Main), English (Secondary).
    Tone: ${tone}. 
    Platform: ${platform}. 
    Length: ${length}.
    Emoji: ${density}.
    CTA: ${cta}.
  `;
  
  const ocrPrompt = extractText ? "Extract visible text to 'extracted_text'." : "Set 'extracted_text' to null.";
  
  const finalPrompt = `
    Analyze the media content. 
    ${tonePrompt}
    ${ocrPrompt}
    ${customPrompt ? `Context: ${customPrompt}` : ''}
    
    IMPORTANT: Return valid JSON only. No Markdown. No code blocks.
    Structure:
    {
      "caption_fa": "Main caption in Persian (or target lang)",
      "caption_en": "English caption",
      "hashtags": ["tag1", "tag2"],
      "extracted_text": "text found or null",
      "sentiment": "Positive/Negative",
      "suggested_music": "Genre/Mood suggestion"
    }
  `;

  // If mimeType denotes video but we have parts, it's likely frames.
  // However, the calling function should handle this. 
  // We trust the passed mimeType matches the data.
  const parts = base64Data.map(data => ({
    inlineData: { mimeType: mimeType, data: data }
  }));
  parts.push({ text: finalPrompt } as any);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        temperature: creativity,
        // responseMimeType removed to prevent 500 error on Vision tasks
      }
    });

    const cleanedText = cleanJson(response.text);
    return JSON.parse(cleanedText) as GeneratedCaption;
  } catch (error) {
    console.error("Gemini Caption Error:", error);
    throw error;
  }
};

// --- AI Director (Video Analysis & Auto-Edit Logic) ---

export const analyzeVideoForEditing = async (
  base64Frames: string[],
  instruction: string,
  userApiKey?: string
): Promise<VideoAnalysis> => {
    const ai = getAiClient(userApiKey);
    const model = 'gemini-3-pro-preview';

    const prompt = `
        You are a world-class Film Director and Editor.
        Analyze these video frames.
        Goal: "${instruction || 'Create a viral, cinematic video'}".
        
        Provide a detailed analysis, cut list, and a creative Storyboard.
        
        IMPORTANT: Return valid JSON only. No Markdown.
        Structure:
        {
            "summary": "Detailed analysis string",
            "virality_score": 0-100 (number),
            "cuts": [{"start": "00:00", "end": "00:05", "reason": "intro", "duration": 5}],
            "music_mood": "Audio description string",
            "narration_script": "Voiceover script string",
            "thumbnail_prompt": "Prompt for thumbnail string",
            "ffmpeg_command": "ffmpeg cut command string",
            "characters": ["string"],
            "storyboard": [{
                "id": "1",
                "description": "string",
                "camera_angle": "string",
                "prompt": "image generation prompt string"
            }]
        }
    `;

    const parts = base64Frames.map(data => ({
        inlineData: { mimeType: 'image/jpeg', data: data }
    }));
    parts.push({ text: prompt } as any);

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            temperature: 0.7,
            // responseMimeType removed
        }
    });

    const cleanedText = cleanJson(response.text);
    return JSON.parse(cleanedText) as VideoAnalysis;
}

// --- Tools Generator ---
export const generateToolContent = async (type: ToolType, input: string, targetLang: TargetLanguage, userApiKey?: string): Promise<string> => {
    const ai = getAiClient(userApiKey);
    let systemPrompt = `Role: Expert AI Tool. Language: ${targetLang}.`;
    
    switch (type) {
        case ToolType.BIO: systemPrompt += " Write an engaging Bio."; break;
        case ToolType.EMAIL: systemPrompt += " Write a professional email."; break;
        case ToolType.IDEA: systemPrompt += " Generate 10 viral content ideas."; break;
        case ToolType.SCRIPT: systemPrompt += " Write a video script (Hook, Body, CTA)."; break;
        case ToolType.TRANSLATE: systemPrompt += ` Translate accurately to ${targetLang}.`; break;
        case ToolType.GRAMMAR: systemPrompt += " Correct all grammar/spelling errors. Return ONLY corrected text."; break;
        case ToolType.SUMMARIZE: systemPrompt += " Summarize into bullet points."; break;
        case ToolType.HASHTAG: systemPrompt += " Generate 30 SEO-optimized hashtags."; break;
        case ToolType.REPLY: systemPrompt += " Write a witty/polite reply."; break;
        case ToolType.LYRICS: systemPrompt += " Write song lyrics."; break;
        case ToolType.NAME_GENERATOR: systemPrompt += " Generate creative brand names."; break;
        case ToolType.SEO_KEYWORDS: systemPrompt += " Extract high-ranking SEO keywords (CSV format)."; break;
        case ToolType.COLOR_PALETTE: systemPrompt += " Suggest a 5-color palette (Hex codes) for this theme."; break;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `${systemPrompt}\n\nUser Input: ${input}` }] }
    });
    return response.text || "Failed";
}

export const enhancePrompt = async (prompt: string, userApiKey?: string): Promise<string> => {
    const ai = getAiClient(userApiKey);
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Improve this prompt to be more detailed, creative, and optimized for AI generation. Return ONLY the enhanced prompt text.\n\nPrompt: "${prompt}"` }] }
    });
    return response.text?.trim() || prompt;
}

// --- Image Generation & Editing ---

export const generateImage = async (prompt: string, style: ImageStyle, negativePrompt: string, aspectRatio: AspectRatio, imageSize: ImageSize, userApiKey?: string): Promise<string> => {
  const ai = getAiClient(userApiKey);
  let finalPrompt = prompt;
  if (style !== ImageStyle.NONE) finalPrompt += `, style: ${style}`;
  if (negativePrompt) finalPrompt += ` . Avoid: ${negativePrompt}`;

  const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: finalPrompt }] },
      config: { imageConfig: { aspectRatio, imageSize } }
  });

  const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!imgPart?.inlineData?.data) throw new Error("No image generated");
  return imgPart.inlineData.data;
};

export const editImage = async (base64Image: string, prompt: string, userApiKey?: string): Promise<string> => {
  const ai = getAiClient(userApiKey);
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data: base64Image, mimeType: 'image/jpeg' } }, { text: prompt }] },
  });
  const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!imgPart?.inlineData?.data) throw new Error("No edited image");
  return imgPart.inlineData.data;
};

// --- Video Generation (Veo) ---

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16', resolution: '720p' | '1080p', base64Image?: string, userApiKey?: string): Promise<string> => {
  const ai = getAiClient(userApiKey);
  const model = 'veo-3.1-fast-generate-preview';
  
  let operation;
  const config = { numberOfVideos: 1, resolution, aspectRatio };

  if (base64Image) {
    operation = await ai.models.generateVideos({
      model, prompt: prompt || "Animate this", image: { imageBytes: base64Image, mimeType: 'image/jpeg' }, config
    });
  } else {
    operation = await ai.models.generateVideos({ model, prompt, config });
  }

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video failed");
  
  const apiKeyToUse = userApiKey || process.env.API_KEY;
  const videoRes = await fetch(`${videoUri}&key=${apiKeyToUse}`);
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};

// --- Audio Generation (Speech & SFX) ---

export const generateAudio = async (text: string, type: AudioType, voiceName: string = 'Kore', userApiKey?: string): Promise<ArrayBuffer> => {
  const ai = getAiClient(userApiKey);
  
  if (type === AudioType.SOUND_EFFECT) {
      // Logic handled via Text if standard SFX model not present
  }

  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio");
  
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes.buffer;
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore', userApiKey?: string): Promise<ArrayBuffer> => {
    return generateAudio(text, AudioType.SPEECH, voiceName, userApiKey);
}

// --- Audio Transcription ---
export const transcribeAudio = async (base64Audio: string, mimeType: string, userApiKey?: string): Promise<string> => {
    const ai = getAiClient(userApiKey);
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Audio } },
                { text: "Transcribe this audio exactly as spoken. If it's music, describe the instruments and mood." }
            ]
        }
    });
    return response.text || "Transcription failed.";
}

// --- Chat ---

export const sendChatMessage = async (history: any[], message: string, systemInstruction: string, files: any[] = [], userApiKey?: string, creativity: number = 1) => {
    const ai = getAiClient(userApiKey);
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: { systemInstruction, temperature: creativity, thinkingConfig: { thinkingBudget: 2048 } }
    });

    const parts: any[] = files.map(f => ({ inlineData: { mimeType: f.mimeType, data: f.data } }));
    parts.push({ text: message });
    
    const result = await chat.sendMessage({ parts });
    return result.text;
}