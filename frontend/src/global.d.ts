export {};

declare global {
  interface Window {
    __spandanaPreviewSettings: unknown;
    __spandanaNavigate?: (path: string) => void;
    __spandanaSetTab?: (tab: string) => void;
    __spandanaPreview?: (settings: unknown) => void;
    __spandanaPreviewPath?: (path: string) => void;
  }
}
