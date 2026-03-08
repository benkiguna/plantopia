"use client";

import { useRef } from "react";
import { ActionButton, Card } from "@/components/ui";

interface PhotoCaptureStepProps {
  photoPreviewUrl: string | null;
  isLoading: boolean;
  onPhotoSelect: (file: File) => void;
  onRetake: () => void;
  onContinue: () => void;
}

export function PhotoCaptureStep({
  photoPreviewUrl,
  isLoading,
  onPhotoSelect,
  onRetake,
  onContinue,
}: PhotoCaptureStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelect(file);
    }
  };

  const handleOpenCamera = () => {
    fileInputRef.current?.click();
  };

  if (photoPreviewUrl) {
    return (
      <div className="space-y-4">
        <Card hover={false}>
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreviewUrl}
              alt="Plant photo preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </Card>

        <div className="flex gap-3">
          <ActionButton
            variant="secondary"
            className="flex-1"
            onClick={onRetake}
            disabled={isLoading}
          >
            Retake Photo
          </ActionButton>
          <ActionButton
            variant="primary"
            className="flex-1"
            onClick={onContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Identify Plant"
            )}
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <Card hover={false}>
        <div className="aspect-square bg-forest/5 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 mb-4 bg-green/10 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 text-green"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h3 className="text-lg font-display font-semibold text-forest mb-2">
            Take a Photo
          </h3>
          <p className="text-sm text-forest/60 text-center mb-4">
            Snap a clear photo of your plant for AI identification
          </p>
          <ActionButton variant="primary" onClick={handleOpenCamera}>
            Open Camera
          </ActionButton>
        </div>
      </Card>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-forest/60 uppercase tracking-wide">
          Tips for best results
        </h4>
        <ul className="space-y-2 text-sm text-forest/70">
          <li className="flex items-start gap-2">
            <span className="text-green mt-0.5">&#x2022;</span>
            <span>Include leaves clearly in the frame</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green mt-0.5">&#x2022;</span>
            <span>Use natural lighting when possible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green mt-0.5">&#x2022;</span>
            <span>Avoid blurry or dark images</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
