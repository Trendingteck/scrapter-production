import React, { useEffect, useRef } from 'react';
import { AgentMessage } from '../types/agent';
import { RichMessage } from './RichMessage';

interface MessageListProps {
  messages: AgentMessage[];
  onReply: (text: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onReply }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages[messages.length - 1]?.blocks.length, messages[messages.length - 1]?.blocks[messages[messages.length - 1]?.blocks.length - 1]?.content]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-custom">
      {messages.map((msg) => (
        <RichMessage key={msg.id} message={msg} onReply={onReply} />
      ))}
      <div ref={bottomRef} className="h-8" />
    </div>
  );
};

export default MessageList;