export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';

export interface AIMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: AIMessage[];
}

export interface StreamChunk {
  content?: string;
  error?: string;
  done?: boolean;
}

export interface AIError {
  code: number;
  message: string;
  details?: unknown;
}

export interface ChatResponse {
  message?: string;
  error?: AIError;
}
