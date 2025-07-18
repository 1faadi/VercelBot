'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const inputRef = useRef<HTMLDivElement>(null);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const text = inputRef.current?.innerText.trim();
    if (!text) return;

    onSend(text);
    if (inputRef.current) {
      inputRef.current.innerText = '';
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full border-t border-gray-200 p-4">
      <div className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 shadow-sm">
        <div
          ref={inputRef}
          className={cn(
            'flex-1 min-h-[24px] max-h-40 overflow-y-auto outline-none text-sm whitespace-pre-wrap',
            disabled ? 'text-gray-400' : 'text-black'
          )}
          contentEditable={!disabled}
          role="textbox"
          data-placeholder="Type your message..."
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={disabled}
        >
          <ArrowUpIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
