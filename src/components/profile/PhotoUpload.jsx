import { useState, useRef } from 'react';
import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Avatar, Button, Spinner } from '../common';
import { cn } from '../../utils/helpers';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '../../config/constants';

export default function PhotoUpload({
  currentPhoto,
  name,
  onUpload,
  onRemove,
  isUploading = false,
  className,
}) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 5MB');
      return;
    }

    onUpload(file);
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative group">
        <Avatar
          src={currentPhoto}
          name={name}
          size="2xl"
          className="ring-4 ring-white dark:ring-gray-800 shadow-lg"
        />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Spinner color="white" />
          </div>
        )}

        {!isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <CameraIcon className="h-8 w-8 text-white" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="mt-4 flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {currentPhoto ? 'Change Photo' : 'Upload Photo'}
        </Button>

        {currentPhoto && onRemove && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            disabled={isUploading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
