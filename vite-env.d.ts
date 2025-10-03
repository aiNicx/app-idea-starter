/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly OPENROUTER_API_KEY: string;
}

interface ProcessEnv {
  readonly VITE_CONVEX_URL: string;
  readonly OPENROUTER_API_KEY: string;
}

declare global {
  interface NodeJS {
    ProcessEnv: ProcessEnv;
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
