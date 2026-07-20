"use client";

import { useCallback, useState } from "react";
import { UploadCloud, ImageIcon } from "lucide-react";

interface Props {
  onFileSelected: (file: File) => void;
  accept?: string;
  hint?: string;
}

export default function UploadBox({
  onFileSelected,
  accept = "image/*",
  hint = "PNG or JPG, up to 8MB",
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      setPreview(URL.createObjectURL(file));
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed p-10 text-center transition ${
        dragActive
          ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20"
          : "border-slate-300 dark:border-white/20 hover:border-brand-300"
      }`}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Preview"
          className="max-h-56 rounded-lg object-contain shadow-md"
        />
      ) : (
        <>
          <div className="rounded-full bg-brand-100 dark:bg-brand-900/40 p-4">
            <UploadCloud className="text-brand-500" size={28} />
          </div>
          <p className="font-medium text-slate-600 dark:text-slate-300">
            Click to upload or drag & drop
          </p>
          <p className="flex items-center gap-1 text-xs text-slate-400">
            <ImageIcon size={12} /> {hint}
          </p>
        </>
      )}
    </label>
  );
}
