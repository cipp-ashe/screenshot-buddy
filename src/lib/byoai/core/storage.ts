import { SecureEncryption } from './encryption';

/**
 * Secure storage manager for sensitive data
 * Uses singleton pattern + subscription for state sync across components
 */
export class SecureStorage {
  private static instances = new Map<string, SecureStorage>();
  private subscribers = new Set<() => void>();
  private encryption: SecureEncryption;
  private storagePrefix: string;

  private constructor(storagePrefix = 'byoai_', encryptionConfig = {}) {
    this.encryption = new SecureEncryption(encryptionConfig);
    this.storagePrefix = storagePrefix;
  }

  /**
   * Get singleton instance per prefix
   * Note: If instance exists, encryptionConfig changes are ignored
   */
  static getInstance(storagePrefix = 'byoai_', encryptionConfig = {}): SecureStorage {
    if (!this.instances.has(storagePrefix)) {
      this.instances.set(storagePrefix, new SecureStorage(storagePrefix, encryptionConfig));
    } else if (Object.keys(encryptionConfig).length > 0) {
      console.warn('[SecureStorage] Instance already exists for prefix. encryptionConfig changes ignored.');
    }
    return this.instances.get(storagePrefix)!;
  }

  /**
   * Subscribe to storage changes
   * Returns unsubscribe function
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of changes
   */
  notifySubscribers(): void {
    this.subscribers.forEach(cb => cb());
  }

  /**
   * Securely stores data with encryption
   */
  async store(key: string, data: string): Promise<void> {
    try {
      const encrypted = await this.encryption.encrypt(data);
      localStorage.setItem(this.storagePrefix + key, encrypted);
      this.notifySubscribers();
    } catch (error) {
      console.error('[SecureStorage] Store failed:', error);
      throw error;
    }
  }

  /**
   * Retrieves and decrypts stored data
   */
  async retrieve(key: string): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(this.storagePrefix + key);
      if (!encrypted) return null;
      
      return await this.encryption.decrypt(encrypted);
    } catch (error) {
      console.error('[SecureStorage] Retrieve failed:', error);
      this.remove(key);
      return null;
    }
  }

  /**
   * Removes stored data
   */
  remove(key: string): void {
    localStorage.removeItem(this.storagePrefix + key);
    this.notifySubscribers();
  }

  /**
   * Checks if data exists for key
   */
  exists(key: string): boolean {
    return localStorage.getItem(this.storagePrefix + key) !== null;
  }

  /**
   * Gets storage metadata
   */
  getInfo(key: string): { timestamp: number; version: string; isExpired: boolean } | null {
    const encrypted = localStorage.getItem(this.storagePrefix + key);
    if (!encrypted) return null;
    return this.encryption.getStorageInfo(encrypted);
  }

  /**
   * Clears all data with this prefix
   */
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
      }
    });
    this.notifySubscribers();
  }
}
