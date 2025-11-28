import type { AIProvider, AIProviderConfig, ApiKeyValidation, AICallOptions } from './types';

export const GEMINI_CONFIG: AIProviderConfig = {
  id: 'gemini',
  name: 'Google Gemini',
  description: 'Google\'s multimodal AI model for text, image, and audio analysis',
  keyFormat: 'AIza... (39 characters)',
  apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent',
  apiKeyUrl: 'https://aistudio.google.com/app/apikey',
};

export class GeminiProvider implements AIProvider {
  config = GEMINI_CONFIG;

  validateApiKey(apiKey: string): ApiKeyValidation {
    if (!apiKey || typeof apiKey !== 'string') {
      return { isValid: false, error: 'API key is required' };
    }
    
    if (apiKey.length < 20) {
      return { isValid: false, error: 'API key appears to be too short' };
    }
    
    if (!apiKey.startsWith('AIza') || apiKey.length !== 39) {
      return { 
        isValid: false, 
        error: 'Invalid Google API key format. Keys should start with "AIza" and be 39 characters long.' 
      };
    }
    
    if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
      return { isValid: false, error: 'API key contains invalid characters' };
    }
    
    return { isValid: true };
  }

  /**
   * Generic authenticated API call
   * Handles flexible content - text, images, audio, or any combination
   */
  async call<TResult>(apiKey: string, options: AICallOptions<TResult>): Promise<TResult> {
    // Process flexible content array into Gemini API format
    const parts = options.content.map(part => {
      if (part.type === 'text') {
        return { text: part.text };
      }
      
      if (part.type === 'image') {
        // Extract base64 data (remove data:image/...;base64, prefix if present)
        const base64Data = part.data.includes(',') ? part.data.split(',')[1] : part.data;
        
        // Detect mime type from data URL or use provided mimeType
        let mimeType = part.mimeType;
        if (!mimeType && part.data.includes('data:')) {
          const match = part.data.match(/data:([^;]+);/);
          mimeType = match ? match[1] : 'image/jpeg';
        } else if (!mimeType) {
          mimeType = 'image/jpeg'; // fallback
        }
        
        return {
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        };
      }
      
      if (part.type === 'audio') {
        const base64Data = part.data.includes(',') ? part.data.split(',')[1] : part.data;
        
        let mimeType = part.mimeType;
        if (!mimeType && part.data.includes('data:')) {
          const match = part.data.match(/data:([^;]+);/);
          mimeType = match ? match[1] : 'audio/wav';
        } else if (!mimeType) {
          mimeType = 'audio/wav';
        }
        
        return {
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        };
      }
      
      throw new Error(`Unsupported content type: ${(part as any).type}`);
    });
    
    // Set Origin header only in browser environment
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      headers['Origin'] = window.location.origin;
    }
    
    const response = await fetch(`${this.config.apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contents: [{ parts }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed - API key may be invalid');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Defensive parsing - handle unexpected API response structure
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Unexpected API response structure. Please try again.');
    }
    
    // Consumer's parser handles domain-specific extraction
    return options.parseResponse(rawText);
  }
}
