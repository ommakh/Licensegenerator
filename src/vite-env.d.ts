interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_LICENSE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
