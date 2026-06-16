/// <reference types="vite/client" />

export function isNowPlayingDevPreview(): boolean {
  return import.meta.env.DEV
}
