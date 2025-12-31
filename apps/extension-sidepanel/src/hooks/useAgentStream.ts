import { useState, useRef, useEffect, useCallback } from 'react';
import { AgentMessage, AgentBlockType, AgentBlockState } from '../types/agent';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useAgentStream() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const portRef = useRef<chrome.runtime.Port | null>(null);

  // Initialize Connection
  useEffect(() => {
    try {
      portRef.current = chrome.runtime.connect({ name: 'side-panel-connection' });

      const listener = (msg: any) => {
        if (msg.type === 'execution') {
          // Task level events
          if (msg.state === 'task.ok' || msg.state === 'task.fail' || msg.state === 'task.cancel') {
            setIsProcessing(false);
            setIsWaitingForInput(false);
            finalizeLastMessage();
          } else if (msg.state === 'task.pause') {
            setIsWaitingForInput(true);
            setIsProcessing(false);
          }
        } else if (msg.type === 'error') {
          appendSystemMessage(`Error: ${msg.error}`);
          setIsProcessing(false);
          setIsWaitingForInput(false);
        } else {
          // Streaming events (token, block_start, etc.)
          handleStreamEvent(msg);
        }
      };

      portRef.current.onMessage.addListener(listener);
    } catch (e) {
      console.error("Connection failed", e);
    }

    return () => {
      try { portRef.current?.disconnect(); } catch (e) { }
    };
  }, []);

  const finalizeLastMessage = () => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.isStreaming) {
        return [
          ...prev.slice(0, -1),
          { ...last, isStreaming: false, blocks: last.blocks.map(b => ({ ...b, isOpen: false })) }
        ];
      }
      return prev;
    });
  };

  const appendSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'system',
      content: text,
      blocks: [],
      timestamp: Date.now(),
      isStreaming: false
    }]);
  };

  const handleStreamEvent = (event: any) => {
    setMessages(prev => {
      const lastIdx = prev.length - 1;
      const lastMsg = prev[lastIdx];

      // Ensure we are editing the assistant's message
      if (!lastMsg || lastMsg.role !== 'assistant') return prev;

      const newMsg = { ...lastMsg, blocks: [...lastMsg.blocks] };

      switch (event.type) {
        case 'block_start':
          // Close previous if open
          const lastBlockIdx = newMsg.blocks.length - 1;
          if (lastBlockIdx >= 0) newMsg.blocks[lastBlockIdx].isOpen = false;

          newMsg.blocks.push({
            type: (event.block as AgentBlockType) || AgentBlockType.THINKING,
            content: '',
            isOpen: true
          });
          break;

        case 'token':
          // SIMPLIFIED: Just append to raw content
          // The parseAgentBlocks utility handles parsing at render time
          newMsg.content += (event.content || '');

          // Also update block content for legacy compatibility
          const currentBlockIdx = newMsg.blocks.length - 1;
          if (currentBlockIdx >= 0) {
            newMsg.blocks[currentBlockIdx].content += (event.content || '');
          }
          break;

        case 'block_end':
          const endBlockIdx = newMsg.blocks.length - 1;
          if (endBlockIdx >= 0) newMsg.blocks[endBlockIdx].isOpen = false;
          break;

        case 'tool_call':
          // Check if we already have an "acting" block from the stream parser
          const toolBlockIdx = newMsg.blocks.length - 1;
          if (toolBlockIdx >= 0 && newMsg.blocks[toolBlockIdx].type === AgentBlockType.ACTION && !newMsg.blocks[toolBlockIdx].toolName) {
            newMsg.blocks[toolBlockIdx].toolName = event.name;
            newMsg.blocks[toolBlockIdx].toolArgs = event.args;
            newMsg.blocks[toolBlockIdx].isOpen = true;
          } else {
            if (toolBlockIdx >= 0) newMsg.blocks[toolBlockIdx].isOpen = false;
            newMsg.blocks.push({
              type: AgentBlockType.ACTION,
              content: '',
              isOpen: true,
              toolName: event.name,
              toolArgs: event.args
            });
          }
          break;

        case 'tool_result':
          // Attach result to the last ACTION block
          for (let i = newMsg.blocks.length - 1; i >= 0; i--) {
            if (newMsg.blocks[i].type === AgentBlockType.ACTION) {
              newMsg.blocks[i].toolResult = event.content;
              newMsg.blocks[i].isOpen = false;
              break;
            }
          }
          break;
      }

      const newMessages = [...prev];
      newMessages[lastIdx] = newMsg;
      return newMessages;
    });
  };

  const startTask = (task: string, attachment?: any) => {
    const isFollowUp = isWaitingForInput;
    setIsProcessing(true);
    setIsWaitingForInput(false);

    const userMsg: AgentMessage = {
      id: generateId(),
      role: 'user',
      content: task,
      blocks: [],
      timestamp: Date.now(),
      isStreaming: false,
      attachment
    };

    // Placeholder for AI response
    const aiMsg: AgentMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      blocks: [], // Will be filled by stream
      timestamp: Date.now() + 1,
      isStreaming: true
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);

    // Send to Background
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        portRef.current?.postMessage({
          type: 'new_task',
          task,
          taskId: generateId(),
          tabId: tabs[0].id,
          isFollowUp
        });
      }
    });
  };

  const stopTask = () => {
    portRef.current?.postMessage({ type: 'cancel_task' });
    setIsProcessing(false);
    setIsWaitingForInput(false);
  };

  const clearMessages = () => {
    setMessages([]);
    setIsProcessing(false);
    setIsWaitingForInput(false);
  };

  const onReply = (text: string) => {
    startTask(text);
  };

  return { messages, isProcessing, isWaitingForInput, startTask, stopTask, clearMessages, onReply };
}