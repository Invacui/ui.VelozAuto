import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Link2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaItem {
  id: string;
  file?: File;
  url: string; // preview (object URL) or remote url
  tag?: string;
  /** Photo already saved on the server (tag can't be changed after upload). */
  existing?: boolean;
}

interface MediaUploadProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  max?: number;
  tags?: string[];
  className?: string;
  label?: string;
}

/** Multi-image picker with live previews and optional per-image tags. */
export function MediaUpload({
  items,
  onChange,
  max = 8,
  tags,
  className,
  label = 'Photos',
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const incoming = Array.from(files).filter((f) => f.type.startsWith('image/'));
      const room = max - items.length;
      if (incoming.length > room) setError(`You can add up to ${max} images.`);
      else setError('');
      const next: MediaItem[] = incoming.slice(0, Math.max(room, 0)).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        url: URL.createObjectURL(file),
      }));
      onChange([...items, ...next]);
    },
    [items, max, onChange],
  );

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const addUrl = () => {
    const url = urlValue.trim();
    if (!url) return;
    if (items.length >= max) {
      setError(`You can add up to ${max} images.`);
      return;
    }
    if (!/^https?:\/\/.+/i.test(url)) {
      setError('Enter a valid image URL (must start with http:// or https://).');
      return;
    }
    setError('');
    onChange([
      ...items,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, url, existing: false },
    ]);
    setUrlValue('');
    setShowUrl(false);
  };

  const setTag = (id: string, tag: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, tag } : i)));

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <div key={item.id} className="group relative h-24 w-24 overflow-hidden rounded-lg border">
            <img src={item.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => remove(item.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
            {tags && tags.length > 0 && !item.existing && (
              <select
                value={item.tag || ''}
                onChange={(e) => setTag(item.id, e.target.value)}
                className="absolute bottom-0 left-0 right-0 border-t bg-white/95 px-1 py-0.5 text-[10px]"
              >
                <option value="">Tag…</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            )}
            {item.existing && item.tag && (
              <span className="absolute bottom-0 left-0 right-0 truncate border-t bg-white/90 px-1 py-0.5 text-[10px]">
                {item.tag.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        ))}

        {items.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px]">{label}</span>
          </button>
        )}

        {items.length < max && (
          <button
            type="button"
            onClick={() => setShowUrl((s) => !s)}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Link2 className="h-5 w-5" />
            <span className="text-[10px]">Add by URL</span>
          </button>
        )}
      </div>

      {showUrl && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="https://example.com/photo.jpg"
            className="h-9 flex-1 rounded-md border px-3 text-sm"
          />
          <button
            type="button"
            onClick={addUrl}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrl(false);
              setUrlValue('');
              setError('');
            }}
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{items.length}/{max} images</p>
    </div>
  );
}

export default MediaUpload;
