'use client';

import { Bot, RefreshCcw, Send, Square, Trash2 } from 'lucide-react';
import React from 'react';

import { useAIChat } from '@/hooks/useAIChat';
import { useSocket } from '@/hooks/useSocket';
import { aiClient } from '@/lib/api/ai';

export function MunicipalityCopilot() {
  const [hasNewData, setHasNewData] = React.useState(false);
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    sendMessage,
    retryLast,
    stopGeneration,
    clearConversation
  } = useAIChat({
    apiFn: aiClient.streamMunicipalityCopilot,
    initialMessages: [
      { role: 'assistant', content: 'Welcome to Mission Control. How can I assist you with operational insights today?' }
    ]
  });

  useSocket({
    'dashboard.invalidated.v1': () => {
      setHasNewData(true);
      // Auto-hide the badge after 5 seconds
      setTimeout(() => setHasNewData(false), 5000);
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const suggestedPrompts = [
    'What are the most critical unresolved issues?',
    'Give me a breakdown of open issues by department',
    'Which SLAs are expiring soon?',
  ];

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      sendMessage(prompt);
    }, 0);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[500px] max-h-[800px] border border-white/10 bg-layer1 rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/20 text-accent">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Municipality Copilot
              {hasNewData && (
                <span className="bg-success/20 text-success text-[10px] px-1.5 py-0.5 rounded-full animate-pulse border border-success/30">
                  Data Updated
                </span>
              )}
            </h3>
            <p className="text-xs text-text-tertiary font-mono">Operations Analyst</p>
          </div>
        </div>
        <button 
          onClick={clearConversation}
          className="h-8 w-8 text-text-tertiary hover:text-white flex items-center justify-center rounded-md hover:bg-white/5 transition-colors" 
          title="Clear Chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
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
                onClick={() => msg.role === 'assistant' && copyToClipboard(msg.content)}
                title={msg.role === 'assistant' ? "Click to copy" : undefined}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {error && (
            <div className="flex justify-center flex-col items-center gap-2 my-2">
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-md font-mono">
                {error}
              </div>
              <button onClick={retryLast} className="flex items-center gap-1 text-xs text-text-tertiary hover:text-white transition-colors">
                <RefreshCcw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
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
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about SLA compliance..."
            className="flex-1 resize-none rounded-md border border-white/10 bg-layer2 px-3 py-2 text-sm text-white placeholder-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono min-h-[40px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stopGeneration}
              className="h-9 w-9 flex items-center justify-center shrink-0 rounded-md bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => sendMessage()}
              className="h-9 w-9 flex items-center justify-center shrink-0 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-colors"
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
