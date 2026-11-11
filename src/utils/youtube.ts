/**
 * Extracts YouTube Video ID from various link formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - VIDEO_ID directly
 */
export function extractYouTubeId(urlOrId: string | undefined): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  
  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      // Find group with 11 characters
      const candidate = match[1] || match[7];
      if (candidate && candidate.length === 11) {
        return candidate;
      }
    }
  }

  return null;
}

export function getYouTubeEmbedUrl(urlOrId: string | undefined): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}

export function getYouTubeThumbnail(urlOrId: string | undefined): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
