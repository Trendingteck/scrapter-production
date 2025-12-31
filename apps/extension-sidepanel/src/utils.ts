import { ParsedAgentResponse } from './types/message';

export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Parses the raw agent response string into structured blocks for the UI.
 * Handles streaming (incomplete blocks) and cleans up formatting.
 */
export const parseAgentBlocks = (text: string): ParsedAgentResponse => {
  // 1. Clean accidental prefixes or excessive whitespace
  let cleanedText = text;
  if (!text.startsWith('[') && text.length > 0) {
    // Remove "CHAT: " or similar prefixes if the model hallucinates them
    cleanedText = text.replace(/^(CHAT|TASK|PROTOCOL)(\s*[-:]?\s*)/i, '');
  }

  const result: ParsedAgentResponse = {
    initial: null,
    logs: [],
    question: null,
    final: null,
    raw: cleanedText
  };

  const blockTags = ['INITIAL_RESPONSE', 'THINKING', 'ACTION', 'QUESTION', 'FINAL_RESPONSE'];

  // Robust check: Only treat as blocks if we see a valid tag at start or after newline
  const blockCheck = new RegExp(`(?:^|\\n)\\[(${blockTags.join('|')})\\]`);

  // Quick check: If no blocks at all, treat as Chat
  if (!blockCheck.test(cleanedText)) {
    if (cleanedText.length > 0) {
      result.initial = cleanedText;
    }
    return result;
  }

  // 1. Extract Initial Response
  const initialMatch = cleanedText.match(/\[INITIAL_RESPONSE\]([\s\S]*?)(\[\/INITIAL_RESPONSE\]|\[(THINKING|ACTION|QUESTION|FINAL_RESPONSE)\]|$)/);

  if (initialMatch) {
    result.initial = initialMatch[1].trim();
  } else {
    // If no explicit INITIAL_RESPONSE tag, check text before the first "Action/Thinking" tag
    const firstTagMatch = cleanedText.match(/(?:^|\n)\[(THINKING|ACTION|QUESTION|FINAL_RESPONSE)\]/);
    if (firstTagMatch && firstTagMatch.index !== undefined) {
      const cutIndex = firstTagMatch.index;
      const preText = cleanedText.substring(0, cutIndex).trim();
      if (preText) result.initial = preText;
    }
  }

  // 2. Extract Logs AND Questions
  const logRegex = /(?:^|\n)\[(THINKING|ACTION|QUESTION)\]([\s\S]*?)(?=\[\/(?:THINKING|ACTION|QUESTION)\]|(?:^|\n)\[(?:INITIAL_RESPONSE|THINKING|ACTION|QUESTION|FINAL_RESPONSE)\]|$)/g;

  let match;
  while ((match = logRegex.exec(cleanedText)) !== null) {
    const type = match[1];
    let content = match[2];

    // cleanup: remove closing tag if regex overshot
    content = content.replace(new RegExp(`\\[\\/${type}\\]$`), '');

    // cleanup: replace literal "\n" strings with actual newlines
    content = content.replace(/\\n/g, '\n');

    // cleanup: trim excessive whitespace
    content = content.trim();

    if (content || type) {
      if (type === 'QUESTION') {
        result.question = content;
      } else {
        result.logs.push(`[${type}] ${content}`);
      }
    }
  }

  // 3. Extract Final Response
  const finalMatch = cleanedText.match(/\[FINAL_RESPONSE\]([\s\S]*?)(\[\/FINAL_RESPONSE\]|$)/);
  if (finalMatch) {
    result.final = finalMatch[1].trim();
  } else {
    // Implicit Final: Text after the last known block tag
    const tagPattern = /(?:^|\n)\[(\/?)(INITIAL_RESPONSE|THINKING|ACTION|QUESTION|FINAL_RESPONSE)\]/g;
    let lastTagMatch = null;
    let currentMatch;

    while ((currentMatch = tagPattern.exec(cleanedText)) !== null) {
      lastTagMatch = {
        full: currentMatch[0],
        isClose: currentMatch[1] === '/',
        name: currentMatch[2],
        endIndex: currentMatch.index + currentMatch[0].length
      };
    }

    if (lastTagMatch) {
      const isLogTag = ['THINKING', 'ACTION', 'QUESTION'].includes(lastTagMatch.name);

      // Scenario A: We are inside an open Log tag.
      if (isLogTag && !lastTagMatch.isClose) {
        result.final = null;
      }
      // Scenario B: Last tag was a closing tag or INITIAL_RESPONSE
      else {
        const trailing = cleanedText.substring(lastTagMatch.endIndex).trim();
        if (trailing.length > 0) {
          result.final = trailing;
        }
      }
    }
  }

  return result;
};