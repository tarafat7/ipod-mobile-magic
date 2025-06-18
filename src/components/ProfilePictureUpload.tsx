
import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Camera, X } from 'lucide-react';

interface ProfilePictureUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage?: string | null;
  disabled?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  onImageSelect,
  currentImage,
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>Profile Picture (Optional)</Label>
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16">
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt="Profile preview" />
          ) : (
            <AvatarFallback>
              <Camera className="w-6 h-6 text-gray-400" />
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={disabled}
          >
            {previewUrl ? 'Change' : 'Upload'}
          </Button>
          
          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <p className="text-xs text-gray-500">
        Supported formats: JPEG, PNG, WebP, GIF. Max size: 5MB
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
