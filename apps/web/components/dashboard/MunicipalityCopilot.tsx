'use client';

import { Bot, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function MunicipalityCopilot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to Mission Control. How can I assist you with operational insights today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming authorization is handled securely via cookies/Next-Auth or similar mechanism in this app.
          // Wait, if it requires 'Bearer token', we might need to get the session token.
          // Since it's using next-auth and our Next.js API proxy attaches headers, we should be fine, or we can use next-auth's useSession.
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized. You must have admin or municipality role.');
        }
        throw new Error('Network response was not ok');
      }
      if (!response.body) throw new Error('No readable stream available');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

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
                  const lastMessage = prev[prev.length - 1];
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + parsed },
                  ];
                });
              } catch (e: any) {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err.message || 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    'What are the most critical unresolved issues?',
    'Give me a breakdown of open issues by department',
    'Which SLAs are expiring soon?',
  ];

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    // Let state update before submitting
    setTimeout(() => {
      // Create a synthetic event
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }, 0);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[500px] max-h-[800px] border border-white/10 bg-layer1 rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-muted/20 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/20 text-accent">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Municipality Copilot</h3>
          <p className="text-xs text-text-tertiary font-mono">Operations Analyst</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-layer2/50 relative">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-accent text-accent-foreground rounded-tr-none'
                    : 'bg-layer3 border border-white/5 text-text-secondary rounded-tl-none font-mono text-xs'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-lg rounded-tl-none bg-layer3 border border-white/5 px-4 py-3">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent delay-150" />
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent delay-300" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggested Prompts overlay when empty */}
        {messages.length === 1 && !isLoading && (
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 mt-4">
            <p className="text-xs text-text-tertiary font-mono mb-1">Suggested prompts:</p>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handlePromptClick(prompt)}
                className="text-left px-3 py-2 text-xs bg-layer3 border border-white/5 hover:border-accent/50 hover:bg-accent/10 rounded-md transition-colors text-text-secondary"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/5 bg-layer1 p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SLA compliance..."
            className="flex-1 rounded-md border border-white/10 bg-layer2 px-3 py-2 text-sm text-white placeholder-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="h-9 w-9 flex items-center justify-center shrink-0 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-colors"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
