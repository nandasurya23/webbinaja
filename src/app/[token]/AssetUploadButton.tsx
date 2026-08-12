'use client';

import { useRef, useState } from 'react';
import { UploadSimple, Spinner, CheckCircle, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { uploadAssetAction } from './actions';

type UploadKind = 'logo' | 'hero' | 'ambiance' | 'gallery' | 'catalog';

export default function AssetUploadButton({
  token,
  slug,
  kind,
  baseNameHint,
  onUploaded,
}: {
  token: string;
  slug: string;
  kind: UploadKind;
  baseNameHint: string;
  onUploaded: (filename: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setState('uploading');
    setError(null);

    const formData = new FormData();
    formData.set('slug', slug);
    formData.set('kind', kind);
    formData.set('baseName', baseNameHint);
    formData.set('file', file);

    const res = await uploadAssetAction(token, formData);
    if (res.ok && res.filename) {
      setState('done');
      onUploaded(res.filename);
    } else {
      setState('error');
      setError(res.error ?? 'Upload gagal.');
    }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={!slug || state === 'uploading'}
        onClick={() => inputRef.current?.click()}
        title={!slug ? 'Isi slug dulu' : 'Unggah dari komputer — otomatis dikonversi ke WebP & diunggah ke R2'}
        className="inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {state === 'uploading' ? (
          <Spinner size={13} className="animate-spin" />
        ) : state === 'done' ? (
          <CheckCircle size={13} weight="fill" className="text-blue-600 dark:text-blue-400" />
        ) : (
          <UploadSimple size={13} />
        )}
        {state === 'uploading' ? 'Mengunggah...' : state === 'done' ? 'Terunggah' : 'Unggah'}
      </button>
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <WarningCircle size={13} weight="fill" />
          {error}
        </span>
      )}
    </div>
  );
}
