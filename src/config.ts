/**
 * Site-wide feature switches.
 *
 * CAN_EDIT_MEDIA — the "add video / image" editor. It only appears when you run
 *   the site on your own computer (`npm run dev`). On the live site it is hidden,
 *   so visitors cannot change anything. To publish a new video, add it to
 *   src/data/kuralMedia.ts (the editor's "Export" button gives you the lines to paste).
 *
 * AUDIO_ENABLED — the Kural recitation (speaker) buttons. Keep this false until the
 *   MP3 files are in public/audio/ named 0001.mp3 … 1330.mp3, then set it to true.
 */
export const CAN_EDIT_MEDIA: boolean = import.meta.env.DEV;
export const AUDIO_ENABLED: boolean = false;

/** Where each Kural's recitation lives once you add the files. */
export const audioUrlFor = (kuralNumber: number): string =>
  `/audio/${String(kuralNumber).padStart(4, '0')}.mp3`;
