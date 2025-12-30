import React from 'react';
import { Upload, Image as ImageIcon, Video, Music } from 'lucide-react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  accept?: string;
  label?: string;
}

const UploadArea: React.FC<UploadAreaProps> = ({ 
  onFileSelect, 
  isLoading, 
  accept = "image/*,video/mp4,video/quicktime,audio/*",
  label = "برای آپلود کلیک کنید یا فایل را اینجا رها کنید"
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label 
        className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-2xl cursor-pointer 
          transition-all duration-300
          ${isLoading 
            ? 'bg-slate-800 border-slate-600 opacity-50 cursor-not-allowed' 
            : 'bg-slate-800 border-indigo-500 hover:bg-slate-700 hover:border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <div className="flex gap-4 mb-4 text-indigo-400">
             <ImageIcon size={28} />
             <Video size={28} />
             <Music size={28} />
          </div>
          <p className="mb-2 text-lg font-semibold text-slate-200">
            {label}
          </p>
          <p className="text-sm text-slate-400">
            عکس، ویدیو، یا صدا
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept={accept}
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};

export default UploadArea;