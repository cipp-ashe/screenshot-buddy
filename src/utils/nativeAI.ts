/**
 * Native AI integration - App-specific implementation
 * This is NOT part of the BYOAI library
 */

const WORKER_URL = 'https://gemini-image.ashley-delnet.workers.dev/';

export interface TaskAnalysisResult {
  title: string;
  description: string;
  capturedText: string;
}

/**
 * App-specific prompt for task analysis
 */
export const TASK_PROMPT = `Analyze this screenshot/image for a task management system. Create a detailed breakdown with these sections:

1. Task Title: Create a practical, action-oriented title that describes what needs to be done or what information needs to be tracked (max 50 characters).

2. Summary Description: Write 2-3 sentences that:
   - Describe the main content or purpose
   - Explain why this screenshot was captured
   - Highlight any key information that needs attention

3. Captured Text: If the image contains text, extract the most important text elements. Focus on:
   - Error messages
   - Important notifications
   - Key data points
   - User interface text that needs to be referenced

Format the response exactly like this JSON:
{
  "title": "Action-oriented task title here",
  "description": "Summary of what this screenshot shows and why it was captured. Include context about what needs to be done or tracked.",
  "capturedText": "Any relevant text extracted from the image that would be useful to reference later. If no relevant text, return empty string."
}`;

/**
 * Parse Gemini response into TaskAnalysisResult
 */
export const parseTaskResponse = (rawText: string): TaskAnalysisResult => {
  let cleanedText = rawText;

  // Try to extract JSON from markdown
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    cleanedText = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(cleanedText);
    return {
      title: parsed.title || 'New Image Task',
      description: parsed.description || 'Add a description for your task',
      capturedText: parsed.capturedText || '',
    };
  } catch {
    return {
      title: 'New Image Task',
      description: 'Image contains text that couldn\'t be fully analyzed.',
      capturedText: cleanedText,
    };
  }
};

/**
 * Analyze image using native worker (no API key required)
 */
export async function analyzeWithNativeAI(imageData: string): Promise<TaskAnalysisResult> {
  const base64Data = imageData.split(',')[1];

  // Detect mime type from data URL
  let mimeType = 'image/jpeg'; // default
  if (imageData.includes('data:')) {
    const match = imageData.match(/data:([^;]+);/);
    if (match) mimeType = match[1];
  }

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { text: TASK_PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      }],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Worker request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Parse worker response
  if (data && typeof data === 'object') {
    const title = data.title || 'New Image Task';
    const description = data.description || 'Unable to analyze image properly.';
    const capturedText = data.capturedText || '';

    // Check if description contains embedded JSON
    if (typeof description === 'string' && description.includes('```json')) {
      const extracted = parseTaskResponse(description);
      if (extracted) return extracted;
    }

    return { title, description, capturedText };
  }

  return {
    title: 'New Image Task',
    description: 'Unable to analyze image properly.',
    capturedText: '',
  };
}
