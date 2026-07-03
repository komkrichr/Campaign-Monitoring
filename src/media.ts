// Helpers for turning a Material URL into a preview.

/** Extract an 11-char YouTube video id from common URL shapes. */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/ID
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/ID
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Thumbnail URL for a YouTube video, or null if not a YouTube link. */
export function youtubeThumb(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/** True if the string looks like an http(s) URL. */
export function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

/** Short, readable label for a URL (host + trimmed path). */
export function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname === '/' ? '' : u.pathname;
    const label = `${u.hostname.replace(/^www\./, '')}${path}`;
    return label.length > 42 ? `${label.slice(0, 42)}…` : label;
  } catch {
    return url;
  }
}
