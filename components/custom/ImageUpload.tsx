'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface UploadedImage {
  key: string;
  url: string;
  name: string;
  uploading?: boolean;
  error?: string;
}

interface ImageUploadProps {
  value: string[]; // Array of S3 URLs
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function ImageUpload({
  value = [],
  onChange,
  disabled = false,
  maxImages = MAX_IMAGES,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    value.map((url, i) => ({ key: `existing-${i}`, url, name: `Image ${i + 1}` }))
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getS3PublicUrl = (key: string): string => {
    if (key.startsWith('http')) return key;
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || '';
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  };

  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    try {
      const token = localStorage.getItem('doorkey_auth_token');
      if (!token) throw new Error('Authentication required');

      // Get presigned URL from backend
      const response = await axios.post(
        `${API_BASE_URL}/upload/get-url`,
        { fileName: file.name, fileType: file.type },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const data = response.data as any;
      const { uploadUrl, key } = data;

      // Upload directly to S3 using presigned URL
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
      });

      const publicUrl = getS3PublicUrl(key);
      return { key, url: publicUrl, name: file.name };
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(`Failed to upload ${file.name}`);
      return null;
    }
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Validate
      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const validFiles = fileArray.slice(0, remaining).filter((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Only JPEG, PNG, WebP, and AVIF images are allowed`);
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: File too large (max 10MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Add placeholder items
      const placeholders: UploadedImage[] = validFiles.map((f) => ({
        key: `uploading-${Date.now()}-${f.name}`,
        url: URL.createObjectURL(f),
        name: f.name,
        uploading: true,
      }));

      setImages((prev) => [...prev, ...placeholders]);

      // Upload all files in parallel
      const results = await Promise.all(validFiles.map(uploadFile));

      // Replace placeholders with real uploaded images
      setImages((prev) => {
        const updated = prev.filter((img) => !img.uploading);
        const successful = results.filter((r): r is UploadedImage => r !== null);
        const newImages = [...updated, ...successful];
        // Update parent with URLs
        onChange(newImages.map((img) => img.url));
        return newImages;
      });
    },
    [images, maxImages, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleRemove = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onChange(updated.map((img) => img.url));
      return updated;
    });
  };

  const isUploading = images.some((img) => img.uploading);

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragOver ? 'Drop images here' : 'Click or drag images here'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, WebP or AVIF • Max 10MB each • Up to {maxImages} images
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <Card
              key={image.key}
              className="relative group overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Uploading Overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Spinner className="text-white" />
                    </div>
                  )}

                  {/* Error Overlay */}
                  {image.error && (
                    <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  )}

                  {/* Remove Button */}
                  {!image.uploading && !disabled && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    >
                      <X size={14} />
                    </Button>
                  )}

                  {/* Primary Badge */}
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] font-medium bg-primary text-white px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Spinner size={14} />
          Uploading images...
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length} / {maxImages} images uploaded
      </p>
    </div>
  );
}
