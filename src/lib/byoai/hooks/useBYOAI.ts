import { useState, useEffect, useCallback } from 'react';
import { SecureStorage } from '../core/storage';
import { getProvider, type AIProvider } from '../providers';
import type { BYOAIConfig, AICallOptions } from '../providers/types';
import { BYOAI_CONFIG } from '../config';

/**
 * Main hook for BYOAI functionality
 * Pure infrastructure - no domain assumptions
 */
export const useBYOAI = (config: BYOAIConfig = {}) => {
  const finalConfig = { ...BYOAI_CONFIG, ...config };
  
  // Get singleton storage instance
  const storage = SecureStorage.getInstance(finalConfig.storagePrefix, finalConfig.encryptionConfig);
  
  const [provider, setProvider] = useState<AIProvider | undefined>(
    getProvider(finalConfig.defaultProvider)
  );
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state from storage
  const syncFromStorage = useCallback(() => {
    const storedProvider = localStorage.getItem(`${finalConfig.storagePrefix}provider`);
    if (storedProvider) {
      const p = getProvider(storedProvider);
      if (p) setProvider(p);
    }
    setHasApiKey(storage.exists('api_key'));
  }, [finalConfig.storagePrefix, storage]);

  // Subscribe to storage changes for state sync
  useEffect(() => {
    syncFromStorage(); // Initial sync
    return storage.subscribe(syncFromStorage); // Re-sync on any change
  }, [storage, syncFromStorage]);

  const saveApiKey = useCallback(async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
    if (!provider) {
      return { success: false, error: 'No provider selected' };
    }

    const validation = provider.validateApiKey(apiKey);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      await storage.store('api_key', apiKey);
      setHasApiKey(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save API key securely' };
    }
  }, [provider, storage]);

  const removeApiKey = useCallback(() => {
    storage.remove('api_key');
  }, [storage]);

  const changeProvider = useCallback((providerId: string) => {
    const newProvider = getProvider(providerId);
    if (newProvider) {
      setProvider(newProvider);
      localStorage.setItem(`${finalConfig.storagePrefix}provider`, providerId);
      storage.notifySubscribers();
    }
  }, [finalConfig.storagePrefix, storage]);

  /**
   * Generic call method - consumer provides everything domain-specific
   */
  const call = useCallback(async <TResult>(
    options: AICallOptions<TResult>
  ): Promise<TResult> => {
    if (!provider) {
      throw new Error('No provider configured');
    }

    if (!hasApiKey) {
      throw new Error('No API key configured. Please save an API key first.');
    }

    setIsLoading(true);
    try {
      const apiKey = await storage.retrieve('api_key');
      if (!apiKey) {
        throw new Error('Failed to retrieve API key');
      }

      return await provider.call(apiKey, options);
    } finally {
      setIsLoading(false);
    }
  }, [provider, hasApiKey, storage]);

  const getApiKeyInfo = useCallback(() => {
    return storage.getInfo('api_key');
  }, [storage]);

  const clearAllData = useCallback(() => {
    storage.clearAll();
  }, [storage]);

  return {
    // State
    provider,
    hasApiKey,
    isLoading,
    
    // Actions
    saveApiKey,
    removeApiKey,
    changeProvider,
    call,  // Generic - not domain-specific "analyzeImage"
    getApiKeyInfo,
    clearAllData,
  };
};
