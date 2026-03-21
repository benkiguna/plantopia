"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "../ui";
import { StepIndicator } from "./StepIndicator";
import { PhotoCaptureStep } from "./PhotoCaptureStep";
import { SpeciesSelectStep, ManualSpeciesSearch } from "./SpeciesSelectStep";
import { LightSetupStep } from "./LightSetupStep";
import { NameConfirmStep } from "./NameConfirmStep";
import { compressImage, revokePreviewUrl, uploadPlantPhoto } from "@/lib/utils";
import { MOCK_USER_ID } from "@/lib/supabase";
import type {
  PlantFlowState,
  SpeciesMatch,
  LightOption,
  LightAnalysisData,
} from "./types";
import type { PlantIdentificationResult, LightAnalysisResult } from "@/lib/ai";
import { compressImage as compressLightImage } from "@/lib/utils";

function mapLightLevelToOption(lightLevel: string): LightOption {
  if (lightLevel.includes("direct")) return "bright_direct";
  if (lightLevel.includes("bright")) return "bright_indirect";
  if (lightLevel.includes("medium")) return "medium";
  return "low";
}

const initialState: PlantFlowState = {
  step: 1,
  photoBase64: null,
  photoBlob: null,
  photoPreviewUrl: null,
  photoUrl: null,
  selectedSpecies: null,
  lightSetup: null,
  lightPhotoBase64: null,
  lightPhotoBlob: null,
  lightAnalysis: null,
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
  const [isAnalyzingLight, setIsAnalyzingLight] = useState(false);

  useEffect(() => {
    return () => {
      if (state.photoPreviewUrl) revokePreviewUrl(state.photoPreviewUrl);
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
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to process image.",
      }));
    }
  }, []);

  const handleRetakePhoto = useCallback(() => {
    if (state.photoPreviewUrl) revokePreviewUrl(state.photoPreviewUrl);
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
    setIdentificationResult(null);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch("/api/analyze/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: state.photoBase64 }),
      });
      if (!response.ok) throw new Error("Failed to identify plant");
      const result: PlantIdentificationResult = await response.json();
      setIdentificationResult(result);
      setState((prev) => ({ ...prev, isLoading: false, step: 2 }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Identification failed.",
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

  const handleSelectLight = useCallback((light: string) => {
    setState((prev) => ({ ...prev, lightSetup: light as LightOption }));
  }, []);

  const handleAnalyzeLight = useCallback(async (file: File) => {
    setIsAnalyzingLight(true);
    setState((prev) => ({ ...prev, error: null }));
    try {
      const compressed = await compressLightImage(file);
      const response = await fetch("/api/analyze/light", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: compressed.base64 }),
      });
      if (!response.ok) throw new Error("Light analysis failed");
      const result: LightAnalysisResult = await response.json();
      const lightSetup = mapLightLevelToOption(result.light_level);
      setState((prev) => ({
        ...prev,
        lightPhotoBase64: compressed.base64,
        lightPhotoBlob: compressed.blob,
        lightAnalysis: result as LightAnalysisData,
        lightSetup,
      }));
    } catch {
      setState((prev) => ({ ...prev, error: "Light analysis failed." }));
    } finally {
      setIsAnalyzingLight(false);
    }
  }, []);

  const handleClearLightAnalysis = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lightPhotoBase64: null,
      lightPhotoBlob: null,
      lightAnalysis: null,
      lightSetup: null,
    }));
  }, []);

  const handleLightContinue = useCallback(
    () => setState((prev) => ({ ...prev, step: 4 })),
    [],
  );

  const handleConfirmPlant = useCallback(async () => {
    if (
      !state.photoBlob ||
      !state.selectedSpecies ||
      !state.lightSetup ||
      !state.nickname.trim()
    )
      return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const photoUrl = await uploadPlantPhoto(state.photoBlob, MOCK_USER_ID);
      let lightPhotoUrl: string | null = null;
      if (state.lightPhotoBlob)
        lightPhotoUrl = await uploadPlantPhoto(
          state.lightPhotoBlob,
          MOCK_USER_ID,
        );

      const response = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesKey: state.selectedSpecies.speciesKey,
          speciesName: state.selectedSpecies.speciesName,
          careInfo: state.selectedSpecies.careInfo,
          nickname: state.nickname.trim(),
          lightSetup: state.lightSetup,
          photoUrl,
          photoBase64: state.photoBase64,
          lightPhotoUrl,
          lightAnalysis: state.lightAnalysis,
        }),
      });
      if (!response.ok) throw new Error("Failed to create plant");
      router.push("/?added=true");
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Creation failed.",
      }));
    }
  }, [state, router]);

  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(1, prev.step - 1) as 1 | 2 | 3 | 4,
    }));
    setShowManualSearch(false);
  }, []);

  const goToStep = useCallback(
    (step: 1 | 2 | 3 | 4) => setState((prev) => ({ ...prev, step })),
    [],
  );

  return (
    /* h-screen + flex-col ensures the content occupies the exact viewport height */
    <div className="relative z-10 flex flex-col items-center w-full h-screen overflow-hidden bg-transparent">
      {/* 1. Header (Fixed Height) */}
      <TopBar title="Add Plant" showBack={true} />

      {/* 2. Stepper Area (Calculated Offset) */}
      <div className="w-full max-w-lg mt-20 px-6">
        <StepIndicator currentStep={state.step} />
      </div>

      {/* 3. Main Content (The Elastic Area) */}
      <main className="flex-1 w-full flex flex-col justify-start overflow-hidden min-h-0">
        {state.error && (
          <div className="mx-6 mb-2 p-3 bg-coral/10 border border-coral/20 rounded-xl text-coral text-[10px] font-bold uppercase tracking-widest text-center shrink-0">
            {state.error}
          </div>
        )}

        <div className="flex-1 flex flex-col w-full min-h-0">
          {state.step === 1 && (
            <PhotoCaptureStep
              photoPreviewUrl={state.photoPreviewUrl}
              isLoading={state.isLoading}
              isIdentified={identificationResult !== null}
              onPhotoSelect={handlePhotoSelect}
              onRetake={handleRetakePhoto}
              onIdentify={handleIdentifyPlant}
              onContinue={() => goToStep(2)}
              onManualSearch={() => { goToStep(2); setShowManualSearch(true); }}
            />
          )}

          {state.step === 2 && !showManualSearch && (
            <SpeciesSelectStep
              matches={identificationResult?.matches || []}
              needsClarification={
                identificationResult?.needsClarification || false
              }
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
              lightAnalysis={state.lightAnalysis}
              isAnalyzing={isAnalyzingLight}
              onSelectLight={handleSelectLight}
              onAnalyzeLight={handleAnalyzeLight}
              onClearAnalysis={handleClearLightAnalysis}
              onContinue={handleLightContinue}
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
              onNicknameChange={(name) =>
                setState((prev) => ({ ...prev, nickname: name }))
              }
              onConfirm={handleConfirmPlant}
              onBack={goBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}
