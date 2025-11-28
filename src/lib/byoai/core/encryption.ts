/**
 * Secure encryption utilities for sensitive data storage
 * Uses Web Crypto API for AES-GCM encryption
 */

export interface EncryptionConfig {
  saltSuffix?: string;
  iterations?: number;
  keyLength?: number;
  maxAge?: number; // in milliseconds
  customFingerprint?: string; // For SSR/Node.js or testing environments
}

const DEFAULT_CONFIG: Required<Omit<EncryptionConfig, 'customFingerprint'>> & { customFingerprint?: string } = {
  saltSuffix: 'byoai_v1',
  iterations: 100000,
  keyLength: 256,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export class SecureEncryption {
  private config: Required<Omit<EncryptionConfig, 'customFingerprint'>> & { customFingerprint?: string };

  constructor(config: EncryptionConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Encrypts data using AES-GCM
   */
  async encrypt(data: string): Promise<string> {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const fingerprint = await this.getBrowserFingerprint();
      const cryptoKey = await this.deriveKey(fingerprint);
      
      const encodedData = new TextEncoder().encode(data);
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encodedData
      );
      
      const storageData = {
        data: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
        timestamp: Date.now(),
        version: '1.0'
      };
      
      return JSON.stringify(storageData);
    } catch (error) {
      console.error('[SecureEncryption] Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts previously encrypted data
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      const { data, iv, timestamp } = JSON.parse(encryptedData);
      
      // Check expiry
      if (Date.now() - timestamp > this.config.maxAge) {
        throw new Error('Data expired');
      }
      
      const fingerprint = await this.getBrowserFingerprint();
      const cryptoKey = await this.deriveKey(fingerprint);
      
      const encryptedArray = new Uint8Array(data);
      const ivArray = new Uint8Array(iv);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivArray },
        cryptoKey,
        encryptedArray
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('[SecureEncryption] Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Gets storage info from encrypted data
   */
  getStorageInfo(encryptedData: string): { timestamp: number; version: string; isExpired: boolean } | null {
    try {
      const { timestamp, version } = JSON.parse(encryptedData);
      const isExpired = Date.now() - timestamp > this.config.maxAge;
      return { timestamp, version, isExpired };
    } catch {
      return null;
    }
  }

  private async deriveKey(fingerprint: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(fingerprint + this.config.saltSuffix),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(this.config.saltSuffix),
        iterations: this.config.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: this.config.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async getBrowserFingerprint(): Promise<string> {
    // Use custom fingerprint if provided (for SSR/testing)
    if (this.config.customFingerprint) {
      return this.config.customFingerprint;
    }
    
    // Environment detection - only works in browser
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || typeof screen === 'undefined') {
      throw new Error(
        'BYOAI encryption requires a browser environment. ' +
        'For Node.js/SSR, provide customFingerprint via encryptionConfig: { customFingerprint: "your-secret-key" }'
      );
    }
    
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      window.location.origin
    ];
    
    const fingerprint = components.join('|');
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint));
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
