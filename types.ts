export interface UploadedImage {
  base64: string;
  mimeType: string;
  name: string;
}

export interface GenerationResult {
  image: string;
  prompt: string;
}

export type CategorizedSuggestions = Record<string, string[]>;