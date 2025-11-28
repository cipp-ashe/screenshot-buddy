/**
 * Base types for AI provider implementations
 * 
 * BYOAI is a pure infrastructure library for secure API key management
 * and authenticated calls. It does NOT make assumptions about:
 * - What you're analyzing (text, images, audio, multi-modal)
 * - What response shape you expect
 * - What prompts you use
 * 
 * Consumers provide domain-specific logic via AICallOptions.
 */

export interface ApiKeyValidation {
  isValid: boolean;
  error?: string;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  description: string;
  keyFormat: string;
  apiUrl: string;
  apiKeyUrl?: string;
}

/**
 * Flexible content types - text, image, audio, or any combination
 */
export type ContentPart = 
  | { type: 'text'; text: string }
  | { type: 'image'; data: string; mimeType?: string }
  | { type: 'audio'; data: string; mimeType?: string };

/**
 * Generic call options - consumer defines everything domain-specific
 */
export interface AICallOptions<TResult> {
  content: ContentPart[];
  parseResponse: (rawText: string) => TResult;
}

export interface AIProvider {
  config: AIProviderConfig;
  
  /**
   * Validates API key format
   */
  validateApiKey(apiKey: string): ApiKeyValidation;
  
  /**
   * Generic authenticated call - consumer provides content and parser
   */
  call<TResult>(apiKey: string, options: AICallOptions<TResult>): Promise<TResult>;
}

export interface BYOAIConfig {
  storagePrefix?: string;
  defaultProvider?: string;
  encryptionConfig?: {
    saltSuffix?: string;
    iterations?: number;
    keyLength?: number;
    maxAge?: number;
    customFingerprint?: string;
  };
}
