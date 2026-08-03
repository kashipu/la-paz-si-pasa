const YOUTUBE_ID = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/** @param {string} value @returns {string | undefined} */
export function youtubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    const id = host === "youtu.be"
      ? parts[0]
      : YOUTUBE_HOSTS.has(host)
        ? url.pathname === "/watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live"].includes(parts[0])
            ? parts[1]
            : undefined
        : undefined;

    return id && YOUTUBE_ID.test(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

/** @param {string} id @returns {{ youtubeId: string; videoUrl: string; thumbnailUrl: string }} */
export function youtubeVideo(id) {
  return {
    youtubeId: id,
    videoUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

/**
 * @param {string} youtubeUrl
 * @param {string} fileUrl
 * @returns {{ fuente: "youtube" | "wordpress"; estado: "disponible" | "no-disponible"; youtubeId?: string; videoUrl: string; thumbnailUrl: string }}
 */
export function videoSource(youtubeUrl, fileUrl) {
  const id = youtubeId(youtubeUrl);
  if (id) return { fuente: "youtube", estado: "disponible", ...youtubeVideo(id) };
  if (fileUrl) return { fuente: "wordpress", estado: "disponible", videoUrl: fileUrl, thumbnailUrl: "" };

  return { fuente: youtubeUrl ? "youtube" : "wordpress", estado: "no-disponible", videoUrl: "", thumbnailUrl: "" };
}
