'use client'

export default function EditorThumbnail() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg2">
      <div
        className="relative flex h-[88%] w-[92%] flex-col rounded-lg border border-bg3 bg-bg1 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--bg0),transparent_40%)]"
        aria-hidden
      >
        <div className="flex border-b border-bg3 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-bg3" />
          <span className="ml-1.5 h-2 w-2 rounded-full bg-bg3" />
          <span className="ml-1.5 h-2 w-2 rounded-full bg-bg3" />
        </div>
        <div className="flex flex-1 items-start px-[10%] pt-[12%]">
          <div className="flex h-[min(40%,4.5rem)] items-end">
            <span className="editor-cursor-blink h-6 w-px shrink-0 bg-fg3" />
          </div>
        </div>
      </div>
    </div>
  )
}
