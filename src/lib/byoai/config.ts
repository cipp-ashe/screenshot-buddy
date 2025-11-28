import type { BYOAIConfig } from './providers/types';

/**
 * Shared BYOAI configuration
 * Single source of truth for all BYOAI instances in the app
 */
export const BYOAI_CONFIG: BYOAIConfig = {
  storagePrefix: 'byoai_',
  defaultProvider: 'gemini',
};
