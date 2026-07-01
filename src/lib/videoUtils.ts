export interface ProductVideo {
  id: string;
  url: string;
  title: string;
  is_main: boolean;
  show_in_gallery: boolean;
}

export interface ParsedVideo {
  provider: "youtube" | "vimeo" | "cloudflare" | null;
  id: string | null;
  thumbnail: string | null;
  embedUrl: string | null;
}

/**
 * Parses YouTube, Vimeo, and Cloudflare Stream URLs to extract
 * provider type, video ID, generated embed URL, and thumbnail URL.
 */
export function parseVideoUrl(url: string): ParsedVideo {
  if (!url) return { provider: null, id: null, thumbnail: null, embedUrl: null };

  const cleanUrl = url.trim();

  // 1. YouTube (including Shorts, Watch, Embed, and short links)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
  const ytMatch = cleanUrl.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      provider: "youtube",
      id,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&playsinline=1`
    };
  }

  // 2. Vimeo (standard and player embeds)
  const vimeoRegex = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      provider: "vimeo",
      id,
      thumbnail: `https://vumbnail.com/${id}.jpg`,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&playsinline=1`
    };
  }

  // 3. Cloudflare Stream (various delivery/watch domains)
  const cfRegex = /(?:cloudflarestream\.com|videodelivery\.net|customer-\w+\.cloudflarestream\.com)\/([a-f0-9]{32})/i;
  const cfMatch = cleanUrl.match(cfRegex);
  if (cfMatch && cfMatch[1]) {
    const id = cfMatch[1];
    return {
      provider: "cloudflare",
      id,
      thumbnail: `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg`,
      embedUrl: `https://iframe.videodelivery.net/${id}?autoplay=true&muted=true&playsinline=true`
    };
  }

  return { provider: null, id: null, thumbnail: null, embedUrl: null };
}

/**
 * Validates whether a video URL belongs to one of the supported providers.
 */
export function isValidVideoUrl(url: string): boolean {
  const parsed = parseVideoUrl(url);
  return parsed.provider !== null;
}
