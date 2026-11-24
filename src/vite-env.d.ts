/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute booking/scheduler URL, or a mailto: link. Falls back to the maintainer address. */
  readonly VITE_BOOKING_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
