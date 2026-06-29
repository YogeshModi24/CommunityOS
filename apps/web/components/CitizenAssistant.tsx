'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bot, RefreshCcw, Send, Square, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

import { useAIChat } from '@/hooks/useAIChat';
import { aiClient } from '@/lib/api/ai';

export function CitizenAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  
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
    apiFn: aiClient.streamCitizenAssistant,
    initialMessages: [
      { role: 'assistant', content: 'Hi! I am your Citizen Assistant. Do you need help reporting a civic issue?' }
    ]
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[350px] origin-bottom-right sm:w-[450px]"
          >
            <div className="flex h-[500px] flex-col overflow-hidden border border-border/50 bg-layer1 rounded-xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Citizen Assistant</h3>
                    <p className="text-xs text-muted-foreground">AI Support Agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={clearConversation}
                    className="h-8 w-8 text-text-muted hover:text-white flex items-center justify-center rounded-md hover:bg-layer2" 
                    title="Clear Chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 text-text-muted hover:text-white flex items-center justify-center rounded-md hover:bg-layer2" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted rounded-tl-sm'
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
                      <div className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-md">
                        {error}
                      </div>
                      <button onClick={retryLast} className="flex items-center gap-1 text-xs text-text-secondary hover:text-white transition-colors">
                        <RefreshCcw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  )}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                      <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 delay-150" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 delay-300" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border/50 bg-muted/10 p-3">
                <div className="flex items-center gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    className="flex-1 resize-none rounded-2xl border border-border/50 bg-background px-4 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[40px] max-h-[120px]"
                    rows={1}
                    disabled={isLoading}
                  />
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={stopGeneration}
                      className="h-9 w-9 flex items-center justify-center shrink-0 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                    >
                      <Square className="h-4 w-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sendMessage()}
                      className="h-9 w-9 flex items-center justify-center shrink-0 rounded-full bg-citizen text-white hover:bg-citizen/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <button
              className="h-14 w-14 flex items-center justify-center rounded-full shadow-xl hover:scale-105 transition-transform bg-citizen text-white"
              onClick={() => setIsOpen(true)}
            >
              <Bot className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
