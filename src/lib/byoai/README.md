# BYOAI - Bring Your Own AI

A pure infrastructure library for integrating AI providers with secure key management and encryption.

## Requirements

- **React** 18.0+ (uses hooks)
- **TypeScript** 5.0+ (for type safety)
- **Modern browser** with Web Crypto API support
  - Chrome/Edge 37+, Firefox 34+, Safari 11+
  - Not supported in Internet Explorer
- **localStorage** enabled (5-10MB limit per domain)

## Installation

BYOAI is a standalone library you can copy directly into your project. No npm package required.

1. **Copy the entire `src/lib/byoai` directory** into your project:
   ```
   your-project/
   └── src/
       └── lib/
           └── byoai/
               ├── core/
               │   ├── encryption.ts
               │   └── storage.ts
               ├── providers/
               │   ├── types.ts
               │   ├── gemini.ts
               │   └── index.ts
               ├── hooks/
               │   └── useBYOAI.ts
               ├── config.ts
               └── index.ts
   ```

2. **Configure your path aliases** in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/lib/byoai": ["./src/lib/byoai"],
         "@/lib/byoai/*": ["./src/lib/byoai/*"]
       }
     }
   }
   ```

3. **Configure Vite** (if using) in `vite.config.ts`:
   ```typescript
   import path from "path"
   
   export default defineConfig({
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   })
   ```

## Philosophy

**Pure Logic, No UI** - BYOAI handles encryption, storage, provider management, and authenticated API calls. You build the UI that fits your app.

**Maximum Flexibility** - Works with text, images, audio, or any combination. You provide the content and parsing logic - BYOAI handles the rest.

## For AI Agents and Implementers

This section defines constraints for AI agents (like Lovable) rebuilding or extending BYOAI. Human developers can read this to understand the system's boundaries.

### What Implementations MUST NOT Do

When implementing, porting, or extending BYOAI:

**Architecture Changes (Forbidden):**
- ❌ Invent additional content types beyond `text`, `image`, `audio`
- ❌ Refactor the core architecture (encryption → storage → provider abstraction)
- ❌ Rename methods, interfaces, or core arguments
- ❌ Restructure the file organization
- ❌ Modify, reword, or replace core error message strings (they're part of the contract; additional context via separate fields like `error.cause` is permitted)

**Feature Additions (Forbidden):**
- ❌ Add UI components (BYOAI is infrastructure only)
- ❌ Add automatic retry logic (let consumers handle this)
- ❌ Add caching or request batching
- ❌ Add auto-heuristics (trimming, parsing, formatting)
- ❌ Modify user prompts or AI outputs
- ❌ Add middleware or interceptors

**Storage Violations (Forbidden):**
- ❌ Use cookies, indexedDB, or sessionStorage
- ❌ Store data in anything except the two defined localStorage keys
- ❌ Store raw (unencrypted) API keys anywhere
- ❌ Mutate global window state

**Security Violations (Forbidden):**
- ❌ Log API keys or encrypted data
- ❌ Send API keys to endpoints other than the provider's official API
- ❌ Store decrypted keys in memory beyond the call boundary

### What Implementations MAY Do

**Encouraged Behaviors:**
- ✅ Generate idiomatic TypeScript and React code
- ✅ Add new provider implementations that follow the `AIProvider` interface
- ✅ Generate helper functions that comply with the architecture
- ✅ Error message text is part of the contract. Implementations MAY add additional context (e.g., `error.cause`) but MUST NOT modify, reword, or replace the core message string
- ✅ Add inline documentation and examples
- ✅ Optimize performance without changing behavior

**Use Cases for This Spec:**
```
"Rebuild the full BYOAI library following this README"
"Port BYOAI to Vue.js using this architecture"
"Generate a new OpenAI provider following the contract"
"Refactor encryption.ts for better performance"
```

### Deterministic Behaviors Required

These behaviors MUST be deterministic and consistent:
- Encrypted data JSON structure (see Architecture Invariants)
- localStorage key names (`{prefix}api_key`, `{prefix}provider`)
- Provider ID registry (`gemini`, future providers)
- Timeout duration (15 seconds)
- Content part ordering
- Error message strings
- Response passed to `parseResponse` (raw, unmodified text)

## Quick Start

```tsx
import { useBYOAI, BYOAI_CONFIG } from '@/lib/byoai';

function MyComponent() {
  // Use shared config for consistency
  const ai = useBYOAI(BYOAI_CONFIG);

  // Save API key
  const handleSaveKey = async (key: string) => {
    const result = await ai.saveApiKey(key);
    if (result.success) {
      console.log('Key saved!');
    }
  };

  // Make a text-only call
  const analyzeText = async () => {
    const result = await ai.call({
      content: [
        { type: 'text', text: 'Explain quantum computing in simple terms' }
      ],
      parseResponse: (text) => ({ explanation: text })
    });
    console.log(result.explanation);
  };

  // Make an image analysis call
  const analyzeImage = async (imageData: string) => {
    const result = await ai.call({
      content: [
        { type: 'text', text: 'What is in this image?' },
        { type: 'image', data: imageData, mimeType: 'image/jpeg' }
      ],
      parseResponse: (text) => JSON.parse(text)
    });
    return result;
  };

  return (
    <div>
      {!ai.hasApiKey ? (
        <input onChange={(e) => handleSaveKey(e.target.value)} />
      ) : (
        <button onClick={analyzeText}>Analyze</button>
      )}
    </div>
  );
}
```

## Hook API

### `useBYOAI(config?)`

```typescript
const ai = useBYOAI({
  storagePrefix: 'byoai_',      // localStorage prefix
  defaultProvider: 'gemini',     // which provider to use
  encryptionConfig: {}           // optional encryption config
});
```

### Returned Object

```typescript
{
  // State
  provider: AIProvider | undefined,   // Current provider
  hasApiKey: boolean,                 // Has stored key?
  isLoading: boolean,                 // Processing?
  
  // Actions
  saveApiKey: (key: string) => Promise<{ success: boolean; error?: string }>,
  removeApiKey: () => void,
  changeProvider: (id: string) => void,
  call: <TResult>(options: AICallOptions<TResult>) => Promise<TResult>,
  getApiKeyInfo: () => { timestamp: number; version: string; isExpired: boolean } | null,
  clearAllData: () => void
}
```

## Content Types

BYOAI supports flexible content via the `ContentPart` type:

```typescript
type ContentPart = 
  | { type: 'text'; text: string }
  | { type: 'image'; data: string; mimeType?: string }
  | { type: 'audio'; data: string; mimeType?: string };
```

### Text-Only Example

```typescript
const result = await ai.call({
  content: [
    { type: 'text', text: 'What is the capital of France?' }
  ],
  parseResponse: (text) => ({ answer: text.trim() })
});
```

### Image Analysis Example

```typescript
const result = await ai.call({
  content: [
    { type: 'text', text: 'Analyze this screenshot and extract the main heading' },
    { type: 'image', data: 'data:image/png;base64,...', mimeType: 'image/png' }
  ],
  parseResponse: (text) => {
    const parsed = JSON.parse(text);
    return { heading: parsed.heading };
  }
});
```

### Multi-Modal Example

```typescript
const result = await ai.call({
  content: [
    { type: 'text', text: 'Compare this image and audio' },
    { type: 'image', data: imageBase64 },
    { type: 'audio', data: audioBase64, mimeType: 'audio/wav' }
  ],
  parseResponse: (text) => ({ comparison: text })
});
```

## Helper Functions

For common use cases, BYOAI provides convenience helpers:

```typescript
import { createImageAnalysisOptions, createTextOptions } from '@/lib/byoai';

// Image analysis helper
const options = createImageAnalysisOptions(
  imageData,
  'What is in this image?',
  (text) => JSON.parse(text),
  'image/jpeg'  // optional, defaults to image/jpeg
);
const result = await ai.call(options);

// Text-only helper
const textOptions = createTextOptions(
  'Explain quantum physics',
  (text) => ({ explanation: text })
);
const answer = await ai.call(textOptions);
```

## Architecture

```
src/lib/byoai/
├── core/
│   ├── encryption.ts     # Web Crypto API encryption
│   └── storage.ts        # Secure localStorage wrapper with singleton pattern
├── providers/
│   ├── types.ts          # Provider interfaces
│   ├── gemini.ts         # Gemini implementation
│   └── index.ts          # Provider registry (lazy loading)
├── hooks/
│   └── useBYOAI.ts       # Main hook
└── index.ts              # Public API
```

## Architecture Invariants

These rules **MUST** be maintained across all implementations of BYOAI:

### Non-Negotiable Rules

1. **API keys never in React state** - Keys flow: user input → validate → encrypt → localStorage. Never stored in component state or passed as props.

2. **Provider interface is mandatory** - All providers MUST implement the `AIProvider` interface with both `validateApiKey()` and `call()` methods. No exceptions.

3. **Encryption before storage** - `SecureStorage.store()` always encrypts data before writing to localStorage. Raw values never touch localStorage.

4. **Parser always invoked** - Provider `call()` MUST return `options.parseResponse(rawText)`, never raw API response strings.

5. **Content order preserved** - The `ContentPart[]` array order is maintained in API requests. Providers must not reorder parts.

6. **Singleton storage instances** - `SecureStorage.getInstance()` ensures only one instance exists per storage prefix, preventing encryption key mismatches.

7. **Fingerprint binding** - Encrypted data is bound to browser fingerprint. Keys cannot be transferred between browsers without re-entry.

### Encrypted Data Format

All encrypted values stored in localStorage follow this JSON schema:

```json
{
  "data": [/* AES-256-GCM encrypted bytes as number array */],
  "iv": [/* 12-byte initialization vector as number array */],
  "timestamp": 1700000000000,  // Unix timestamp in milliseconds
  "version": "1.0"              // Encryption version for migration
}
```

**Example encrypted value:**
```json
{
  "data": [142, 98, 211, ...],
  "iv": [88, 204, 156, 73, 28, 251, 199, 45, 116, 231, 90, 33],
  "timestamp": 1732752000000,
  "version": "1.0"
}
```

### Storage Keys

BYOAI uses these `localStorage` keys (with configurable prefix, default `"byoai_"`):

- **`{prefix}api_key`** - Encrypted API key blob (JSON string)
- **`{prefix}provider`** - Provider ID string (unencrypted, e.g., `"gemini"`)

Example with default prefix:
- `byoai_api_key` → `{"data":[...],"iv":[...],"timestamp":1732752000000,"version":"1.0"}`
- `byoai_provider` → `"gemini"`

### Timeout and Error Behavior

**API Call Timeouts:**
- Default timeout: **15 seconds** (using `AbortSignal`)
- Configurable per-provider in future versions
- Timeout errors throw with a browser-specific message (e.g., `"The operation was aborted due to timeout"`)

**Error Return Patterns:**
- `saveApiKey(key)` → Returns `{ success: boolean; error?: string }` (never throws)
- `call(options)` → Throws `Error` on failure with descriptive message
- `decrypt(data)` → Throws on failure OR silently removes corrupted key and returns `null`
- `validateApiKey(key)` → Returns `{ isValid: boolean; error?: string }` (never throws)

**Common Error Messages:**
- `"No API key configured. Please save an API key first."` - User hasn't saved a key
- `"Authentication failed - API key may be invalid"` - API rejected the key (401/403)
- `"Failed to decrypt data"` - Browser fingerprint changed or data corrupted
- `"Data expired"` - Stored key exceeded `maxAge` (default 30 days)
- `"Request timeout"` - API call took longer than 15 seconds

### Hook Lifecycle Guarantees

The `useBYOAI` hook follows these lifecycle rules:

**1. Initialization (Mount)**
```
Component mounts → syncFromStorage() → Reads localStorage → Updates state
```

**2. State Synchronization**
- Hook subscribes to `SecureStorage` on mount
- Any storage change triggers re-render across ALL components using the hook
- Unsubscribes on unmount

**3. `isLoading` State**
- Set to `true` when `call()` starts
- Set to `false` when `call()` completes (success or error)
- Never `true` during `saveApiKey()` or `removeApiKey()`

**4. `hasApiKey` Updates**
- Updates immediately after successful `saveApiKey()` completes
- Updates immediately after `removeApiKey()` is called
- Syncs from storage on mount and on external storage changes

**5. Re-render Triggers**
- `call()` start/finish (via `isLoading`)
- `saveApiKey()` success (via `hasApiKey`)
- `removeApiKey()` (via `hasApiKey`)
- `changeProvider()` (via `provider`)
- External `localStorage` changes from other tabs/windows

### Provider Implementation Rules

When creating new providers, you MUST follow these contracts:

**Required Methods:**
```typescript
validateApiKey(apiKey: string): ApiKeyValidation
  // Returns { isValid: boolean; error?: string }
  // MUST NOT throw errors
  // MUST check format, not make API calls

call<TResult>(apiKey: string, options: AICallOptions<TResult>): Promise<TResult>
  // Returns parsed result via options.parseResponse()
  // MUST throw Error on API failure
  // MUST respect ContentPart order
  // MUST include timeout handling
```

**Content Translation Rules:**
- Text parts: Use provider's native text format
- Image parts: Convert base64 data to provider-specific format
- Audio parts: Convert base64 data (future providers may support)
- Multi-modal: Combine parts in provider's expected structure
- Preserve order: Send parts in the exact order they appear in `options.content`

**Response Extraction Contract:**

Providers MUST extract the provider's raw text response and pass it directly to `options.parseResponse(rawText)`. The raw text MUST represent the entire text output of the provider's final message.

Providers MUST NOT:
- Trim or modify whitespace
- Remove JSON braces or other characters
- Perform partial extraction (e.g., taking first N characters)
- Concatenate multiple messages
- Drop sections of the output
- Re-format or pretty-print JSON
- Parse JSON before passing to `parseResponse`

**Example (Gemini):**
```typescript
// ✅ CORRECT - Extract complete raw text
const rawText = data.candidates[0].content.parts[0].text;
return options.parseResponse(rawText);

// ❌ WRONG - Trimming or modifying
return options.parseResponse(rawText.trim());

// ❌ WRONG - Parsing before parseResponse
const parsed = JSON.parse(rawText);
return options.parseResponse(JSON.stringify(parsed));
```

This contract ensures that `parseResponse` receives identical raw text regardless of which provider is used, preventing subtle bugs from provider-specific response handling.

**Forbidden Behaviors:**
- Never store API keys in class properties
- Never log API keys or encrypted data
- Never modify `options.content` array
- Never return raw API response text (always invoke `parseResponse`)
- Never implement authentication retry logic (let consumer handle)

## Adding New Providers

Create a new provider file in `src/lib/byoai/providers/`:

```typescript
// providers/openai.ts
import type { AIProvider, AIProviderConfig, AICallOptions } from './types';

export const OPENAI_CONFIG: AIProviderConfig = {
  id: 'openai',
  name: 'OpenAI',
  description: 'OpenAI GPT models',
  keyFormat: 'sk-... (starts with sk-)',
  apiUrl: 'https://api.openai.com/v1/...',
};

export class OpenAIProvider implements AIProvider {
  config = OPENAI_CONFIG;

  validateApiKey(apiKey: string) {
    return { isValid: apiKey.startsWith('sk-') };
  }

  async call<TResult>(apiKey: string, options: AICallOptions<TResult>) {
    // Convert content array to OpenAI format
    const messages = options.content.map(part => {
      if (part.type === 'text') return { role: 'user', content: part.text };
      // ... handle images, etc.
    });
    
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });
    
    const data = await response.json();
    return options.parseResponse(data.choices[0].message.content);
  }
}
```

Register in `providers/index.ts`:

```typescript
import { OpenAIProvider } from './openai';

const providerFactories = new Map<string, () => AIProvider>([
  ['gemini', () => new GeminiProvider()],
  ['openai', () => new OpenAIProvider()], // Add here
]);
```

## Security

### Encryption Details
- **Algorithm**: AES-256-GCM with PBKDF2 key derivation
- **Key binding**: Encrypted keys are bound to browser fingerprint (UA, screen, timezone, origin)
- **Expiry**: 30-day automatic expiry (configurable via `maxAge`)
- **Storage**: Only in localStorage, never in plain text
- **Network**: API keys only sent to the provider's API endpoint

### Important Security Notes

⚠️ **localStorage Limitations:**
- 5-10MB size limit per domain (browser-dependent)
- Not accessible in private/incognito mode (Safari)
- Cleared when user clears browser data
- Accessible to any script on the same origin

⚠️ **Browser Fingerprint Changes:**
If a user changes browser, clears data, or significantly alters their fingerprint, encrypted keys become unreadable. This is intentional - users must re-enter their API key.

⚠️ **Content Security Policy (CSP):**
Web Crypto API may require CSP adjustments in some environments:
```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'wasm-unsafe-eval'">
```

⚠️ **Rate Limiting:**
BYOAI does not handle provider rate limits. You should:
- Implement request queuing for high-volume apps
- Add exponential backoff for 429 errors
- Track usage to avoid unexpected costs

## Environment Compatibility

- **Browser**: Full support with automatic browser fingerprinting
- **Node.js/SSR**: Requires custom fingerprint configuration

### Node.js/SSR Support

For Server-Side Rendering or Node.js environments, provide a `customFingerprint`:

```typescript
const ai = useBYOAI({
  encryptionConfig: {
    customFingerprint: process.env.ENCRYPTION_SECRET || 'your-server-secret-key'
  }
});
```

⚠️ **Important**: Keep your `customFingerprint` secret and use environment variables in production.

## Native AI Fallback Pattern

The current app uses a "native AI fallback" pattern - if BYOAI has no API key, it falls back to a native AI service:

```typescript
if (byoai.hasApiKey) {
  const result = await byoai.call({ content, parseResponse });
} else {
  const result = await analyzeWithNativeAI(imageData);
}
```

This allows users to optionally "bring their own" API key while still functioning without one.

## Best Practices

1. **Use shared config** - Import `BYOAI_CONFIG` to ensure consistency across components
2. **Always provide parsers** - Don't return raw strings, parse to your domain types
3. **Handle errors** - Wrap `ai.call()` in try-catch for network/API failures
4. **Validate before calling** - Use `ai.hasApiKey` to check before making calls
5. **Use helpers** - `createImageAnalysisOptions()` and `createTextOptions()` simplify common patterns
6. **Keep prompts focused** - Better results with specific instructions
7. **Extract mimeType from data URLs** - BYOAI automatically extracts mimeType from data URL prefixes when not explicitly provided

## Error Handling

Implement comprehensive error handling for production:

```typescript
try {
  const result = await ai.call(options);
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    // Invalid API key - prompt user to re-enter
    toast.error('API key is invalid. Please check your settings.');
  } else if (error.message.includes('No API key')) {
    // Missing API key - redirect to settings
    navigate('/settings');
  } else if (error.message.includes('Failed to decrypt')) {
    // Browser fingerprint changed - clear and re-prompt
    ai.clearAllData();
    toast.error('Session expired. Please re-enter your API key.');
  } else if (error.message.includes('timeout')) {
    // Request timeout - retry with smaller payload
    toast.error('Request timed out. Try a smaller image.');
  } else {
    // Generic error
    console.error('AI call failed:', error);
    toast.error('Something went wrong. Please try again.');
  }
}
```

## Testing

### Unit Testing Encryption

```typescript
import { SecureEncryption } from '@/lib/byoai/core/encryption';

describe('SecureEncryption', () => {
  it('encrypts and decrypts data', async () => {
    const encryption = new SecureEncryption({
      customFingerprint: 'test-fingerprint-12345'
    });
    
    const original = 'test-api-key';
    const encrypted = await encryption.encrypt(original);
    const decrypted = await encryption.decrypt(encrypted);
    
    expect(decrypted).toBe(original);
  });
  
  it('rejects expired data', async () => {
    const encryption = new SecureEncryption({
      customFingerprint: 'test-fingerprint',
      maxAge: -1 // Already expired
    });
    
    const encrypted = await encryption.encrypt('test');
    
    await expect(
      encryption.decrypt(encrypted)
    ).rejects.toThrow('Data expired');
  });
});
```

### Integration Testing

Mock the provider's API in tests:

```typescript
import { useBYOAI } from '@/lib/byoai';

// Mock fetch for Gemini API
global.fetch = vi.fn((url) => {
  if (url.includes('generativelanguage.googleapis.com')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{ text: 'Mock AI response' }]
          }
        }]
      })
    });
  }
});
```

## Troubleshooting

### "Failed to encrypt/decrypt data"
- Check if Web Crypto API is available (`crypto.subtle` exists)
- Verify you're running in HTTPS (required for crypto API)
- Check browser console for CSP violations

### "No API key configured"
- User hasn't saved an API key yet
- localStorage was cleared
- User is in private/incognito mode (Safari blocks localStorage)

### "Authentication failed"
- API key format is invalid
- API key was revoked by the provider
- Rate limit exceeded (429 error)

### Keys become unreadable after browser change
- Expected behavior - keys are fingerprint-bound
- Users must re-enter API keys on new devices/browsers
- Consider implementing export/import if cross-device sync is needed

## Complete Example

```typescript
import { useBYOAI, BYOAI_CONFIG, createImageAnalysisOptions } from '@/lib/byoai';

interface TaskAnalysis {
  title: string;
  description: string;
}

function TaskCreator() {
  const ai = useBYOAI(BYOAI_CONFIG);
  
  const analyzeScreenshot = async (imageData: string) => {
    if (!ai.hasApiKey) {
      throw new Error('No API key configured');
    }
    
    const options = createImageAnalysisOptions<TaskAnalysis>(
      imageData,
      'Analyze this screenshot and extract a task title and description as JSON',
      (text) => {
        // Extract JSON from response
        const match = text.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : { title: '', description: '' };
      }
    );
    
    return await ai.call(options);
  };
  
  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

## Storage Versioning & Migration

BYOAI stores data with a `version` field. If you update the encryption algorithm or storage format, handle migration:

```typescript
// In your app initialization
const ai = useBYOAI(BYOAI_CONFIG);

// Check if stored data needs migration
const keyInfo = ai.getApiKeyInfo();
if (keyInfo && keyInfo.version !== '1.0') {
  // Old version detected - clear and prompt re-entry
  console.warn('Outdated encryption version, clearing stored keys');
  ai.clearAllData();
  
  // Notify user
  toast.info('Security update required. Please re-enter your API key.');
}
```

### Breaking Changes Checklist

If you modify BYOAI internals:
1. Update `version` in `encryption.ts` (line 48)
2. Increment `STORAGE_VERSION` constant in config
3. Add migration logic to handle old keys
4. Test migration path thoroughly
5. Document breaking changes for users

## Production Deployment Checklist

Before deploying BYOAI to production:

- [ ] HTTPS enabled (Web Crypto API requirement)
- [ ] CSP headers configured for `crypto.subtle`
- [ ] Error boundaries implemented for React components
- [ ] localStorage quota checks (5-10MB limit)
- [ ] Rate limiting/queuing for high-volume API calls
- [ ] Analytics for key save/removal events
- [ ] User documentation on key storage and limitations
- [ ] Fallback behavior when localStorage is unavailable
- [ ] Provider API cost monitoring and alerts
- [ ] Key expiry notifications (30-day default)

## License

This library is part of the Lovable ecosystem and follows the same license.
