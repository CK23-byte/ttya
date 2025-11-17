/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_ENCRYPTION_ITERATIONS: string
  readonly VITE_SESSION_TIMEOUT_MINUTES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
