"use client";

import { useState, useEffect, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, Check, X, ZoomIn } from "lucide-react";

const EXPORT_SIZE = 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCroppedBlob(imageSrc: string, area: Area): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supporté");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, EXPORT_SIZE, EXPORT_SIZE);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error("Échec de l'export de l'image"))), "image/webp", 0.92);
  });
}

interface ImageCropModalProps {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

export default function ImageCropModal({ file, onCancel, onConfirm }: ImageCropModalProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let revoked = false;
    readFileAsDataUrl(file).then(dataUrl => { if (!revoked) setSrc(dataUrl); });
    return () => { revoked = true; };
  }, [file]);

  const handleCropComplete = useCallback((_: Area, pixels: Area) => setAreaPixels(pixels), []);

  const handleConfirm = async () => {
    if (!src || !areaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(src, areaPixels);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Cadrer la photo</h3>
            <p className="text-white/30 text-xs mt-0.5 truncate max-w-[260px]">{file.name}</p>
          </div>
          <button type="button" onClick={onCancel} className="text-white/40 hover:text-white cursor-pointer flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative w-full h-[360px] bg-black">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              type="range" min={1} max={3} step={0.01} value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-full accent-[#FF9D3D]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={onCancel} disabled={processing}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50">
              Annuler
            </button>
            <button type="button" onClick={handleConfirm} disabled={processing || !areaPixels}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
