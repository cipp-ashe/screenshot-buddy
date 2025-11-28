/**
 * BYOAI - Bring Your Own AI
 * 
 * Pure business logic library for AI provider integration.
 * Handles encryption, storage, and provider management.
 * Build your own UI with the useBYOAI hook.
 */

export * from './core/encryption';
export * from './core/storage';
export * from './providers';
export * from './hooks/useBYOAI';
export { BYOAI_CONFIG } from './config';

// Convenience helpers for common use cases
// Note: createTextOptions and createMultiModalOptions are exported for library consumers
// but not used in this app since we only do image analysis
import type { AICallOptions, ContentPart } from './providers/types';

/**
 * Helper to create image analysis call options
 * Simplifies the common pattern of text prompt + image
 */
export const createImageAnalysisOptions = <TResult>(
  imageData: string,
  prompt: string,
  parser: (rawText: string) => TResult,
  mimeType: string = 'image/jpeg'
): AICallOptions<TResult> => ({
  content: [
    { type: 'text', text: prompt },
    { type: 'image', data: imageData, mimeType }
  ],
  parseResponse: parser
});

/**
 * Helper to create text-only call options
 */
export const createTextOptions = <TResult>(
  prompt: string,
  parser: (rawText: string) => TResult
): AICallOptions<TResult> => ({
  content: [
    { type: 'text', text: prompt }
  ],
  parseResponse: parser
});

/**
 * Helper to create multi-modal call options
 */
export const createMultiModalOptions = <TResult>(
  content: ContentPart[],
  parser: (rawText: string) => TResult
): AICallOptions<TResult> => ({
  content,
  parseResponse: parser
});
