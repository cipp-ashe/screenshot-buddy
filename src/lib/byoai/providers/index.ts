import type { AIProvider } from './types';
import { GeminiProvider } from './gemini';

/**
 * Provider factory registry - lazy instantiation to avoid unnecessary overhead
 */
const providerFactories = new Map<string, () => AIProvider>([
  ['gemini', () => new GeminiProvider()],
]);

/**
 * Get a provider instance by ID (lazy instantiation)
 */
export const getProvider = (id: string): AIProvider | undefined => {
  const factory = providerFactories.get(id);
  return factory?.();
};

/**
 * Get all available provider instances
 */
export const getAllProviders = (): AIProvider[] => {
  return Array.from(providerFactories.values()).map(factory => factory());
};

export * from './types';
export { GeminiProvider, GEMINI_CONFIG } from './gemini';
