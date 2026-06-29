import { AIMessage } from '@community-os/types';

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Helper to make a streaming AI request.
 */
async function streamAIRequest(endpoint: string, messages: AIMessage[], signal?: AbortSignal): Promise<Response> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    let details;
    try {
      details = await response.json();
    } catch {
      // Not JSON, ignore
    }
    throw new APIError(response.status, response.statusText || 'Network response was not ok', details);
  }

  if (!response.body) {
    throw new APIError(500, 'No readable stream available');
  }

  return response;
}

export const aiClient = {
  streamCitizenAssistant: (messages: AIMessage[], signal?: AbortSignal) =>
    streamAIRequest('/api/ai/assistant/citizen', messages, signal),

  streamMunicipalityCopilot: (messages: AIMessage[], signal?: AbortSignal) =>
    streamAIRequest('/api/ai/assistant/copilot', messages, signal),
    
  analyzeIssue: (messages: AIMessage[], signal?: AbortSignal) =>
    streamAIRequest('/api/ai/analyze', messages, signal),
    
  predictPriority: (messages: AIMessage[], signal?: AbortSignal) =>
    streamAIRequest('/api/ai/predict', messages, signal),
};
