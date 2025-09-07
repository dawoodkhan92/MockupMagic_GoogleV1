import React, { useState } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
  uploadedImageName: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImageName }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        onImageUpload({ base64, mimeType: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-zinc-300 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors ${isDragging ? 'border-zinc-500 bg-zinc-100' : ''}`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            {uploadedImageName ? (
                <>
                    <p className="mb-2 text-sm font-semibold text-zinc-700">Image Selected:</p>
                    <p className="text-xs text-zinc-500">{uploadedImageName}</p>
                    <p className="text-xs text-zinc-400 mt-2">Drag another or click to replace</p>
                </>
            ) : (
                <>
                    <UploadIcon />
                    <p className="mb-2 text-sm text-zinc-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-zinc-500">PNG, JPG, or WEBP</p>
                </>
            )}
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
      </label>
    </div>
  );
};