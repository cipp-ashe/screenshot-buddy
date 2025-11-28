
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImage = (file: File | Blob): ValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds 5MB limit'
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'
    };
  }

  return { isValid: true };
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove any path traversal attempts and potentially harmful characters
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace any non-alphanumeric chars except dots and dashes
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .toLowerCase();
  
  return sanitized;
};

export const secureRandomId = (): string => {
  // Generate a cryptographically secure random ID
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(36)).join('-');
};
