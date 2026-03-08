"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { compressImage, revokePreviewUrl, uploadPlantPhoto } from "@/lib/utils";
import { MOCK_USER_ID } from "@/lib/supabase";
import { StepIndicator } from "./StepIndicator";
import { PhotoCaptureStep } from "./PhotoCaptureStep";
import { SpeciesSelectStep, ManualSpeciesSearch } from "./SpeciesSelectStep";
import { LightSetupStep } from "./LightSetupStep";
import { NameConfirmStep } from "./NameConfirmStep";
import type { PlantFlowState, SpeciesMatch, LightOption } from "./types";
import type { PlantIdentificationResult } from "@/lib/ai";

const initialState: PlantFlowState = {
  step: 1,
  photoBase64: null,
  photoBlob: null,
  photoPreviewUrl: null,
  photoUrl: null,
  selectedSpecies: null,
  lightSetup: null,
  nickname: "",
  isLoading: false,
  error: null,
};

export function AddPlantFlow() {
  const router = useRouter();
  const [state, setState] = useState<PlantFlowState>(initialState);
  const [identificationResult, setIdentificationResult] =
    useState<PlantIdentificationResult | null>(null);
  const [showManualSearch, setShowManualSearch] = useState(false);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (state.photoPreviewUrl) {
        revokePreviewUrl(state.photoPreviewUrl);
      }
    };
  }, [state.photoPreviewUrl]);

  const handlePhotoSelect = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const compressed = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressed.blob);

      setState((prev) => ({
        ...prev,
        photoBase64: compressed.base64,
        photoBlob: compressed.blob,
        photoPreviewUrl: previewUrl,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error compressing image:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to process image. Please try again.",
      }));
    }
  }, []);

  const handleRetakePhoto = useCallback(() => {
    if (state.photoPreviewUrl) {
      revokePreviewUrl(state.photoPreviewUrl);
    }
    setState((prev) => ({
      ...prev,
      photoBase64: null,
      photoBlob: null,
      photoPreviewUrl: null,
      error: null,
    }));
    setIdentificationResult(null);
  }, [state.photoPreviewUrl]);

  const handleIdentifyPlant = useCallback(async () => {
    if (!state.photoBase64) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/analyze/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: state.photoBase64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to identify plant");
      }

      const result: PlantIdentificationResult = await response.json();
      setIdentificationResult(result);

      setState((prev) => ({
        ...prev,
        step: 2,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error identifying plant:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to identify plant. Please try again.",
      }));
    }
  }, [state.photoBase64]);

  const handleSelectSpecies = useCallback((species: SpeciesMatch) => {
    setState((prev) => ({
      ...prev,
      selectedSpecies: species,
      nickname: species.speciesName,
    }));
    setShowManualSearch(false);
  }, []);

  const handleSelectLight = useCallback((light: LightOption) => {
    setState((prev) => ({
      ...prev,
      lightSetup: light,
      step: 4,
    }));
  }, []);

  const handleConfirmPlant = useCallback(async () => {
    if (!state.photoBlob || !state.selectedSpecies || !state.lightSetup || !state.nickname.trim()) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Upload photo to Supabase Storage
      const photoUrl = await uploadPlantPhoto(state.photoBlob, MOCK_USER_ID);

      // Create plant via API
      const response = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesKey: state.selectedSpecies.speciesKey,
          nickname: state.nickname.trim(),
          lightSetup: state.lightSetup,
          photoUrl,
          initialHealthScore: 75,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create plant");
      }

      // Navigate to home with success
      router.push("/?added=true");
    } catch (error) {
      console.error("Error creating plant:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to add plant. Please try again.",
      }));
    }
  }, [state.photoBlob, state.selectedSpecies, state.lightSetup, state.nickname, router]);

  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(1, prev.step - 1) as 1 | 2 | 3 | 4,
    }));
    setShowManualSearch(false);
  }, []);

  const goToStep = useCallback((step: 1 | 2 | 3 | 4) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  return (
    <div className="space-y-4">
      <StepIndicator currentStep={state.step} />

      {state.error && (
        <div className="p-3 bg-coral/10 border border-coral/20 rounded-xl text-coral text-sm">
          {state.error}
        </div>
      )}

      <div className="transition-opacity duration-200">
        {state.step === 1 && (
          <PhotoCaptureStep
            photoPreviewUrl={state.photoPreviewUrl}
            isLoading={state.isLoading}
            onPhotoSelect={handlePhotoSelect}
            onRetake={handleRetakePhoto}
            onContinue={handleIdentifyPlant}
          />
        )}

        {state.step === 2 && !showManualSearch && (
          <SpeciesSelectStep
            matches={identificationResult?.matches || []}
            needsClarification={identificationResult?.needsClarification || false}
            clarificationMessage={identificationResult?.clarificationMessage}
            selectedSpecies={state.selectedSpecies}
            isLoading={state.isLoading}
            onSelectSpecies={handleSelectSpecies}
            onManualSearch={() => setShowManualSearch(true)}
            onContinue={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        )}

        {state.step === 2 && showManualSearch && (
          <ManualSpeciesSearch
            onSelect={(species) => {
              handleSelectSpecies(species);
              goToStep(3);
            }}
            onBack={() => setShowManualSearch(false)}
          />
        )}

        {state.step === 3 && (
          <LightSetupStep
            selectedLight={state.lightSetup}
            onSelectLight={handleSelectLight}
            onBack={goBack}
          />
        )}

        {state.step === 4 && (
          <NameConfirmStep
            photoPreviewUrl={state.photoPreviewUrl}
            selectedSpecies={state.selectedSpecies}
            lightSetup={state.lightSetup}
            nickname={state.nickname}
            isLoading={state.isLoading}
            onNicknameChange={(name) => setState((prev) => ({ ...prev, nickname: name }))}
            onConfirm={handleConfirmPlant}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}
