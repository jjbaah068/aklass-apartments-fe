/**
 * One ID photo upload box: tap to choose (or drag a file onto it on a computer),
 * shows a preview, and lets the guest replace or remove the file.
 */
import { useEffect, useRef, useState, type DragEvent } from "react";
import { ID_RULES, checkIdFile } from "../lib/booking";

type Props = {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

export default function IdFileInput({ id, label, file, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Make a temporary preview link for images (and clean it up afterwards)
  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick(f: File | undefined) {
    if (!f) return;
    const problem = checkIdFile(f);
    setLocalError(problem);
    if (!problem) onChange(f);
    if (inputRef.current) inputRef.current.value = ""; // allow choosing the same file again
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  }

  const message = localError ?? error;
  const errId = `${id}-err`;

  return (
    <div className="field-group">
      <span className="field-label" id={`${id}-label`}>{label}</span>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ID_RULES.acceptAttr}
        className="sr-only"
        aria-labelledby={`${id}-label`}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errId : undefined}
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {file ? (
        <div className="flex items-center gap-4 rounded-card border border-line bg-white p-3">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-control bg-stone-100">
            {preview ? (
              <img src={preview} alt={`Preview of ${label.toLowerCase()}`} className="size-full object-cover" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-navy-700" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" /></svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-small font-semibold text-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
              Added
            </p>
            <p className="truncate text-[13px] text-ink-subtle">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>
            <div className="mt-1 flex gap-4">
              <button type="button" className="min-h-11 text-small font-semibold text-navy-700 underline underline-offset-4" onClick={() => inputRef.current?.click()}>
                Replace<span className="sr-only"> {label.toLowerCase()}</span>
              </button>
              <button type="button" className="min-h-11 text-small font-semibold text-ink-subtle underline underline-offset-4" onClick={() => { onChange(null); setLocalError(null); }}>
                Remove<span className="sr-only"> {label.toLowerCase()}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-7 text-center transition-colors ${
            message ? "border-error bg-error/5" : dragging ? "border-navy-700 bg-navy-50" : "border-line bg-stone-50 hover:border-navy-300 hover:bg-white"
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-navy-700" aria-hidden="true"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M12 9v6M9 12h6" /></svg>
          <span className="font-semibold text-navy-900">Take a photo or choose a file</span>
          <span className="text-[13px] text-ink-subtle">JPG, PNG or PDF · up to 10 MB</span>
        </button>
      )}

      {message && (
        <p id={errId} className="field-error">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" /></svg>
          {message}
        </p>
      )}
    </div>
  );
}
