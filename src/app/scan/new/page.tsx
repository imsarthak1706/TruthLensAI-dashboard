"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { scanService } from "@/services/scanService";

type Modality = "text" | "image" | "audio" | "video";

const SAMPLES = {
  text: "URGENT! Your SBI account will be blocked today. Verify immediately:\nhttp://amazon-account-verify.xyz/login",
  image: "",
  audio: "",
  video: "",
};

const AUDIO_ACCEPT = "audio/mpeg,audio/wav,audio/x-wav,audio/x-m4a,audio/m4a,audio/mp4,audio/ogg,audio/webm,.mp3,.wav,.m4a,.ogg,.webm";
const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv";
const IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

const PIPELINE_STAGES = [
  {
    step: 1,
    name: "Deterministic Detection",
    desc: "Rule matching, signature hashes, domain typosquatting",
  },
  {
    step: 2,
    name: "AI Analysis",
    desc: "Neural intent classification, linguistic urgency parsing",
  },
  {
    step: 3,
    name: "External Intelligence",
    desc: "VirusTotal consensus & multi-vendor threat lookup",
  },
  {
    step: 4,
    name: "Community Intelligence",
    desc: "Decentralized node telemetry & IOC correlation",
  },
  {
    step: 5,
    name: "Risk Calculation",
    desc: "Multi-factor threat scoring & forensic report synthesis",
  },
];

export default function NewScanPage() {
  const router = useRouter();

  // Hidden File Input References
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Active Modality State
  const [modality, setModality] = useState<Modality>("text");
  const [content, setContent] = useState(SAMPLES.text);
  const [platform, setPlatform] = useState("telegram");

  // File Upload States
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Drag State & Loading Status
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [imagePreviewUrl, audioPreviewUrl, videoPreviewUrl]);

  const handleModalityChange = (m: Modality) => {
    setModality(m);
    setErrorMessage(null);
    if (m === "text") {
      setContent(content || SAMPLES.text);
    }
  };

  // Image Upload Handlers
  const handleImageSelect = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const ext = file.name.toLowerCase().split(".").pop();
    if (!validTypes.includes(file.type) && !["png", "jpg", "jpeg", "webp"].includes(ext || "")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, JPEG, or WEBP).");
      return;
    }
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  // Audio Upload Handlers
  const handleAudioSelect = (file: File) => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/x-m4a", "audio/m4a", "audio/mp4", "audio/ogg", "audio/webm"];
    const ext = file.name.toLowerCase().split(".").pop();
    if (!validTypes.some((t) => file.type.startsWith("audio/") || file.type === t) && !["mp3", "wav", "m4a", "ogg", "webm"].includes(ext || "")) {
      setErrorMessage("Please select a valid audio file (MP3, WAV, M4A, OGG, or WEBM).");
      return;
    }
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setSelectedAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  // Video Upload Handlers
  const handleVideoSelect = (file: File) => {
    const validTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska"];
    const ext = file.name.toLowerCase().split(".").pop();
    if (!validTypes.some((t) => file.type.startsWith("video/") || file.type === t) && !["mp4", "mov", "webm", "mkv"].includes(ext || "")) {
      setErrorMessage("Please select a valid video file (MP4, MOV, WEBM, or MKV).");
      return;
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setSelectedVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  // Generic Drop Handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isAnalyzing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (modality === "image") handleImageSelect(file);
      else if (modality === "audio") handleAudioSelect(file);
      else if (modality === "video") handleVideoSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAnalyzing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // File Removal Handlers
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleRemoveAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setSelectedAudioFile(null);
    setAudioPreviewUrl(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const handleRemoveVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setSelectedVideoFile(null);
    setVideoPreviewUrl(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isFormValid = () => {
    if (modality === "text") return content.trim().length > 0;
    if (modality === "image") return selectedImageFile !== null;
    if (modality === "audio") return selectedAudioFile !== null;
    if (modality === "video") return selectedVideoFile !== null;
    return false;
  };

  const handleAnalyze = async () => {
    if (!isFormValid() || isAnalyzing) return;
    setIsAnalyzing(true);
    setActiveStage(0);
    setErrorMessage(null);

    // Realistic pipeline progression timer while the scan executes
    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < PIPELINE_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      let payloadContent = content;
      let targetFile: File | undefined = undefined;

      if (modality === "image" && selectedImageFile) {
        payloadContent = selectedImageFile.name;
        targetFile = selectedImageFile;
      } else if (modality === "audio" && selectedAudioFile) {
        payloadContent = selectedAudioFile.name;
        targetFile = selectedAudioFile;
      } else if (modality === "video" && selectedVideoFile) {
        payloadContent = selectedVideoFile.name;
        targetFile = selectedVideoFile;
      }

      // Calls centralized scanService (dispatches real API client for all 4 modalities)
      const result = await scanService.createScan(payloadContent, modality, platform, targetFile);
      clearInterval(interval);
      setActiveStage(PIPELINE_STAGES.length - 1);

      setTimeout(() => {
        router.push(`/scan/${result.id}`);
      }, 300);
    } catch (err: any) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setErrorMessage(
        err.message || "Failed to analyze content. Please verify your connection to TruthLensAI backend."
      );
    }
  };

  return (
    <div className="space-y-stack-lg max-w-6xl mx-auto pb-12">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2 mb-1 text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(111,221,120,0.6)]" />
          <span className="font-label-caps text-xs uppercase tracking-wider font-semibold">
            Real-Time Threat Detection Engine Active
          </span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">
          Analyze Suspicious Content
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Submit text, URLs, images, audio or video to trigger the full TruthLensAI forensic pipeline.
        </p>
      </header>

      {/* Multimodal Pipeline Visual Progression Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
            TruthLensAI Multimodal Inspection Pipeline
          </span>
          <span className="font-code-sm text-xs text-primary font-bold">5 Stages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = isAnalyzing && activeStage > idx;
            const isCurrent = isAnalyzing && activeStage === idx;

            return (
              <div
                key={stage.name}
                className={`p-2.5 rounded border transition-all ${
                  isCurrent
                    ? "bg-primary/10 border-primary shadow-[0_0_10px_rgba(111,221,120,0.2)]"
                    : isCompleted
                    ? "bg-surface-container border-primary/40 text-on-surface"
                    : "bg-[#0A0C10] border-outline-variant/40 text-on-surface-variant"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-code-sm font-bold flex items-center justify-center ${
                      isCurrent
                        ? "bg-primary text-on-primary"
                        : isCompleted
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {isCompleted ? "✓" : stage.step}
                  </span>
                  <span
                    className={`font-label-caps text-[11px] font-bold uppercase truncate ${
                      isCurrent ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/80 line-clamp-2 leading-tight">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="bg-error/10 border border-error/40 text-error p-4 rounded-lg flex items-start gap-3 animate-in fade-in duration-200">
          <Icon name="error" className="text-xl shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-label-caps text-xs uppercase font-bold">
              Scan Request Notification
            </h4>
            <p className="font-body-sm text-xs text-on-surface mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-on-surface-variant hover:text-on-surface p-1"
          >
            <Icon name="close" className="text-sm" />
          </button>
        </div>
      )}

      {/* Main Grid: Input Zone (8 cols) & Capabilities (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Input Zone (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-[#161B22] border border-outline-variant rounded-xl p-6 flex flex-col relative z-10">
          {/* Mode Selectors */}
          <div className="flex flex-wrap gap-3 mb-6">
            {(
              [
                { id: "text", label: "Text / URL", icon: "description", activeTag: "LIVE BACKEND" },
                { id: "image", label: "Image", icon: "image", activeTag: "LIVE BACKEND" },
                { id: "audio", label: "Audio", icon: "mic", activeTag: "LIVE BACKEND" },
                { id: "video", label: "Video", icon: "videocam", activeTag: "LIVE BACKEND" },
              ] as const
            ).map((item) => {
              const isActive = modality === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleModalityChange(item.id)}
                  disabled={isAnalyzing}
                  className={`flex-1 min-w-[110px] px-4 py-3 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-primary/10 border-2 border-primary text-primary font-bold shadow-[0_0_12px_rgba(111,221,120,0.15)]"
                      : "bg-[#1E2024] border border-[#30363D] text-on-surface-variant hover:border-primary/50 hover:text-on-surface"
                  }`}
                >
                  <Icon name={item.icon} fill={isActive} className="text-2xl" />
                  <span className="font-label-caps text-xs uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span
                    className={`text-[9px] font-code-sm uppercase px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 font-semibold`}
                  >
                    {item.activeTag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Platform & Quick Presets Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            {modality === "text" ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                  Quick Test Payload:
                </span>
                <button
                  onClick={() =>
                    setContent(
                      "URGENT! Your SBI account will be blocked today. Verify immediately:\nhttp://amazon-account-verify.xyz/login"
                    )
                  }
                  className="text-[11px] font-code-sm text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded hover:bg-primary/20 transition-colors font-semibold"
                >
                  SBI Bank Phishing URL (Verified)
                </button>
                <button
                  onClick={() =>
                    setContent(
                      "Aapka electricity connection aaj raat 9:30 baje disconnect ho jayega. Turant diye gaye link par click karein aur pending bill pay karein: http://bijli-bill-update-quick.in"
                    )
                  }
                  className="text-[11px] font-code-sm text-tertiary-container bg-tertiary-container/10 border border-tertiary-container/30 px-2.5 py-1 rounded hover:bg-tertiary-container/20 transition-colors"
                >
                  Hinglish Bill Fraud
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[10px] text-primary uppercase font-bold">
                  Target Modality:
                </span>
                <span className="text-[11px] font-code-sm text-on-surface-variant uppercase">
                  {modality} Forensic Engine (Render Hosted)
                </span>
              </div>
            )}

            {/* Platform Selector */}
            <div className="flex items-center gap-1.5 bg-[#0A0C10] border border-[#30363D] rounded px-2 py-1">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                Platform:
              </span>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={isAnalyzing}
                className="bg-transparent text-xs font-code-sm text-primary outline-none cursor-pointer"
              >
                <option value="telegram" className="bg-[#161B22] text-on-surface">
                  Telegram
                </option>
                <option value="whatsapp" className="bg-[#161B22] text-on-surface">
                  WhatsApp
                </option>
                <option value="sms" className="bg-[#161B22] text-on-surface">
                  SMS
                </option>
                <option value="email" className="bg-[#161B22] text-on-surface">
                  Email
                </option>
              </select>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            disabled={isAnalyzing}
          />
          <input
            ref={audioInputRef}
            type="file"
            accept={AUDIO_ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleAudioSelect(e.target.files[0])}
            disabled={isAnalyzing}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept={VIDEO_ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
            disabled={isAnalyzing}
          />

          {/* Dropzone & Input Area */}
          <div className="flex-1 flex flex-col">
            {/* IMAGE MODALITY */}
            {modality === "image" && (
              <div
                onClick={() => !isAnalyzing && imageInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 flex-1 relative min-h-[250px] cyber-grid transition-all cursor-pointer flex flex-col items-center justify-center select-none ${
                  isDragging
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(111,221,120,0.2)]"
                    : selectedImageFile
                    ? "border-primary/60 bg-[#0A0C10]"
                    : "border-outline-variant hover:border-primary/50 bg-[#0A0C10]"
                }`}
              >
                {selectedImageFile && imagePreviewUrl ? (
                  <div className="w-full flex flex-col sm:flex-row items-center gap-6 p-2">
                    <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-outline-variant bg-[#161B22] shrink-0 shadow-lg flex items-center justify-center group">
                      <img
                        src={imagePreviewUrl}
                        alt="Selected Preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="font-label-caps text-[10px] text-white uppercase bg-black/70 px-2 py-1 rounded">
                          Change
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Badge variant="safe" glow={false}>
                          Image Loaded
                        </Badge>
                        <span className="font-code-sm text-xs text-on-surface-variant">
                          {formatFileSize(selectedImageFile.size)}
                        </span>
                      </div>

                      <h4 className="font-headline-sm text-base font-semibold text-on-surface break-all line-clamp-1">
                        {selectedImageFile.name}
                      </h4>
                      <p className="font-code-sm text-xs text-on-surface-variant">
                        Format: {selectedImageFile.type || "image/png"}
                      </p>

                      <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            imageInputRef.current?.click();
                          }}
                          className="font-label-caps text-xs text-primary hover:text-primary-fixed uppercase font-bold flex items-center gap-1 transition-colors"
                        >
                          <Icon name="swap_horiz" className="text-sm" /> Replace Image
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="font-label-caps text-xs text-error hover:text-error/80 uppercase font-bold flex items-center gap-1 transition-colors"
                        >
                          <Icon name="delete" className="text-sm" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-4 pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant/60 shadow-[0_0_15px_rgba(111,221,120,0.1)]">
                      <Icon name="image" className="text-3xl text-primary" />
                    </div>
                    <div>
                      <span className="font-headline-sm text-sm font-semibold text-on-surface block">
                        Drop suspicious screenshot or document here
                      </span>
                      <span className="font-label-caps text-xs text-primary uppercase font-bold mt-1 inline-block">
                        OR CLICK TO BROWSE FILES
                      </span>
                    </div>
                    <span className="font-code-sm text-[11px] text-on-surface-variant/70 block">
                      Supports PNG, JPG, JPEG, WEBP (analyzed via OCR &amp; ELA engines)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* AUDIO MODALITY */}
            {modality === "audio" && (
              <div
                onClick={() => !isAnalyzing && audioInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 flex-1 relative min-h-[250px] cyber-grid transition-all cursor-pointer flex flex-col items-center justify-center select-none ${
                  isDragging
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(111,221,120,0.2)]"
                    : selectedAudioFile
                    ? "border-primary/60 bg-[#0A0C10]"
                    : "border-outline-variant hover:border-primary/50 bg-[#0A0C10]"
                }`}
              >
                {selectedAudioFile && audioPreviewUrl ? (
                  <div className="w-full flex flex-col sm:flex-row items-center gap-6 p-2">
                    <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-outline-variant bg-[#161B22] shrink-0 shadow-lg flex flex-col items-center justify-center p-3 text-center">
                      <Icon name="graphic_eq" className="text-4xl text-primary mb-1 animate-pulse" />
                      <span className="font-code-sm text-[10px] text-on-surface-variant truncate max-w-full">
                        AUDIO STREAM
                      </span>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Badge variant="safe" glow={false}>
                          Audio Ready
                        </Badge>
                        <span className="font-code-sm text-xs text-on-surface-variant">
                          {formatFileSize(selectedAudioFile.size)}
                        </span>
                      </div>

                      <h4 className="font-headline-sm text-base font-semibold text-on-surface break-all line-clamp-1">
                        {selectedAudioFile.name}
                      </h4>
                      <p className="font-code-sm text-xs text-on-surface-variant">
                        Format: {selectedAudioFile.type || "audio/mpeg"}
                      </p>

                      {/* Built-in Audio Playback Component */}
                      <div className="pt-1 pb-1">
                        <audio
                          controls
                          src={audioPreviewUrl}
                          className="w-full max-w-md h-9 outline-none bg-surface-container rounded"
                        />
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            audioInputRef.current?.click();
                          }}
                          className="font-label-caps text-xs text-primary hover:text-primary-fixed uppercase font-bold flex items-center gap-1 transition-colors"
                        >
                          <Icon name="swap_horiz" className="text-sm" /> Replace Audio
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveAudio}
                          className="font-label-caps text-xs text-error hover:text-error/80 uppercase font-bold flex items-center gap-1 transition-colors"
                        >
                          <Icon name="delete" className="text-sm" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-4 pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant/60 shadow-[0_0_15px_rgba(111,221,120,0.1)]">
                      <Icon name="mic" className="text-3xl text-primary" />
                    </div>
                    <div>
                      <span className="font-headline-sm text-sm font-semibold text-on-surface block">
                        Drop suspicious voice clip or call recording here
                      </span>
                      <span className="font-label-caps text-xs text-primary uppercase font-bold mt-1 inline-block">
                        OR CLICK TO BROWSE AUDIO
                      </span>
                    </div>
                    <span className="font-code-sm text-[11px] text-on-surface-variant/70 block">
                      Supports MP3, WAV, M4A, OGG, WEBM (transcribed via Whisper)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* VIDEO MODALITY */}
            {modality === "video" && (
              <div
                onClick={() => !isAnalyzing && videoInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 flex-1 relative min-h-[250px] cyber-grid transition-all cursor-pointer flex flex-col items-center justify-center select-none ${
                  isDragging
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(111,221,120,0.2)]"
                    : selectedVideoFile
                    ? "border-primary/60 bg-[#0A0C10]"
                    : "border-outline-variant hover:border-primary/50 bg-[#0A0C10]"
                }`}
              >
                {selectedVideoFile && videoPreviewUrl ? (
                  <div className="w-full flex flex-col sm:flex-row items-center gap-6 p-2">
                    <div className="relative w-44 h-36 rounded-lg overflow-hidden border border-outline-variant bg-[#161B22] shrink-0 shadow-lg flex items-center justify-center">
                      <video
                        controls
                        src={videoPreviewUrl}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Badge variant="safe" glow={false}>
                          Video Ready
                        </Badge>
                        <span className="font-code-sm text-xs text-on-surface-variant">
                          {formatFileSize(selectedVideoFile.size)}
                        </span>
                      </div>

                      <h4 className="font-headline-sm text-base font-semibold text-on-surface break-all line-clamp-1">
                        {selectedVideoFile.name}
                      </h4>
                      <p className="font-code-sm text-xs text-on-surface-variant">
                        Format: {selectedVideoFile.type || "video/mp4"}
                      </p>

                      <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            videoInputRef.current?.click();
                          }}
                          className="font-label-caps text-xs text-primary hover:text-primary-fixed uppercase font-bold flex items-center gap-1 transition-colors"
                        >
                          <Icon name="swap_horiz" className="text-sm" /> Replace Video
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="font-label-caps text-xs text-error hover:text-error/80 uppercase font-bold flex items-center gap-1 transition-colors"
                        >
                          <Icon name="delete" className="text-sm" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-4 pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant/60 shadow-[0_0_15px_rgba(111,221,120,0.1)]">
                      <Icon name="videocam" className="text-3xl text-primary" />
                    </div>
                    <div>
                      <span className="font-headline-sm text-sm font-semibold text-on-surface block">
                        Drop suspicious video clip or deepfake here
                      </span>
                      <span className="font-label-caps text-xs text-primary uppercase font-bold mt-1 inline-block">
                        OR CLICK TO BROWSE VIDEO
                      </span>
                    </div>
                    <span className="font-code-sm text-[11px] text-on-surface-variant/70 block">
                      Supports MP4, MOV, WEBM, MKV (frame-by-frame forensics &amp; audio extraction)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TEXT MODALITY */}
            {modality === "text" && (
              <div className="border-2 border-dashed border-outline-variant hover:border-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-lg bg-[#0A0C10] p-1 flex-1 relative min-h-[250px] cyber-grid transition-all">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full h-full bg-transparent resize-none outline-none text-on-surface p-4 font-code-sm text-body-sm placeholder:text-on-surface-variant/40"
                  placeholder="Paste suspicious text, phishing SMS, Hinglish/English email, or URL here..."
                />

                {!content && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-40">
                    <Icon name="upload_file" className="text-5xl text-primary mb-2" />
                    <span className="font-headline-sm text-sm font-semibold">
                      Drop suspicious content here
                    </span>
                    <span className="font-label-caps text-xs text-on-surface-variant mt-1">
                      OR CLICK TO BROWSE FILES
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Pipeline Status */}
          {isAnalyzing && (
            <div className="mt-4 p-4 bg-[#0A0C10] border border-primary/40 rounded-lg space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-xs text-primary flex items-center gap-2 font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  PIPELINE ACTIVE: {PIPELINE_STAGES[activeStage].name.toUpperCase()}
                </span>
                <span className="font-code-sm text-xs text-on-surface-variant">
                  Stage {activeStage + 1} of 5
                </span>
              </div>
              <p className="font-code-sm text-xs text-on-surface">
                {PIPELINE_STAGES[activeStage].desc}
              </p>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 shadow-[0_0_8px_rgba(111,221,120,0.8)]"
                  style={{ width: `${((activeStage + 1) / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-6 flex justify-end items-center">
            <Button
              variant="primary"
              size="lg"
              icon="play_arrow"
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={!isFormValid()}
            >
              Analyze with TruthLensAI
            </Button>
          </div>
        </div>

        {/* Scan Capabilities Panel (Spans 4 cols) */}
        <div className="lg:col-span-4 space-y-gutter">
          <div className="bg-[#161B22] border border-outline-variant rounded-xl p-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2 font-semibold">
              <Icon name="info" className="text-primary text-xl" />
              Scan Capabilities
            </h3>
            <ul className="space-y-4 font-body-sm text-on-surface-variant">
              <li className="flex gap-3">
                <Icon name="check_circle" className="text-primary text-lg shrink-0 mt-0.5" />
                <span>
                  <strong className="text-on-surface">Text:</strong> Detects phishing URLs, urgency-inducing rhetoric, and synthetic generated text in multiple languages.
                </span>
              </li>
              <li className="flex gap-3">
                <Icon name="check_circle" className="text-primary text-lg shrink-0 mt-0.5" />
                <span>
                  <strong className="text-on-surface">Image:</strong> Deepfake detection, OCR text extraction, EXIF metadata inspection, and Error Level Analysis (ELA).
                </span>
              </li>
              <li className="flex gap-3">
                <Icon name="check_circle" className="text-primary text-lg shrink-0 mt-0.5" />
                <span>
                  <strong className="text-on-surface">Audio:</strong> Voice cloning detection, Whisper speech-to-text, and acoustic noise analysis.
                </span>
              </li>
              <li className="flex gap-3">
                <Icon name="check_circle" className="text-primary text-lg shrink-0 mt-0.5" />
                <span>
                  <strong className="text-on-surface">Video:</strong> Frame-by-frame artifact analysis, on-screen text OCR, audio track extraction, and lip-sync verification.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-[#161B22] border border-outline-variant/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Icon name="shield_lock" className="text-lg" />
              <span className="font-label-caps text-xs uppercase font-bold">Privacy Guarantee</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              All scans are analyzed in memory. Raw payloads are automatically purged after forensic telemetry indexing according to your data retention policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
