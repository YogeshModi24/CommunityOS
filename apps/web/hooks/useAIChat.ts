import { AIMessage } from '@community-os/types';
import { useCallback, useRef, useState } from 'react';

import { APIError } from '../lib/api/ai';

interface UseAIChatOptions {
  apiFn: (messages: AIMessage[], signal?: AbortSignal) => Promise<Response>;
  initialMessages?: AIMessage[];
}

export function useAIChat({ apiFn, initialMessages = [] }: UseAIChatOptions) {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastRequestMessages = useRef<AIMessage[]>([]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const getErrorMessage = (err: any): string => {
    if (err instanceof APIError) {
      switch (err.status) {
        case 401: return 'Session expired. Please log in again.';
        case 403: return 'Insufficient permissions to access this AI feature.';
        case 404: return 'AI endpoint unavailable.';
        case 429: return 'Rate limit exceeded. Please wait a moment.';
        case 500: return 'AI service is temporarily unavailable.';
        default: return err.message || 'An unexpected error occurred.';
      }
    }
    if (err.name === 'AbortError') {
      return 'Generation stopped.';
    }
    return err.message || 'Network response was not ok';
  };

  const streamResponse = async (requestMessages: AIMessage[]) => {
    setIsLoading(true);
    setError(null);
    lastRequestMessages.current = requestMessages;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await apiFn(requestMessages, controller.signal);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder();
      let done = false;

      // Append an empty assistant message to start streaming into
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(data);
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  lastMessage.content += parsed;
                  return newMessages;
                });
                scrollToBottom();
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      // Revert the empty placeholder if it failed immediately
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      scrollToBottom();
    }
  };

  const sendMessage = useCallback(async (content?: string) => {
    const textToSend = content ?? input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: textToSend } as AIMessage];
    setMessages(newMessages);
    
    await streamResponse(newMessages);
  }, [input, isLoading, messages]);

  const retryLast = useCallback(async () => {
    if (isLoading || lastRequestMessages.current.length === 0) return;
    // Strip the last assistant message if we are retrying a failed attempt
    const newMessages = messages.filter((m, idx, arr) => 
      !(idx === arr.length - 1 && m.role === 'assistant')
    );
    setMessages(newMessages);
    await streamResponse(lastRequestMessages.current);
  }, [isLoading, messages]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages(initialMessages);
    setError(null);
    setInput('');
    lastRequestMessages.current = [];
  }, [initialMessages]);

  const appendSystemMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: 'system', content }]);
  }, []);

  const reset = useCallback(() => {
    stopGeneration();
    clearConversation();
  }, [stopGeneration, clearConversation]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    sendMessage,
    retryLast,
    stopGeneration,
    clearConversation,
    appendSystemMessage,
    reset,
    scrollToBottom
  };
}
